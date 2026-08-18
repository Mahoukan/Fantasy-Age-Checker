const numberFormatter = new Intl.NumberFormat('en', {
  maximumFractionDigits: 2,
})

const equivalentYearsFormatter = new Intl.NumberFormat('en', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const lookupYearsFormatter = new Intl.NumberFormat('en', {
  maximumFractionDigits: 1,
})

const percentageFormatter = new Intl.NumberFormat('en', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatYears(value: number): string {
  if (Math.abs(value) >= 1e12) {
    return value.toExponential(2)
  }

  return numberFormatter.format(value)
}

export function formatEquivalentYears(value: number): string {
  if (Math.abs(value) >= 1e12) {
    return value.toExponential(2)
  }

  return equivalentYearsFormatter.format(value)
}

export function formatLookupYears(value: number): string {
  if (Math.abs(value) >= 1e12) return value.toExponential(2)
  const nearestInteger = Math.round(value)
  return Math.abs(value - nearestInteger) <= 1e-9
    ? numberFormatter.format(nearestInteger)
    : lookupYearsFormatter.format(value)
}

export function formatPercentage(ratio: number): string {
  if (Math.abs(ratio) >= 1e7) {
    const [coefficient, exponentText] = ratio.toExponential(2).split('e')
    const exponent = Number(exponentText) + 2
    const exponentSign = exponent >= 0 ? '+' : ''
    return `${coefficient}e${exponentSign}${exponent}%`
  }

  return `${percentageFormatter.format(ratio * 100)}%`
}
