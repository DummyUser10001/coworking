const { LandmarkService } = require('../../src/services/landmarkService');
const prisma = require('../../src/prismaClient');

describe('LandmarkService', () => {
  let landmarkService;

  beforeEach(() => {
    landmarkService = new LandmarkService();
  });

  describe('getAllLandmarks', () => {
    it('должен вернуть все ориентиры', async () => {
      const mockLandmarks = [{ id: 1 }];
      prisma.landmark.findMany.mockResolvedValue(mockLandmarks);

      const result = await landmarkService.getAllLandmarks();

      expect(result).toEqual(mockLandmarks);
    });
  });

  describe('getLandmarkById', () => {
    it('должен вернуть ориентир по ID', async () => {
      const mockLandmark = { id: 1 };
      prisma.landmark.findUnique.mockResolvedValue(mockLandmark);

      const result = await landmarkService.getLandmarkById(1);

      expect(result).toEqual(mockLandmark);
    });

    it('должен выбросить ошибку, если ориентир не найден', async () => {
      prisma.landmark.findUnique.mockResolvedValue(null);

      await expect(landmarkService.getLandmarkById(1))
        .rejects.toThrow('Landmark not found');
    });
  });

  describe('createLandmark', () => {
    it('должен создать ориентир', async () => {
      const mockLandmark = { id: 1 };
      prisma.landmark.create.mockResolvedValue(mockLandmark);

      const data = { floorId: 1, type: 'Test', x: 10, y: 10 };
      const result = await landmarkService.createLandmark(data);

      expect(result).toEqual(mockLandmark);
    });
  });

  describe('updateLandmark', () => {
    it('должен обновить ориентир', async () => {
      const mockLandmark = { id: 1 };
      prisma.landmark.update.mockResolvedValue(mockLandmark);

      const data = { type: 'New' };
      const result = await landmarkService.updateLandmark(1, data);

      expect(result).toEqual(mockLandmark);
    });
  });

  describe('deleteLandmark', () => {
    it('должен удалить ориентир', async () => {
      prisma.landmark.delete.mockResolvedValue({});

      await landmarkService.deleteLandmark(1);

      expect(prisma.landmark.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});