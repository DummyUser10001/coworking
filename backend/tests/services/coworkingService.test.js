const { CoworkingService } = require('../../src/services/coworkingService');
const prisma = require('../../src/prismaClient');

describe('CoworkingService', () => {
  let coworkingService;

  beforeEach(() => {
    coworkingService = new CoworkingService();
  });

  describe('getAllCenters', () => {
    it('должен вернуть все центры', async () => {
      const mockCenters = [{ id: 1 }];
      prisma.coworkingCenter.findMany.mockResolvedValue(mockCenters);

      const result = await coworkingService.getAllCenters(false);

      expect(result).toEqual(mockCenters);
    });

    it('должен вернуть только активные центры', async () => {
      const mockCenters = [{ id: 1 }];
      prisma.coworkingCenter.findMany.mockResolvedValue(mockCenters);

      const result = await coworkingService.getAllCenters(true);

      expect(result).toEqual(mockCenters);
      expect(prisma.coworkingCenter.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: expect.any(Object)
      });
    });
  });

  describe('getCenterById', () => {
    it('должен вернуть центр по ID', async () => {
      const mockCenter = { id: 1 };
      prisma.coworkingCenter.findUnique.mockResolvedValue(mockCenter);

      const result = await coworkingService.getCenterById(1);

      expect(result).toEqual(mockCenter);
    });

    it('должен выбросить ошибку, если центр не найден', async () => {
      prisma.coworkingCenter.findUnique.mockResolvedValue(null);

      await expect(coworkingService.getCenterById(1))
        .rejects.toThrow('Coworking center not found');
    });
  });

  describe('createCenter', () => {
    it('должен создать центр', async () => {
      const mockCenter = { id: 1 };
      prisma.coworkingCenter.create.mockResolvedValue(mockCenter);

      const data = { address: 'Test', amenities: ['WIFI'] };
      const result = await coworkingService.createCenter(data);

      expect(result).toEqual(mockCenter);
    });

    it('должен выбросить ошибку при неверных удобствах', async () => {
      const data = { amenities: ['INVALID'] };

      await expect(coworkingService.createCenter(data))
        .rejects.toThrow('Invalid amenity: INVALID');
    });
  });

  describe('updateCenter', () => {
    it('должен обновить центр', async () => {
      const mockCenter = { id: 1 };
      prisma.coworkingCenter.update.mockResolvedValue(mockCenter);

      const data = { address: 'New' };
      const result = await coworkingService.updateCenter(1, data);

      expect(result).toEqual(mockCenter);
    });

    it('должен выбросить ошибку при неверных удобствах', async () => {
      const data = { amenities: ['INVALID'] };

      await expect(coworkingService.updateCenter(1, data))
        .rejects.toThrow('Invalid amenity: INVALID');
    });
  });

  describe('deleteCenter', () => {
    it('должен удалить центр', async () => {
      prisma.coworkingCenter.delete.mockResolvedValue({});

      await coworkingService.deleteCenter(1);

      expect(prisma.coworkingCenter.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});