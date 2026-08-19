'use client';

import { useEffect, useState } from 'react';

type LoadState = 'loading' | 'ok' | 'error';

export default function Home() {
  const [state, setState] = useState<LoadState>('loading');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    fetch('/api/health')
      .then(async (response) => {
        const body = await response.text();
        if (!response.ok) {
          throw new Error(body || `HTTP ${response.status}`);
        }
        setDetail(body);
        setState('ok');
      })
      .catch((error: unknown) => {
        setDetail(error instanceof Error ? error.message : 'unknown error');
        setState('error');
      });
  }, []);

  return (
    <main className="flex flex-1 flex-col items-start gap-4 p-8">
      <h1 className="text-2xl font-semibold">Клиника Плюс</h1>
      <p>Проверка связи со скелетом API через rewrite /api/health.</p>
      {state === 'loading' ? <p>Запрос к API…</p> : null}
      {state === 'ok' ? <p>API: {detail}</p> : null}
      {state === 'error' ? (
        <p>
          API недоступен. Запустите `npm run dev` из корня репозитория. {detail}
        </p>
      ) : null}
    </main>
  );
}
