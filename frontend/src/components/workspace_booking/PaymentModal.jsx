import React, { useState } from 'react'
import { createBooking } from '../../api/booking'
import { useAuth } from '../../context/AuthContext'

const PaymentModal = ({ isOpen, onClose, bookingDetails, onPaymentSuccess }) => {
  const { token } = useAuth()
  const [cardNumber, setCardNumber] = useState('')
  const [maskedCardNumber, setMaskedCardNumber] = useState('')

  const [expiryDate, setExpiryDate] = useState('')

  const [cvc, setCvc] = useState('')
  const [maskedCvc, setMaskedCvc] = useState('')

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !bookingDetails) return null

  // ================================
  // FORMATTERS
  // ================================
  const formatExpiryDate = (value) => {
    const digits = value.replace(/\D/g, '').substring(0, 4)
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`
    }
    return digits
  }

  // ================================
  // CARD NUMBER WITH TRUE MASKING
  // ================================
  const handleCardNumberChange = (e) => {
    const input = e.nativeEvent.data // last typed char
    let newValue = cardNumber

    if (input === null) {
      // backspace
      newValue = newValue.slice(0, -1)
    } else if (/\d/.test(input) && newValue.length < 16) {
      newValue += input
    }

    setCardNumber(newValue)

    const masked =
      newValue.length > 4
        ? newValue.slice(0, -4).replace(/./g, '*') + newValue.slice(-4)
        : newValue.replace(/./g, '*')

    setMaskedCardNumber(masked.replace(/(.{4})/g, '$1 ').trim())
  }

  // ================================
  // CVC MASKING FIXED
  // ================================
  const handleCvcChange = (e) => {
    const input = e.nativeEvent.data
    let newValue = cvc

    if (input === null) {
      newValue = newValue.slice(0, -1)
    } else if (/\d/.test(input) && newValue.length < 3) {
      newValue += input
    }

    setCvc(newValue)
    setMaskedCvc('*'.repeat(newValue.length))
  }

  const handleExpiryDateChange = (e) => {
    setExpiryDate(formatExpiryDate(e.target.value))
  }

  // ================================
  // PAYMENT
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    setError('')

    try {
      if (!token) throw new Error('Требуется авторизация')

      const requiredFields = [
        'workstationId',
        'coworkingCenterId',
        'startTime',
        'endTime',
        'bookingDuration',
        'basePrice',
        'finalPrice'
      ]

      const missingFields = requiredFields.filter(field => !bookingDetails[field])
      if (missingFields.length > 0) {
        throw new Error(`Missing required booking parameters: ${missingFields.join(', ')}`)
      }

      const bookingData = {
        coworkingCenterId: bookingDetails.coworkingCenterId,
        workstationId: bookingDetails.workstationId,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        bookingDuration: bookingDetails.bookingDuration,
        basePrice: bookingDetails.basePrice,
        discountPercentage: bookingDetails.discountPercentage || 0,
        finalPrice: bookingDetails.finalPrice
      }

      const createdBooking = await createBooking(bookingData, token)

      // clear inputs
      setCardNumber('')
      setMaskedCardNumber('')
      setCvc('')
      setMaskedCvc('')
      setExpiryDate('')

      onPaymentSuccess(createdBooking)

    } catch (err) {
      setError(err.message || 'Ошибка создания бронирования')
    } finally {
      setIsProcessing(false)
    }
  }

  // Helpers
  const getWorkstationType = (type) => {
    const types = {
      'DESK': 'Стол',
      'COMPUTER_DESK': 'Стол с ПК',
      'MEETING_ROOM': 'Переговорная',
      'CONFERENCE_ROOM': 'Конференц-зал'
    }
    return types[type] || type
  }

  const getDurationText = (duration) => {
    const durations = {
      'day': '1 день',
      'week': '1 неделя',
      'month': '1 месяц'
    }
    return durations[duration] || duration
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-screen overflow-y-auto">

        {/* HEADER */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Оплата бронирования</h2>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-2xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              ×
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Место №{bookingDetails.workstation.number}</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {getWorkstationType(bookingDetails.workstation.type)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Дата начала:</span>
              <span className="font-medium">
                {new Date(bookingDetails.startTime).toLocaleDateString('ru-RU')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Период:</span>
              <span className="font-medium">{getDurationText(bookingDetails.bookingDuration)}</span>
            </div>
            {bookingDetails.discountPercentage > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Скидка:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {bookingDetails.discountPercentage}%
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold text-gray-800 dark:text-white">К оплате:</span>
              <span className="text-2xl font-bold text-[#645391] dark:text-[#A1E1DE]">
                {bookingDetails.finalPrice.toFixed(0)}₽
              </span>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900 rounded-lg text-sm text-red-700 dark:text-red-300 text-center">
              {error}
            </div>
          )}

          {/* CARD NUMBER */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Номер карты
            </label>
            <input
              type="text"
              value={maskedCardNumber}
              onChange={handleCardNumberChange}
              placeholder="**** **** **** 1234"
              maxLength="19"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#645391] focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
              required
              disabled={isProcessing}
            />
          </div>

          {/* EXPIRY + CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Срок действия
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                placeholder="MM/YY"
                maxLength="5"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#645391] focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                required
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CVC
              </label>
              <input
                type="text"
                value={maskedCvc}
                onChange={handleCvcChange}
                placeholder="***"
                maxLength="3"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#645391] focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                required
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Отмена
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-3 bg-[#645391] hover:bg-[#52447a] disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center justify-center transition-all disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Обработка...
                </>
              ) : (
                `Оплатить ${bookingDetails.finalPrice.toFixed(0)}₽`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentModal
