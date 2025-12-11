const { UserService } = require('../../src/services/userService');
const prisma = require('../../src/prismaClient');
const bcrypt = require('bcryptjs');

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('getAllUsers', () => {
    it('должен вернуть всех пользователей', async () => {
      const mockUsers = [{ id: 1 }];
      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
    });
  });

  describe('getManagers', () => {
    it('должен вернуть менеджеров', async () => {
      const mockManagers = [{ id: 1 }];
      prisma.user.findMany.mockResolvedValue(mockManagers);

      const result = await userService.getManagers();

      expect(result).toEqual(mockManagers);
    });
  });

  describe('getClients', () => {
    it('должен вернуть клиентов', async () => {
      const mockClients = [{ id: 1 }];
      prisma.user.findMany.mockResolvedValue(mockClients);

      const result = await userService.getClients();

      expect(result).toEqual(mockClients);
    });
  });

  describe('createUser', () => {
    it('должен создать пользователя', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed');
      const mockUser = { id: 1 };
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await userService.createUser('test@email.com', 'password', 'First', 'Last', 'Middle', 'CLIENT');

      expect(result).toEqual(mockUser);
    });

    it('должен выбросить ошибку при неверной роли', async () => {
      await expect(userService.createUser('test@email.com', 'password', 'First', 'Last', 'Middle', 'INVALID'))
        .rejects.toThrow('Invalid role');
    });

    it('должен выбросить ошибку, если пользователь существует', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 });

      await expect(userService.createUser('test@email.com', 'password', 'First', 'Last', 'Middle', 'CLIENT'))
        .rejects.toThrow('User with this email already exists');
    });
  });

  describe('updateUser', () => {
    it('должен обновить пользователя', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 1, email: 'old' });
      prisma.user.findUnique.mockResolvedValueOnce(null);
      const mockUser = { id: 1 };
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await userService.updateUser(1, 'new@email.com');

      expect(result).toEqual(mockUser);
    });

    it('должен выбросить ошибку, если пользователь не найден', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.updateUser(1, 'new@email.com'))
        .rejects.toThrow('User not found');
    });

    it('должен выбросить ошибку, если email уже существует', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 1, email: 'old' });
      prisma.user.findUnique.mockResolvedValueOnce({ id: 2 });

      await expect(userService.updateUser(1, 'existing@email.com'))
        .rejects.toThrow('User with this email already exists');
    });
  });

  describe('deleteUser', () => {
    it('должен удалить пользователя', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 });
      prisma.user.delete.mockResolvedValue({});

      await userService.deleteUser(1, 2);

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('должен выбросить ошибку, если пользователь не найден', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.deleteUser(1, 2))
        .rejects.toThrow('User not found');
    });

    it('должен выбросить ошибку при попытке удалить себя', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 });

      await expect(userService.deleteUser(1, 1))
        .rejects.toThrow('Cannot delete your own account');
    });
  });
});