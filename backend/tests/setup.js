// tests/setup.js

process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';

// Мокаем prismaClient
jest.mock('../src/prismaClient', () => {
  const mockedPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      update: jest.fn(),
    },
    discount: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
      groupBy: jest.fn(),
    },
    workstation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
    coworkingCenter: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    floor: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    landmark: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    inventoryItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(), // Добавлено: мок для groupBy
    },
    workstationColorSettings: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  // Добавлено: мок для fields (чтобы избежать undefined в field references)
  mockedPrisma.inventoryItem.fields = {
    totalQuantity: Symbol('totalQuantity'), // Символическая ссылка, достаточно для теста
  };

  return mockedPrisma;
});

// Мокаем bcryptjs
jest.mock('bcryptjs', () => ({
  hashSync: jest.fn(),
  compareSync: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Мокаем jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

// Мокаем вспомогательные модули
jest.mock('../src/discountCalculation.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../src/refundCalculation.js', () => ({
  calculateRefund: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});