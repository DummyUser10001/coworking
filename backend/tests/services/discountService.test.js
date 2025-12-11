const { DiscountService } = require('../../src/services/discountService');
const prisma = require('../../src/prismaClient');

describe('DiscountService', () => {
  let discountService;

  beforeEach(() => {
    discountService = new DiscountService();
  });

  describe('getAllDiscounts', () => {
    it('должен вернуть все скидки', async () => {
      const mockDiscounts = [{ id: 1 }];
      prisma.discount.findMany.mockResolvedValue(mockDiscounts);

      const result = await discountService.getAllDiscounts();

      expect(result).toEqual(mockDiscounts);
    });
  });

  describe('getDiscountById', () => {
    it('должен вернуть скидку по ID', async () => {
      const mockDiscount = { id: 1 };
      prisma.discount.findUnique.mockResolvedValue(mockDiscount);

      const result = await discountService.getDiscountById(1);

      expect(result).toEqual(mockDiscount);
    });

    it('должен выбросить ошибку, если скидка не найдена', async () => {
      prisma.discount.findUnique.mockResolvedValue(null);

      await expect(discountService.getDiscountById(1))
        .rejects.toThrow('Discount not found');
    });
  });

  describe('createDiscount', () => {
    it('должен создать скидку', async () => {
      prisma.discount.findFirst.mockResolvedValue(null);
      const mockDiscount = { id: 1 };
      prisma.discount.create.mockResolvedValue(mockDiscount);

      const data = { name: 'Test', percentage: 10, startDate: '2023-01-01', endDate: '2023-01-02', applicableDays: ['monday'] };
      const result = await discountService.createDiscount(data);

      expect(result).toEqual(mockDiscount);
    });

    it('должен выбросить ошибку при неверных данных', async () => {
      const data = { name: 'Test', percentage: 0 }; // Добавлено name, чтобы пройти первую проверку

      await expect(discountService.createDiscount(data))
        .rejects.toThrow('Размер скидки должен быть положительным числом');
    });

    it('должен выбросить ошибку, если скидка с таким именем существует', async () => {
      prisma.discount.findFirst.mockResolvedValue({ id: 1 });

      const data = { name: 'Test', percentage: 10, startDate: '2023-01-01', endDate: '2023-01-02', applicableDays: ['monday'] };

      await expect(discountService.createDiscount(data))
        .rejects.toThrow('Скидка с таким названием уже существует');
    });
  });

  describe('updateDiscount', () => {
    it('должен обновить скидку', async () => {
      prisma.discount.findUnique.mockResolvedValue({ id: 1, name: 'Old' });
      prisma.discount.findFirst.mockResolvedValue(null);
      const mockDiscount = { id: 1 };
      prisma.discount.update.mockResolvedValue(mockDiscount);

      const data = { name: 'New' };
      const result = await discountService.updateDiscount(1, data);

      expect(result).toEqual(mockDiscount);
    });

    it('должен выбросить ошибку, если скидка не найдена', async () => {
      prisma.discount.findUnique.mockResolvedValue(null);

      await expect(discountService.updateDiscount(1, {}))
        .rejects.toThrow('Discount not found');
    });

    it('должен выбросить ошибку при неверных данных', async () => {
      prisma.discount.findUnique.mockResolvedValue({ id: 1 });

      await expect(discountService.updateDiscount(1, { percentage: 60 }))
        .rejects.toThrow('Размер скидки не может превышать 50%');
    });
  });

  describe('deleteDiscount', () => {
    it('должен удалить скидку', async () => {
      prisma.discount.delete.mockResolvedValue({});

      await discountService.deleteDiscount(1);

      expect(prisma.discount.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('getActiveDiscounts', () => {
    it('должен вернуть активные скидки', async () => {
      const mockDiscounts = [{ id: 1 }];
      prisma.discount.findMany.mockResolvedValue(mockDiscounts);

      const result = await discountService.getActiveDiscounts();

      expect(result).toEqual(mockDiscounts);
    });
  });

  describe('checkDiscountAvailability', () => {
    it('должен проверить доступность скидок', async () => {
      const mockDiscounts = [{ id: 1 }];
      prisma.discount.findMany.mockResolvedValue(mockDiscounts);

      const result = await discountService.checkDiscountAvailability();

      expect(result.totalCount).toBe(1);
    });
  });
});