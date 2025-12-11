const { AuthService } = require('../../src/services/authService');
const prisma = require('../../src/prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('AuthService', () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('register', () => {
    it('должен зарегистрировать нового пользователя и вернуть токен', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 1 });
      bcrypt.hashSync.mockReturnValue('hashedPassword');
      jwt.sign.mockReturnValue('token');

      const result = await authService.register('test@email.com', 'password', 'First', 'Last', 'Middle');

      expect(result).toEqual({ token: 'token' });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@email.com',
          password: 'hashedPassword',
          firstName: 'First',
          lastName: 'Last',
          middleName: 'Middle',
          role: 'CLIENT',
        },
      });
    });

    it('должен выбросить ошибку, если пользователь уже существует', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 });

      await expect(authService.register('test@email.com', 'password', 'First', 'Last'))
        .rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    it('должен войти в систему и вернуть токен', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, password: 'hashedPassword' });
      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue('token');

      const result = await authService.login('test@email.com', 'password');

      expect(result).toEqual({ token: 'token' });
    });

    it('должен выбросить ошибку, если пользователь не найден', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.login('test@email.com', 'password'))
        .rejects.toThrow('User not found');
    });

    it('должен выбросить ошибку, если пароль неверный', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, password: 'hashedPassword' });
      bcrypt.compareSync.mockReturnValue(false);

      await expect(authService.login('test@email.com', 'wrong'))
        .rejects.toThrow('Invalid password');
    });
  });
});