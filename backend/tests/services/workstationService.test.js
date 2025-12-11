const { WorkstationService } = require('../../src/services/workstationService');
const prisma = require('../../src/prismaClient');

describe('WorkstationService', () => {
  let workstationService;

  beforeEach(() => {
    workstationService = new WorkstationService();
  });

  describe('getAllWorkstations', () => {
    it('должен вернуть все рабочие места', async () => {
      const mockWorkstations = [{ id: 1 }];
      prisma.workstation.findMany.mockResolvedValue(mockWorkstations);

      const result = await workstationService.getAllWorkstations();

      expect(result).toEqual(mockWorkstations);
    });
  });

  describe('getWorkstationById', () => {
    it('должен вернуть рабочее место по ID', async () => {
      const mockWorkstation = { id: 1 };
      prisma.workstation.findUnique.mockResolvedValue(mockWorkstation);

      const result = await workstationService.getWorkstationById(1);

      expect(result).toEqual(mockWorkstation);
    });

    it('должен выбросить ошибку, если рабочее место не найдено', async () => {
      prisma.workstation.findUnique.mockResolvedValue(null);

      await expect(workstationService.getWorkstationById(1))
        .rejects.toThrow('Workstation not found');
    });
  });

  describe('createWorkstation', () => {
    it('должен создать рабочее место', async () => {
      prisma.workstation.findFirst.mockResolvedValue(null);
      const mockWorkstation = { id: 1 };
      prisma.workstation.create.mockResolvedValue(mockWorkstation);

      const data = { number: 1, floorId: 1, type: 'DESK', capacity: 2, basePricePerDay: 100, basePricePerWeek: 500, basePricePerMonth: 2000 };
      const result = await workstationService.createWorkstation(data);

      expect(result).toEqual(mockWorkstation);
    });

    it('должен выбросить ошибку, если номер уже существует', async () => {
      prisma.workstation.findFirst.mockResolvedValue({ id: 2 });

      const data = { number: 1, floorId: 1, type: 'DESK', capacity: 2, basePricePerDay: 100, basePricePerWeek: 500, basePricePerMonth: 2000 };

      await expect(workstationService.createWorkstation(data))
        .rejects.toThrow('Рабочее место с таким номером уже существует на этом этаже');
    });

    it('должен выбросить ошибку при неверных ценах', async () => {
      prisma.workstation.findFirst.mockResolvedValue(null);

      const data = { number: 1, floorId: 1, type: 'DESK', capacity: 2 };

      await expect(workstationService.createWorkstation(data))
        .rejects.toThrow('Для столов должны быть указаны цены за день, неделю и месяц');
    });
  });

  describe('updateWorkstation', () => {
    it('должен обновить рабочее место', async () => {
      prisma.workstation.findUnique.mockResolvedValue({ id: 1, number: 1, floorId: 1 });
      prisma.workstation.findFirst.mockResolvedValue(null);
      const mockWorkstation = { id: 1 };
      prisma.workstation.update.mockResolvedValue(mockWorkstation);

      const data = { number: 2 };
      const result = await workstationService.updateWorkstation(1, data);

      expect(result).toEqual(mockWorkstation);
    });

    it('должен выбросить ошибку, если рабочее место не найдено', async () => {
      prisma.workstation.findUnique.mockResolvedValue(null);

      await expect(workstationService.updateWorkstation(1, {}))
        .rejects.toThrow('Workstation not found');
    });

    it('должен выбросить ошибку, если номер уже существует', async () => {
      prisma.workstation.findUnique.mockResolvedValue({ id: 1, number: 1, floorId: 1 });
      prisma.workstation.findFirst.mockResolvedValue({ id: 3 });

      await expect(workstationService.updateWorkstation(1, { number: 2 }))
        .rejects.toThrow('Рабочее место с таким номером уже существует на этом этаже');
    });
  });

  describe('deleteWorkstation', () => {
    it('должен удалить рабочее место', async () => {
      prisma.inventoryItem.deleteMany.mockResolvedValue({});
      prisma.workstation.delete.mockResolvedValue({});

      await workstationService.deleteWorkstation(1);

      expect(prisma.workstation.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('getWorkstationsByFloor', () => {
    it('должен вернуть рабочие места по этажу', async () => {
      const mockWorkstations = [{ id: 1 }];
      prisma.workstation.findMany.mockResolvedValue(mockWorkstations);

      const result = await workstationService.getWorkstationsByFloor(1);

      expect(result).toEqual(mockWorkstations);
    });
  });

  describe('checkWorkstationAvailability', () => {
    it('должен проверить доступность рабочего места', async () => {
      prisma.workstation.findUnique.mockResolvedValue({ id: 1, bookings: [] });

      const result = await workstationService.checkWorkstationAvailability(1, '2023-01-01');

      expect(result.isAvailable).toBe(true);
    });

    it('должен выбросить ошибку, если рабочее место не найдено', async () => {
      prisma.workstation.findUnique.mockResolvedValue(null);

      await expect(workstationService.checkWorkstationAvailability(1, '2023-01-01'))
        .rejects.toThrow('Workstation not found');
    });
  });

  describe('updateWorkstationInventory', () => {
    it('должен обновить инвентарь рабочего места', async () => {
      prisma.inventoryItem.deleteMany.mockResolvedValue({});
      prisma.inventoryItem.createMany.mockResolvedValue({});
      const mockWorkstation = { id: 1 };
      prisma.workstation.findUnique.mockResolvedValue(mockWorkstation);

      const result = await workstationService.updateWorkstationInventory(1, []);

      expect(result).toEqual(mockWorkstation);
    });
  });
});