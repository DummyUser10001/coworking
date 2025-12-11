const { BookingService } = require('../../src/services/bookingService');
const prisma = require('../../src/prismaClient');
const calculateDiscountWithPriority = require('../../src/discountCalculation').default;
const { calculateRefund } = require('../../src/refundCalculation');

describe('BookingService', () => {
  let bookingService;

  beforeEach(() => {
    bookingService = new BookingService();
  });

  describe('getUserBookings', () => {
    it('должен вернуть бронирования пользователя', async () => {
      const mockBookings = [{ id: 1 }];
      prisma.booking.findMany.mockResolvedValue(mockBookings);

      const result = await bookingService.getUserBookings(1);

      expect(result).toEqual(mockBookings);
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: expect.any(Object),
        orderBy: { startTime: 'desc' }
      });
    });
  });

  describe('getBookingById', () => {
    it('должен вернуть бронирование по ID', async () => {
      const mockBooking = { id: 1, userId: 1 };
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await bookingService.getBookingById(1, 1);

      expect(result).toEqual(mockBooking);
    });

    it('должен выбросить ошибку, если бронирование не найдено', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(bookingService.getBookingById(1, 1))
        .rejects.toThrow('Booking not found');
    });

    it('должен выбросить ошибку, если доступ запрещен', async () => {
      prisma.booking.findUnique.mockResolvedValue({ id: 1, userId: 2 });

      await expect(bookingService.getBookingById(1, 1))
        .rejects.toThrow('Access denied');
    });
  });

  describe('createBooking', () => {
    it('должен создать бронирование и вернуть его', async () => {
      prisma.workstation.findUnique.mockResolvedValue({ id: 1 });
      prisma.booking.findFirst.mockResolvedValue(null);
      prisma.payment.create.mockResolvedValue({ id: 1 });
      prisma.booking.create.mockResolvedValue({ id: 1 });

      const bookingData = { coworkingCenterId: 1, workstationId: 1, startTime: '2023-01-01', endTime: '2023-01-02', bookingDuration: 'day', basePrice: 100, finalPrice: 100 };
      const result = await bookingService.createBooking(1, bookingData);

      expect(result).toEqual({ id: 1 });
    });

    it('должен выбросить ошибку, если рабочее место не найдено', async () => {
      prisma.workstation.findUnique.mockResolvedValue(null);

      await expect(bookingService.createBooking(1, {}))
        .rejects.toThrow('Workstation not found');
    });

    it('должен вернуть ошибку, если рабочее место занято', async () => {
      prisma.workstation.findUnique.mockResolvedValue({ id: 1 });
      prisma.booking.findFirst.mockResolvedValue({ id: 2 });

      const result = await bookingService.createBooking(1, { workstationId: 1, startTime: '2023-01-01', endTime: '2023-01-02' });

      expect(result.error).toBe('Workstation is not available for the selected period');
    });
  });

  describe('updateBookingStatus', () => {
    it('должен обновить статус бронирования', async () => {
      prisma.booking.findUnique.mockResolvedValue({ id: 1, userId: 1, payment: { id: 1 } });
      prisma.booking.update.mockResolvedValue({ id: 1 });
      prisma.payment.update.mockResolvedValue({});

      const result = await bookingService.updateBookingStatus(1, 1, 'CANCELLED');

      expect(result).toEqual({ id: 1 });
    });

    it('должен выбросить ошибку, если бронирование не найдено', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(bookingService.updateBookingStatus(1, 1, 'CANCELLED'))
        .rejects.toThrow('Booking not found');
    });

    it('должен выбросить ошибку, если доступ запрещен', async () => {
      prisma.booking.findUnique.mockResolvedValue({ id: 1, userId: 2 });

      await expect(bookingService.updateBookingStatus(1, 1, 'CANCELLED'))
        .rejects.toThrow('Access denied');
    });
  });

  describe('cancelBooking', () => {
    it('должен отменить бронирование и вернуть сообщение', async () => {
      prisma.booking.findUnique.mockResolvedValue({ id: 1, userId: 1, startTime: new Date(Date.now() + 100000), endTime: new Date(Date.now() + 200000), payment: { id: 1 } });
      prisma.user.findUnique.mockResolvedValue({ role: 'CLIENT' });
      calculateRefund.mockReturnValue({ refundAmount: 50 });
      prisma.booking.update.mockResolvedValue({});
      prisma.payment.update.mockResolvedValue({});

      const result = await bookingService.cancelBooking(1, 1);

      expect(result.message).toContain('Отменено. Возврат 50₽');
    });

    it('должен выбросить ошибку, если бронирование не найдено', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(bookingService.cancelBooking(1, 1))
        .rejects.toThrow('Бронь не найдена');
    });

    it('должен выбросить ошибку, если уже отменено', async () => {
      prisma.booking.findUnique.mockResolvedValue({ status: 'CANCELLED' });

      await expect(bookingService.cancelBooking(1, 1))
        .rejects.toThrow('Уже отменено');
    });

    it('должен выбросить ошибку, если доступ запрещен', async () => {
      prisma.booking.findUnique.mockResolvedValue({ id: 1, userId: 2 });
      prisma.user.findUnique.mockResolvedValue({ role: 'CLIENT' });

      await expect(bookingService.cancelBooking(1, 1))
        .rejects.toThrow('Доступ запрещён');
    });

    it('должен выбросить ошибку, если бронь завершена', async () => {
      prisma.booking.findUnique.mockResolvedValue({ id: 1, userId: 1, startTime: new Date(Date.now() - 200000), endTime: new Date(Date.now() - 100000) });
      prisma.user.findUnique.mockResolvedValue({ role: 'CLIENT' });

      await expect(bookingService.cancelBooking(1, 1))
        .rejects.toThrow('Бронь уже завершена — отмена невозможна');
    });
  });

  describe('checkAvailability', () => {
    it('должен проверить доступность и вернуть true', async () => {
      prisma.workstation.findUnique.mockResolvedValue({ id: 1 });
      prisma.booking.findFirst.mockResolvedValue(null);

      const result = await bookingService.checkAvailability(1, '2023-01-01', '2023-01-02');

      expect(result.isAvailable).toBe(true);
    });

    it('должен выбросить ошибку, если рабочее место не найдено', async () => {
      prisma.workstation.findUnique.mockResolvedValue(null);

      await expect(bookingService.checkAvailability(1, '2023-01-01', '2023-01-02'))
        .rejects.toThrow('Workstation not found');
    });
  });

  describe('calculatePrice', () => {
    it('должен рассчитать цену с скидкой', async () => {
      prisma.workstation.findUnique.mockResolvedValue({ id: 1, type: 'DESK', basePricePerDay: 100 });
      prisma.discount.findMany.mockResolvedValue([]);
      calculateDiscountWithPriority.mockReturnValue({ discountPercentage: 10, discountAmount: 10, finalPrice: 90, discountsApplied: [], appliedDiscounts: [] });

      const result = await bookingService.calculatePrice(1, 'day', '2023-01-01');

      expect(result.finalPrice).toBe(90);
    });

    it('должен выбросить ошибку, если рабочее место не найдено', async () => {
      prisma.workstation.findUnique.mockResolvedValue(null);

      await expect(bookingService.calculatePrice(1, 'day', '2023-01-01'))
        .rejects.toThrow('Workstation not found');
    });
  });

  describe('getCoworkingCenterBookings', () => {
    it('должен вернуть бронирования центра', async () => {
      const mockBookings = [{ id: 1 }];
      prisma.booking.findMany.mockResolvedValue(mockBookings);

      const result = await bookingService.getCoworkingCenterBookings(1);

      expect(result).toEqual(mockBookings);
    });
  });

  describe('getWorkstationBookings', () => {
    it('должен вернуть бронирования рабочего места', async () => {
      const mockBookings = [{ id: 1 }];
      prisma.booking.findMany.mockResolvedValue(mockBookings);

      const result = await bookingService.getWorkstationBookings(1, 1);

      expect(result).toEqual(mockBookings);
    });
  });

  describe('getAllBookingsForAdmin', () => {
    it('должен вернуть все бронирования для админа', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' });
      const mockBookings = [{ id: 1 }];
      prisma.booking.findMany.mockResolvedValue(mockBookings);

      const result = await bookingService.getAllBookingsForAdmin(1);

      expect(result).toEqual(mockBookings);
    });

    it('должен выбросить ошибку, если доступ запрещен', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: 'CLIENT' });

      await expect(bookingService.getAllBookingsForAdmin(1))
        .rejects.toThrow('Access denied');
    });
  });
});