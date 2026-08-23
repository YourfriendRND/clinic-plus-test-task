# Система нарядов (Клиника Плюс)

Веб-приложение для оператора и бригад: создать наряд, назначить исполнителя, менять статус. Список обновляется сам, без обновления страницы.

Исходное техническое задание: [tech.md](./tech.md).

Ниже - как запустить проект и куда нажимать. Есть **два способа**. Для проверки сдачи удобнее **способ 1** (всё в Docker). Способ 2 - если хотите корректировать код.

---

## Что должно быть установлено заранее

1. **Docker Desktop** (или Docker Engine + Docker Compose v2). Проверка: в терминале выполните `docker version` и `docker compose version`. Должны появиться номера версий, а не ошибка «команда не найдена».
2. Для **способа 2** ещё нужен **Node.js 22 или новее**. Проверка: `node -v`. Должно быть `v22...` или выше.
3. Склонируйте этот репозиторий и откройте папку проекта в терминале. Все команды ниже выполняются **из корня репозитория** (там лежат `package.json` и `docker-compose.production.yml`).

Не запускайте способ 1 и способ 2 **одновременно**: оба хотят порты Postgres / Redis / RabbitMQ.

---

## Способ 1. Всё в Docker

Поднимаются Postgres, Redis, RabbitMQ, две копии API, веб-интерфейс и nginx. Снаружи открывается один адрес - сайт.

### 1.1. Файл с настройками

В репозитории есть образец `.env.example`. Скопируйте его в файл **с любым именем** (например `production.env`). Это имя потом один раз пишете в команде — в YAML его нет.

Windows (PowerShell):

```powershell
copy .env.example production.env
```

macOS / Linux:

```bash
cp .env.example production.env
```

Дальше в примерах стоит `production.env`. Если назвали файл иначе — подставьте своё имя.

### 1.2. Что поменять в этом файле

Для Docker хосты — **имена сервисов**, не `localhost`. Иначе API будет стучаться сам в себя и не найдёт базу.

Оставьте или приведите файл к такому виду (пароли можете заменить на свои, тогда поменяйте их **везде**, в том числе внутри `RABBITMQ_URL`):

```env
ENV_FILE=./production.env
API_PORT=4000
API_ORIGIN=http://localhost:4000
NGINX_PORT=80
SESSION_SECRET=change-to-random-string
COOKIE_SECURE=false

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=clinic
POSTGRES_PASSWORD=clinic
POSTGRES_DB=clinic_plus

REDIS_PORT=6379
REDIS_URL=redis://redis:6379

RABBITMQ_USER=clinic
RABBITMQ_PASSWORD=clinic
RABBITMQ_PORT=5672
RABBITMQ_MANAGEMENT_PORT=15672
RABBITMQ_URL=amqp://clinic:clinic@rabbitmq:5672
```

Важные мелочи:

- `ENV_FILE` — путь к **этому же** файлу. В команде пишете `--env-file ./production.env`, здесь то же самое. Назвали файл иначе — поменяйте и `ENV_FILE`, и `--env-file`.
- `COOKIE_SECURE=false` - сайт открывается по **HTTP**. Если поставить `true`, браузер не сохранит cookie входа, и вас будет выкидывать на форму логина.
- `COOKIE_SECURE=true` имеет смысл только если перед приложением стоит настоящий HTTPS.
- `NGINX_PORT=80` - сайт будет на `http://localhost`. Если порт 80 занят, поставьте например `8080` и открывайте `http://localhost:8080`.
- `RABBITMQ_MANAGEMENT_PORT=15672` - панель RabbitMQ. Если порт занят (часто занят, если уже запущен способ 2), поставьте свободный, например `15673`, и открывайте `http://localhost:15673`.

### 1.3. Запуск

Имя файла — в команде, в `--env-file`. Сборка образов в первый раз может занять несколько минут.

```powershell
docker compose -f docker-compose.production.yml --env-file ./production.env up -d --build
```

Дождитесь конца без красных ошибок. Контейнер `api-migrate` один раз применяет миграции, кладёт демо-пользователей и **сам выключается** — так и задумано.

Посмотреть, что живое:

```powershell
docker compose -f docker-compose.production.yml --env-file ./production.env ps
```

У `api-1`, `api-2`, `postgres`, `redis`, `rabbitmq` в колонке статуса должно быть `healthy` или `running`. У `web` и `nginx` - `running`.

### 1.4. Куда заходить (способ 1)

Считаем, что `NGINX_PORT=80`. Если меняли порт — подставьте его вместо `:80` (для порта 80 в браузере `:80` писать не обязательно).

| Что | Ссылка |
| --- | --- |
| Сайт (вход) | http://localhost |
| Документация API (Swagger) | http://localhost/api/docs |
| Проверка, что API жив | http://localhost/api/health |
| Панель RabbitMQ | http://localhost:15672 |

Логин и пароль от панели RabbitMQ - те же, что `RABBITMQ_USER` и `RABBITMQ_PASSWORD` в вашем env-файле (в примере выше оба `clinic`).

Дальше - раздел [«Как войти»](#как-войти-код-из-двух-шагов). Код 2FA смотрите в логах **обоих** API (запрос может попасть на любую копию):

```powershell
docker compose -f docker-compose.production.yml --env-file ./production.env logs -f api-1 api-2
```

Ищите строку вида `2FA code for 79001111111: 123456`. Код живёт 5 минут. Остановить поток логов - `Ctrl+C` (контейнеры при этом не гаснут).

### 1.5. Остановить способ 1

Оставить данные в томах Docker:

```powershell
docker compose -f docker-compose.production.yml --env-file ./production.env down
```

Удалить и данные (база начнётся с нуля при следующем запуске):

```powershell
docker compose -f docker-compose.production.yml --env-file ./production.env down -v
```

---

## Способ 2. Сайт и API на локальном пк, инфраструктура в Docker

Так удобно разрабатывать: Postgres, Redis и RabbitMQ в Docker, а Node-приложения - через `npm`.

### 2.1. Файл `.env`

Скопируйте образец в файл именно с именем `.env` в **корне** репозитория (API и Next читают его оттуда).

Windows (PowerShell):

```powershell
copy .env.example .env
```

macOS / Linux:

```bash
cp .env.example .env
```

Для этого способа хосты должны быть **`localhost`**, как в `.env.example`. Не ставьте `postgres` / `redis` / `rabbitmq` - эти имена видны только внутри Docker-сети способа 1.

Минимум, который должен быть в `.env`:

```env
API_PORT=4000
API_ORIGIN=http://localhost:4000
SESSION_SECRET=dev-session-secret
COOKIE_SECURE=false

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=clinic
POSTGRES_PASSWORD=clinic
POSTGRES_DB=clinic_plus

REDIS_URL=redis://localhost:6379
REDIS_PORT=6379

RABBITMQ_USER=clinic
RABBITMQ_PASSWORD=clinic
RABBITMQ_PORT=5672
RABBITMQ_MANAGEMENT_PORT=15672
RABBITMQ_URL=amqp://clinic:clinic@localhost:5672
```

### 2.2. Поднять базу, Redis и RabbitMQ

```powershell
docker compose -f docker-compose.infra.yml up -d
```

Или то же самое: `npm run infra:up`.

Подождать несколько секунд, пока сервисы станут healthy: `npm run infra:ps`.

### 2.3. Установить зависимости

```powershell
npm install
```

### 2.4. Таблицы в базе

Один раз (и после новых миграций):

Если Postgres ругнётся на `uuid_generate_v4`, сначала включите расширение (команда одинаковая в PowerShell и в bash):

```powershell
docker compose -f docker-compose.infra.yml exec postgres psql -U clinic -d clinic_plus -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
```

Затем:

```powershell
npm run migration:run
```

Демо-пользователи создадутся сами при первом старте API (повторный старт их не дублирует).

### 2.5. Запустить API и сайт

```powershell
npm run dev
```

В терминале появятся два процесса: `api` и `web`. Их нельзя закрывать, пока вы пользуетесь приложением.

### 2.6. Куда заходить (способ 2)

| Что | Ссылка |
| --- | --- |
| Сайт (вход) | http://localhost:3000 |
| Документация API (Swagger), через сайт | http://localhost:3000/api/docs |
| Документация API напрямую | http://localhost:4000/docs |
| Проверка, что API жив | http://localhost:4000/health |
| Панель RabbitMQ | http://localhost:15672 |

Код 2FA печатается **в том же терминале**, где крутится `npm run dev`, в строках процесса `api`: `2FA code for ...`.

### 2.7. Остановить способ 2

В терминале с `npm run dev` нажмите `Ctrl+C`.

Инфраструктуру:

```powershell
docker compose -f docker-compose.infra.yml down
```

Или `npm run infra:down`. Данные Postgres/Redis/RabbitMQ при этом сохраняются в Docker-томах.

---

## Учётные записи для входа

Пароль у всех один: **`password`**.

Телефон в форме можно вводить как `79001111111` или `+79001111111`.

| Роль | ФИО | Телефон | Куда попадёте после входа |
| --- | --- | --- | --- |
| Оператор | Иванов Иван Иванович | `79001111111` | Список нарядов оператора |
| Бригада | Петров Пётр Петрович | `79002222222` | Кабинет бригады («Мои наряды») |
| Бригада | Сидорова Анна Сергеевна | `79003333333` | Кабинет бригады («Мои наряды») |

После входа оператор видит вкладки **Наряды** и **Бригады**. Бригада видит **Мои наряды** и **Все наряды**. Создавать и редактировать наряды может только оператор.

---

## Как войти (код из двух шагов)

СМС нет - это учебная имитация 2FA. Код пишется в лог API.

1. Откройте сайт (ссылка из раздела вашего способа).
2. Введите телефон и пароль, нажмите вход.
3. Сразу откройте логи API (команда из способа 1 или окно терминала из способа 2).
4. Найдите строку `2FA code for <телефон>: <шесть цифр>`.
5. Введите эти шесть цифр на сайте.

Если код «неверный или истёк» — запросите вход заново: код хранится 5 минут.

---

## Что проверить руками

1. **Swagger.** Откройте `/api/docs` (способ 1) или `http://localhost:4000/docs` (способ 2). Должна открыться документация API.
2. **Вход оператора и бригады.** Два окна браузера (лучше обычное + инкогнито, чтобы сессии не смешались): в одном Иванов, в другом Петров.
3. **Наряд.** Под оператором создайте наряд (адрес, дата, описание) или откройте уже существующий.
4. **Назначение.** Назначьте наряд на Петрова. У бригады в «Всех нарядах» и в «Моих» строка должна появиться/обновиться **без F5**. На вкладке «Мои наряды» у исполнителя может прозвучать короткий звук.
5. **Правка.** Поменяйте описание или дату. У бригады список тоже обновится сам.
6. **Статус.** Под бригадой на «Моих нарядах» переведите наряд «в работе» / «выполнен». У оператора статус сменится сам.
7. **RabbitMQ.** В панели http://localhost:15672 (логин/пароль из env) брокер должен быть живой. Само приложение при падении брокера HTTP-запросы нарядов всё равно выполняет.

---

## Если что-то не открывается

- **Сайт не грузится, порт 80.** Поменяйте `NGINX_PORT` в env-файле способа 1, снова `up -d`.
- **`Bind ... 15672 failed` / порт занят.** Остановите другой compose (`infra` или `production`) либо смените `RABBITMQ_MANAGEMENT_PORT`.
- **После ввода кода снова форма логина.** Для HTTP должно быть `COOKIE_SECURE=false`. Перезапустите контейнеры после правки env: та же команда `up -d` (без обязательной пересборки).
- **Способ 1: миграции не находят базу (`127.0.0.1:5432`).** В env для Docker стоит `POSTGRES_HOST=localhost`. Нужно `postgres`.
- **Нет кода 2FA.** Смотрите логи **api-1 и api-2** (способ 1) или терминал `api` (способ 2), затем повторите вход.
- **Сокеты не обновляют список.** Обновите обе вкладки браузера после входа. В логах API не должно сыпаться `Session ID unknown`.
