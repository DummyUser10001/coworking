const { FloorService } = require('../../src/services/floorService');
const prisma = require('../../src/prismaClient');

describe('FloorService', () => {
  let floorService;

  beforeEach(() => {
    floorService = new FloorService();
  });

  describe('getAllFloors', () => {
    it('должен вернуть все этажи', async () => {
      const mockFloors = [{ id: 1 }];
      prisma.floor.findMany.mockResolvedValue(mockFloors);

      const result = await floorService.getAllFloors();

      expect(result).toEqual(mockFloors);
    });
  });

  describe('getFloorById', () => {
    it('должен вернуть этаж по ID', async () => {
      const mockFloor = { id: 1 };
      prisma.floor.findUnique.mockResolvedValue(mockFloor);

      const result = await floorService.getFloorById(1);

      expect(result).toEqual(mockFloor);
    });

    it('должен выбросить ошибку, если этаж не найден', async () => {
      prisma.floor.findUnique.mockResolvedValue(null);

      await expect(floorService.getFloorById(1))
        .rejects.toThrow('Floor not found');
    });
  });

  describe('createFloor', () => {
    it('должен создать этаж', async () => {
      const mockFloor = { id: 1 };
      prisma.floor.create.mockResolvedValue(mockFloor);

      const data = { name: 'Test', level: 1, width: 10, height: 10, coworkingCenterId: 1 };
      const result = await floorService.createFloor(data);

      expect(result).toEqual(mockFloor);
    });
  });

  describe('updateFloor', () => {
    it('должен обновить этаж', async () => {
      const mockFloor = { id: 1 };
      prisma.floor.update.mockResolvedValue(mockFloor);

      const data = { name: 'New' };
      const result = await floorService.updateFloor(1, data);

      expect(result).toEqual(mockFloor);
    });
  });

  describe('deleteFloor', () => {
    it('должен удалить этаж', async () => {
      prisma.floor.delete.mockResolvedValue({});

      await floorService.deleteFloor(1);

      expect(prisma.floor.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
}); 