export function calculateRefund(booking, cancellationTime, cancelledBy = 'USER') {
  const cancelledByNorm = (cancelledBy || 'USER').toUpperCase();
  const now = new Date(cancellationTime);
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);

  if (isNaN(startTime) || isNaN(endTime) || isNaN(now)) {
    return { refundAmount: 0, refundPercentage: 0, isFullRefund: false, reason: 'Invalid date' };
  }

  const hoursUntilStart = (startTime - now) / (1000 * 60 * 60);
  const bookingType = getBookingType(startTime, endTime);

  // цена из payment.finalPrice
  const price = booking.payment?.finalPrice ?? 0;
  if (price <= 0) {
    return { refundAmount: 0, refundPercentage: 0, isFullRefund: false, reason: 'No payment' };
  }

  if (cancelledByNorm === 'MANAGER') {
    return {
      refundAmount: price,
      refundPercentage: 100,
      isFullRefund: true,
      bookingType,
      hoursUntilStart,
      reason: 'Cancelled by manager'
    };
  }

  const refundResult = getRefundByType(bookingType, price, hoursUntilStart);
  return { ...refundResult, bookingType, hoursUntilStart };
}

// Вспомогательные
function getBookingType(start, end) {
  const h = (end - start) / 3600000;
  const d = h / 24;
  if (h <= 12) return 'hourly';
  if (d <= 1) return 'daily';
  if (d <= 7) return 'weekly';
  return 'monthly';
}

function calc(price, percent, reason) {
  const amount = Math.round(price * percent * 100) / 100;
  return { refundAmount: amount, refundPercentage: percent * 100, isFullRefund: percent === 1, reason };
}

function getRefundByType(type, price, h) {
  switch (type) {
    case 'hourly':
      return h > 2 ? calc(price, 1, '>2h') : h > 1 ? calc(price, 0.5, '1-2h') : calc(price, 0, '<1h');
    case 'daily':
      return h > 24 ? calc(price, 1, '>24h') : h > 12 ? calc(price, 0.5, '12-24h') : calc(price, 0, '<12h');
    case 'weekly':
      const d = h / 24;
      return d > 5 ? calc(price, 1, '>5d') : d > 3 ? calc(price, 0.5, '3-5d') : d > 1 ? calc(price, 0.25, '1-3d') : calc(price, 0, '<1d');
    case 'monthly':
      const dm = h / 24;
      return dm > 14 ? calc(price, 1, '>14d') : dm > 7 ? calc(price, 0.5, '7-14d') : calc(price, 0, '<7d');
    default:
      return calc(price, 0, 'unknown');
  }
}

export function isRefundPossible(booking, cancellationTime) {
  return calculateRefund(booking, cancellationTime).refundAmount > 0;
}

export function getRefundPolicy() {}

export default { calculateRefund, isRefundPossible, getRefundPolicy };