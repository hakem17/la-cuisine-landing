export function calculateBudget(guests: number, location: string, isVip: boolean) {
  const BASE_COST = 165
  const MIN_BUDGET = 5000
  const locationMultiplier = location === 'Dubai' || location === 'Other' ? 1.5 : 1
  const vipMultiplier = isVip ? 2 : 1
  const raw = guests * BASE_COST * locationMultiplier * vipMultiplier
  let minBudget = Math.ceil(raw / 1000) * 1000
  if (minBudget < MIN_BUDGET) minBudget = MIN_BUDGET
  return { min: minBudget, max: minBudget * 4 }
}

export function formatBudgetRange(min: number, max: number) {
  const toK = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}K` : String(n))
  return `${toK(min)} — ${toK(max)} AED`
}
