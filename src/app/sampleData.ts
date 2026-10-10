import type { Product, Transaction } from "./components"

// Historical opening balances are independent of today's editable inventory.
export function sampleTransactions(products: Product[]): Transaction[] {
  const records: Transaction[] = []
  for (let day = 29; day >= 0; day--) {
    const date = new Date()
    date.setDate(date.getDate() - day)
    date.setHours(9, 0, 0, 0)
    for (let index = 0; index < 3; index++) {
      const product = products[(day * 3 + index) % products.length]
      const action = index === 0 && day % 3 === 0 ? "Stock In" : "Sale"
      const quantity = action === "Stock In" ? 12 : 1 + ((day + index) % 4)
      const timestamp = new Date(date.getTime() + index * 3600000).toISOString()
      // Do not seed future transactions when the workspace is opened early.
      if (new Date(timestamp).getTime() > Date.now()) continue
      records.push({
        id: -(day * 3 + index + 1),
        timestamp,
        date: new Date(timestamp).toLocaleString("en-IN"),
        product: product.name,
        action,
        quantity,
        unit: product.unit,
        source: "Dashboard",
        status: "Confirmed",
        price: action === "Sale" ? product.price : product.purchasePrice,
        costPrice: product.purchasePrice,
      })
    }
  }
  return records.sort((a, b) => b.timestamp!.localeCompare(a.timestamp!))
}
