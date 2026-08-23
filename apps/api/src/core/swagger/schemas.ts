const sessionUserExample = {
  id: '11111111-1111-4111-8111-111111111111',
  fullName: 'Иванов Иван Иванович',
  roleCode: 'operator',
};

const orderExecutorExample = {
  id: '22222222-2222-4222-8222-222222222222',
  fullName: 'Петров Пётр Петрович',
};

const orderExample = {
  id: '33333333-3333-4333-8333-333333333333',
  address: 'ул. Ленина, 10',
  executionDate: '2026-08-21',
  description: 'Подключение оборудования',
  status: 'in_progress',
  executor: orderExecutorExample,
};

export const swaggerSchemas = {
  HealthStatus: {
    type: 'object',
    required: ['status', 'database'],
    properties: {
      status: { type: 'string', example: 'ok' },
      database: { type: 'string', example: 'up' },
    },
    example: { status: 'ok', database: 'up' },
  },
  SessionUser: {
    type: 'object',
    required: ['id', 'fullName', 'roleCode'],
    properties: {
      id: { type: 'string', format: 'uuid', example: sessionUserExample.id },
      fullName: { type: 'string', example: sessionUserExample.fullName },
      roleCode: { type: 'string', enum: ['operator', 'team'], example: 'operator' },
    },
    example: sessionUserExample,
  },
  LoginRequest: {
    type: 'object',
    required: ['phone', 'password'],
    properties: {
      phone: { type: 'string', example: '79001111111' },
      password: { type: 'string', example: 'password' },
    },
  },
  LoginResponse: {
    type: 'object',
    required: ['verificationId'],
    properties: {
      verificationId: {
        type: 'string',
        format: 'uuid',
        example: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
    example: { verificationId: '550e8400-e29b-41d4-a716-446655440000' },
  },
  VerifyRequest: {
    type: 'object',
    required: ['verificationId', 'code'],
    properties: {
      verificationId: {
        type: 'string',
        format: 'uuid',
        example: '550e8400-e29b-41d4-a716-446655440000',
      },
      code: { type: 'string', example: '123456' },
    },
  },
  OrderExecutor: {
    type: 'object',
    required: ['id', 'fullName'],
    properties: {
      id: { type: 'string', format: 'uuid', example: orderExecutorExample.id },
      fullName: { type: 'string', example: orderExecutorExample.fullName },
    },
    example: orderExecutorExample,
  },
  Order: {
    type: 'object',
    required: ['id', 'address', 'executionDate', 'description', 'status', 'executor'],
    properties: {
      id: { type: 'string', format: 'uuid', example: orderExample.id },
      address: { type: 'string', example: orderExample.address },
      executionDate: { type: 'string', format: 'date', example: orderExample.executionDate },
      description: { type: 'string', example: orderExample.description },
      status: { type: 'string', enum: ['new', 'in_progress', 'done'], example: 'in_progress' },
      executor: {
        nullable: true,
        allOf: [{ $ref: '#/components/schemas/OrderExecutor' }],
      },
    },
    example: orderExample,
  },
  CreateOrderRequest: {
    type: 'object',
    required: ['address', 'executionDate', 'description'],
    properties: {
      address: { type: 'string', example: 'ул. Ленина, 10' },
      executionDate: { type: 'string', format: 'date', example: '2026-08-21' },
      description: { type: 'string', example: 'Подключение оборудования' },
    },
  },
  UpdateOrderRequest: {
    type: 'object',
    properties: {
      address: { type: 'string', example: 'ул. Ленина, 12' },
      executionDate: { type: 'string', format: 'date', example: '2026-08-22' },
      description: { type: 'string', example: 'Повторный выезд' },
    },
    example: {
      address: 'ул. Ленина, 12',
      executionDate: '2026-08-22',
      description: 'Повторный выезд',
    },
  },
  AssignOrderRequest: {
    type: 'object',
    required: ['executorId'],
    properties: {
      executorId: { type: 'string', format: 'uuid', example: orderExecutorExample.id },
    },
  },
  ChangeOrderStatusRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', enum: ['in_progress', 'done'], example: 'in_progress' },
    },
  },
  Team: {
    type: 'object',
    required: ['id', 'fullName', 'phone'],
    properties: {
      id: { type: 'string', format: 'uuid', example: orderExecutorExample.id },
      fullName: { type: 'string', example: orderExecutorExample.fullName },
      phone: { type: 'string', example: '79002222222' },
    },
    example: {
      id: orderExecutorExample.id,
      fullName: orderExecutorExample.fullName,
      phone: '79002222222',
    },
  },
};
