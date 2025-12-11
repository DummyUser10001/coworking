const { InventoryService } = require('../../src/services/inventoryService');
const prisma = require('../../src/prismaClient');

describe('InventoryService', () => {
  let inventoryService;

  beforeEach(() => {
    inventoryService = new InventoryService();
  });

  describe('getAllInventory', () => {
    it('должен вернуть весь инвентарь', async () => {
      const mockInventory = [{ id: 1 }];
      prisma.inventoryItem.findMany.mockResolvedValue(mockInventory);

      const result = await inventoryService.getAllInventory();

      expect(result).toEqual(mockInventory);
    });
  });

  describe('getAvailableInventory', () => {
    it('должен вернуть доступный инвентарь', async () => {
      const mockInventory = [{ id: 1 }];
      prisma.inventoryItem.findMany.mockResolvedValue(mockInventory);

      const result = await inventoryService.getAvailableInventory();

      expect(result).toEqual(mockInventory);
    });
  });

  describe('getInventoryByWorkstation', () => {
    it('должен вернуть инвентарь по рабочему месту', async () => {
      const mockInventory = [{ id: 1 }];
      prisma.inventoryItem.findMany.mockResolvedValue(mockInventory);

      const result = await inventoryService.getInventoryByWorkstation(1);

      expect(result).toEqual(mockInventory);
    });
  });

  describe('getInventoryByType', () => {
    it('должен вернуть инвентарь по типу', async () => {
      const mockInventory = [{ id: 1 }];
      prisma.inventoryItem.findMany.mockResolvedValue(mockInventory);

      const result = await inventoryService.getInventoryByType('MONITOR');

      expect(result).toEqual(mockInventory);
    });
  });

  describe('getInventoryById', () => {
    it('должен вернуть инвентарь по ID', async () => {
      const mockItem = { id: 1 };
      prisma.inventoryItem.findUnique.mockResolvedValue(mockItem);

      const result = await inventoryService.getInventoryById(1);

      expect(result).toEqual(mockItem);
    });

    it('должен выбросить ошибку, если инвентарь не найден', async () => {
      prisma.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(inventoryService.getInventoryById(1))
        .rejects.toThrow('Inventory item not found');
    });
  });

  describe('createInventoryItem', () => {
    it('должен создать элемент инвентаря', async () => {
      prisma.workstation.findUnique.mockResolvedValue({ id: 1 });
      const mockItem = { id: 1 };
      prisma.inventoryItem.create.mockResolvedValue(mockItem);

      const data = { type: 'MONITOR', totalQuantity: 5 };
      const result = await inventoryService.createInventoryItem(data);

      expect(result).toEqual(mockItem);
    });

    it('должен выбросить ошибку при неверном типе', async () => {
      const data = { type: 'INVALID' };

      await expect(inventoryService.createInventoryItem(data))
        .rejects.toThrow('Invalid inventory type');
    });
  });

  describe('updateInventoryItem', () => {
    it('должен обновить элемент инвентаря', async () => {
      prisma.inventoryItem.findUnique.mockResolvedValue({ id: 1, totalQuantity: 5, reservedQuantity: 2 });
      prisma.workstation.findUnique.mockResolvedValue({ id: 1 });
      const mockItem = { id: 1 };
      prisma.inventoryItem.update.mockResolvedValue(mockItem);

      const data = { totalQuantity: 10 };
      const result = await inventoryService.updateInventoryItem(1, data);

      expect(result).toEqual(mockItem);
    });

    it('должен выбросить ошибку, если элемент не найден', async () => {
      prisma.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(inventoryService.updateInventoryItem(1, {}))
        .rejects.toThrow('Inventory item not found');
    });
  });

  describe('updateInventoryQuantity', () => {
    it('должен обновить количество инвентаря', async () => {
      prisma.inventoryItem.findUnique.mockResolvedValue({ id: 1, totalQuantity: 5, reservedQuantity: 2 });
      const mockItem = { id: 1 };
      prisma.inventoryItem.update.mockResolvedValue(mockItem);

      const result = await inventoryService.updateInventoryQuantity(1, 10);

      expect(result).toEqual(mockItem);
    });

    it('должен выбросить ошибку, если элемент не найден', async () => {
      prisma.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(inventoryService.updateInventoryQuantity(1, 10))
        .rejects.toThrow('Inventory item not found');
    });
  });

  describe('updateInventoryWorkstation', () => {
    it('должен обновить рабочее место инвентаря', async () => {
      prisma.inventoryItem.findUnique.mockResolvedValue({ id: 1, workstationId: null, reservedQuantity: 0, totalQuantity: 5 });
      prisma.workstation.findUnique.mockResolvedValue({ id: 1 });
      const mockItem = { id: 1 };
      prisma.inventoryItem.update.mockResolvedValue(mockItem);

      const result = await inventoryService.updateInventoryWorkstation(1, 1);

      expect(result).toEqual(mockItem);
    });

    it('должен выбросить ошибку, если элемент не найден', async () => {
      prisma.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(inventoryService.updateInventoryWorkstation(1, 1))
        .rejects.toThrow('Inventory item not found');
    });
  });

  describe('deleteInventoryItem', () => {
    it('должен удалить элемент инвентаря', async () => {
      prisma.inventoryItem.findUnique.mockResolvedValue({ id: 1 });
      prisma.inventoryItem.delete.mockResolvedValue({});

      await inventoryService.deleteInventoryItem(1);

      expect(prisma.inventoryItem.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('должен выбросить ошибку, если элемент не найден', async () => {
      prisma.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(inventoryService.deleteInventoryItem(1))
        .rejects.toThrow('Inventory item not found');
    });
  });

    describe('getInventoryStats', () => {
    it('должен вернуть статистику инвентаря', async () => {
        // Настройка моков в правильном порядке
        prisma.inventoryItem.count
        .mockResolvedValueOnce(10)  // общее количество
        .mockResolvedValueOnce(4)   // общие предметы
        .mockResolvedValueOnce(6);  // назначенные предметы
        
        prisma.inventoryItem.groupBy.mockResolvedValue([
        { 
            type: 'MONITOR', 
            _sum: { totalQuantity: 5, reservedQuantity: 2 }, 
            _count: { id: 3 } 
        }
        ]);

        const result = await inventoryService.getInventoryStats();

        expect(result.totalItems).toBe(10);
        expect(result.distribution).toEqual({ general: 4, assigned: 6 });
    });
    });
});