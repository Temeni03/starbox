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

// One line of a box: the contained product plus how many of it the box holds.
export interface BoxLine {
  product?: { _id?: unknown; quantity: number } | null
  quantity?: number
}

// How many units of a product it takes to make up `units` copies of the box.
function unitsNeeded(line: BoxLine, units: number): number {
  return (line.quantity ?? 1) * units
}

// A box is out of stock if any contained product was deleted, or no longer has enough
// stock to make up `units` copies of the box. Computed live from current product
// quantities, so a box automatically becomes orderable again as soon as its products
// are restocked — and unavailable again as soon as they run down. No admin action needed.
export function isBoxOutOfStock(products: BoxLine[], units = 1): boolean {
  return products.some((line) => !line.product || line.product.quantity < unitsNeeded(line, units))
}

export interface OrderLine {
  product: unknown
  itemType: string
  quantity: number
}

/**
 * Totals the units of each product an order consumes: standalone product lines plus the
 * contents of every ordered box. Boxes carry no inventory of their own, so selling one
 * draws down the products inside it. Keyed by product id, so a product bought both on its
 * own and inside a box is decremented once, by the combined amount.
 */
export function collectStockDecrements(
  items: OrderLine[],
  boxContents: Map<string, BoxLine[]>
): Map<string, number> {
  const decrements = new Map<string, number>()

  function add(productId: string, units: number) {
    decrements.set(productId, (decrements.get(productId) ?? 0) + units)
  }

  for (const item of items) {
    const itemId = String(item.product)
    if (item.itemType === 'Box') {
      for (const line of boxContents.get(itemId) ?? []) {
        if (line.product?._id) add(String(line.product._id), unitsNeeded(line, item.quantity))
      }
    } else {
      add(itemId, item.quantity)
    }
  }

  return decrements
}
