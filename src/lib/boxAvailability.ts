export function activeBoxFilter() {
  const now = new Date()
  return {
    isActive: true,
    $and: [
      { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
    ],
  }
}

// A box is out of stock if any contained product is out of stock (or was deleted).
// Computed live from current product quantities, so a box automatically becomes
// orderable again as soon as its products are restocked — no admin action needed.
export function isBoxOutOfStock(products: { product?: { quantity: number } | null }[]): boolean {
  return products.some((bp) => !bp.product || bp.product.quantity === 0)
}
