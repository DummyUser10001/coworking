const { ProfileService } = require('../../src/services/profileService');
const prisma = require('../../src/prismaClient');
const bcrypt = require('bcryptjs');

describe('ProfileService', () => {
  let profileService;

  beforeEach(() => {
    profileService = new ProfileService();
  });

  describe('getUserProfile', () => {
    it('должен вернуть профиль пользователя', async () => {
      const mockUser = { id: 1 };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await profileService.getUserProfile(1);

      expect(result).toEqual(mockUser);
    });

    it('должен выбросить ошибку, если пользователь не найден', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(profileService.getUserProfile(1))
        .rejects.toThrow('User not found');
    });
  });

  describe('updateUserProfile', () => {
    it('должен обновить профиль пользователя', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 });
      const mockUser = { id: 1 };
      prisma.user.update.mockResolvedValue(mockUser);

      const data = { firstName: 'New' };
      const result = await profileService.updateUserProfile(1, data);

      expect(result).toEqual(mockUser);
    });

    it('должен выбросить ошибку, если пользователь не найден', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(profileService.updateUserProfile(1, {}))
        .rejects.toThrow('User not found');
    });
  });

  describe('updateUserPassword', () => {
    it('должен обновить пароль пользователя', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, password: 'hashed' });
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('newhashed');
      prisma.user.update.mockResolvedValue({});

      const result = await profileService.updateUserPassword(1, 'current', 'new');

      expect(result.message).toBe('Password updated successfully');
    });

    it('должен выбросить ошибку, если пользователь не найден', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(profileService.updateUserPassword(1, 'current', 'new'))
        .rejects.toThrow('User not found');
    });

    it('должен выбросить ошибку, если текущий пароль неверный', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, password: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);

      await expect(profileService.updateUserPassword(1, 'wrong', 'new'))
        .rejects.toThrow('Current password is incorrect');
    });
  });
});