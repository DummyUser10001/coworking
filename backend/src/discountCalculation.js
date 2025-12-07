
function calculateDiscountWithPriority(
  price,
  discounts,
  bookingDate = new Date(),
  maxDiscountsApplied = Infinity
) {
  console.log('=== CALCULATE DISCOUNT START ===')
  console.log('Base price:', price)
  console.log('Booking date:', bookingDate)
  console.log('Total discounts found:', discounts?.length)

  // Валидация входных данных
  if (!price || price <= 0) {
    console.log('Invalid price')
    return {
      discountPercentage: 0,
      discountAmount: 0,
      finalPrice: price || 0,
      discountsApplied: 0,
      appliedDiscounts: [] // Возвращаем пустой массив
    }
  }

  if (!discounts || !Array.isArray(discounts) || discounts.length === 0) {
    console.log('No discounts provided')
    return {
      discountPercentage: 0,
      discountAmount: 0,
      finalPrice: Number(price.toFixed(2)),
      discountsApplied: 0,
      appliedDiscounts: [] // Возвращаем пустой массив
    }
  }

  const now = new Date(bookingDate)
  if (isNaN(now.getTime())) {
    console.error('Invalid bookingDate:', bookingDate)
    return {
      discountPercentage: 0,
      discountAmount: 0,
      finalPrice: Number(price.toFixed(2)),
      discountsApplied: 0,
      appliedDiscounts: [] // Возвращаем пустой массив
    }
  }

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = dayNames[now.getDay()].toLowerCase()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  console.log(`Today: ${today}, Time: ${now.toISOString().slice(11, 16)} (${currentMinutes} min)`)

  // Фильтруем применимые скидки
  const applicable = discounts.filter(d => {
    try {
      if (!d.isActive) return false

      const startDate = d.startDate ? new Date(d.startDate) : null
      const endDate = d.endDate ? new Date(d.endDate) : null

      if (startDate && now < startDate) return false
      if (endDate && now > endDate) return false

      if (d.usageLimit !== null && d.usageLimit <= 0) return false

      if (d.applicableDays && Array.isArray(d.applicableDays) && d.applicableDays.length > 0) {
        const hasDay = d.applicableDays.map(day => day.toLowerCase()).includes(today)
        if (!hasDay) return false
      }

      if (d.applicableHours && d.applicableHours.trim() !== '') {
        const hours = d.applicableHours.trim()
        const match = hours.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/)
        if (!match) {
          console.warn(`Invalid applicableHours format: ${hours}`)
          return false
        }

        const [_, startH, startM, endH, endM] = match.map(Number)
        const startMinutes = startH * 60 + startM
        const endMinutes = endH * 60 + endM

        if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
          return false
        }
      }

      return true
    } catch (err) {
      console.error('Error filtering discount:', d.id, err)
      return false
    }
  })

  console.log(`Applicable discounts: ${applicable.length}`)

  if (applicable.length === 0) {
    return {
      discountPercentage: 0,
      discountAmount: 0,
      finalPrice: Number(price.toFixed(2)),
      discountsApplied: 0,
      appliedDiscounts: [] // Возвращаем пустой массив
    }
  }

  // Сортируем по приоритету (убывание)
  const sorted = applicable
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, maxDiscountsApplied)

  let remainingPrice = price
  let totalDiscountAmount = 0
  const appliedDiscounts = [] // Массив для хранения информации о примененных скидках

  sorted.forEach((d, index) => {
    const discountAmount = remainingPrice * (d.percentage / 100)
    const effective = d.maxDiscountAmount
      ? Math.min(discountAmount, d.maxDiscountAmount)
      : discountAmount

    remainingPrice -= effective
    totalDiscountAmount += effective

    // Сохраняем информацию о примененной скидке
    appliedDiscounts.push({
      id: d.id,
      name: d.name,
      percentage: d.percentage,
      discountAmount: Number(effective.toFixed(2)),
      description: d.description
    })

    console.log(`Discount #${index + 1} "${d.name}": ${d.percentage}% → -${effective.toFixed(2)}₽`)
  })

  const totalDiscountPercentage = price > 0 ? (totalDiscountAmount / price) * 100 : 0
  const finalPrice = Math.max(0, remainingPrice)

  console.log('=== CALCULATE DISCOUNT END ===')
  console.log(`Final price: ${finalPrice.toFixed(2)}₽`)
  console.log(`Total discount: ${totalDiscountAmount.toFixed(2)}₽ (${totalDiscountPercentage.toFixed(2)}%)`)
  console.log(`Discounts applied: ${sorted.length}`)

  return {
    discountPercentage: Number(totalDiscountPercentage.toFixed(2)),
    discountAmount: Number(totalDiscountAmount.toFixed(2)),
    finalPrice: Number(finalPrice.toFixed(2)),
    discountsApplied: sorted.length,
    appliedDiscounts: appliedDiscounts // Возвращаем массив примененных скидок
  }
}

// Экспортируем обе функции
export default calculateDiscountWithPriority;