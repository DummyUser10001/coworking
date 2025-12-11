const { ColorSettingsService } = require('../../src/services/colorSettingsService');
const prisma = require('../../src/prismaClient');

describe('ColorSettingsService', () => {
  let colorSettingsService;

  beforeEach(() => {
    colorSettingsService = new ColorSettingsService();
  });

  describe('getColorSettings', () => {
    it('должен вернуть настройки цветов', async () => {
      prisma.workstationColorSettings.findFirst.mockResolvedValue({ settings: { color: 'red' } });

      const result = await colorSettingsService.getColorSettings();

      expect(result).toEqual({ color: 'red' });
    });

    it('должен вернуть пустой объект, если настройки не найдены', async () => {
      prisma.workstationColorSettings.findFirst.mockResolvedValue(null);

      const result = await colorSettingsService.getColorSettings();

      expect(result).toEqual({});
    });
  });

  describe('updateColorSettings', () => {
    it('должен обновить существующие настройки', async () => {
      prisma.workstationColorSettings.findFirst.mockResolvedValue({ id: 1 });
      prisma.workstationColorSettings.update.mockResolvedValue({ settings: { color: 'blue' } });

      const result = await colorSettingsService.updateColorSettings({ color: 'blue' });

      expect(result).toEqual({ color: 'blue' });
    });

    it('должен создать новые настройки, если они не существуют', async () => {
      prisma.workstationColorSettings.findFirst.mockResolvedValue(null);
      prisma.workstationColorSettings.create.mockResolvedValue({ settings: { color: 'blue' } });

      const result = await colorSettingsService.updateColorSettings({ color: 'blue' });

      expect(result).toEqual({ color: 'blue' });
    });
  });
});