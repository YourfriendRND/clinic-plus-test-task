import bcrypt from 'bcryptjs';
import type { DataSource } from 'typeorm';
import { RoleCode } from '../../modules/auth/role-code.enum';
import { Role } from '../../modules/auth/entities/role';
import { User } from '../../modules/auth/entities/user';
import { OrderStatus } from '../../modules/orders/order-status.enum';
import { Order } from '../../modules/orders/entities/order';

const DEMO_PASSWORD = 'password';

const seedRoles: Array<{ name: string; code: RoleCode }> = [
  { name: 'Оператор', code: RoleCode.Operator },
  { name: 'Бригада', code: RoleCode.Team },
];

const seedUsers: Array<{ fullName: string; phone: string; roleCode: RoleCode }> = [
  { fullName: 'Иванов Иван Иванович', phone: '79001111111', roleCode: RoleCode.Operator },
  { fullName: 'Петров Пётр Петрович', phone: '79002222222', roleCode: RoleCode.Team },
  { fullName: 'Сидорова Анна Сергеевна', phone: '79003333333', roleCode: RoleCode.Team },
];

const seedOrders: Array<{
  address: string;
  executionDate: string;
  description: string;
  status: OrderStatus;
  executorPhone: string | null;
}> = [
  {
    address: 'ул. Ленина, 10',
    executionDate: '2026-08-20',
    description: 'Подключение оборудования',
    status: OrderStatus.InProgress,
    executorPhone: '79002222222',
  },
  {
    address: 'пр. Мира, 5',
    executionDate: '2026-08-21',
    description: 'Выезд на объект',
    status: OrderStatus.New,
    executorPhone: null,
  },
];

export async function seedDatabase(dataSource: DataSource): Promise<void> {
  const roles = dataSource.getRepository(Role);
  const users = dataSource.getRepository(User);
  const orders = dataSource.getRepository(Order);

  if (await users.findOneBy({ phone: seedUsers[0].phone })) {
    return;
  }

  const roleByCode = new Map<RoleCode, Role>();

  for (const item of seedRoles) {
    const role =
      (await roles.findOneBy({ code: item.code })) ??
      (await roles.save(roles.create({ name: item.name, code: item.code })));
    roleByCode.set(item.code, role);
  }

  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  const userByPhone = new Map<string, User>();

  for (const item of seedUsers) {
    const role = roleByCode.get(item.roleCode);

    if (!role) {
      throw new Error(`Seed: role not found (${item.roleCode})`);
    }

    const user = await users.save(
      users.create({
        fullName: item.fullName,
        phone: item.phone,
        password,
        role,
      }),
    );
    userByPhone.set(item.phone, user);
  }

  await orders.save(
    seedOrders.map((item) => {
      const executor = item.executorPhone ? userByPhone.get(item.executorPhone) : null;

      if (item.executorPhone && !executor) {
        throw new Error(`Seed: executor not found (${item.executorPhone})`);
      }

      return orders.create({
        address: item.address,
        executionDate: item.executionDate,
        description: item.description,
        status: item.status,
        executor: executor ?? null,
      });
    }),
  );

  console.log(`Seed: demo users (password: ${DEMO_PASSWORD})`);
  for (const item of seedUsers) {
    console.log(`  ${item.roleCode}  ${item.phone}`);
  }
}
