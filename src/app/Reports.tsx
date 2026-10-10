import { useState } from "react"
import {
  Button,
  Field,
  SelectField,
  StatCard,
  type Product,
  type Transaction,
} from "./components"
import VoiceInput from "./VoiceInput"
import { translate } from "./i18n"

export const rupees = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)
export const transactionTime = (record: Transaction) =>
  new Date(record.timestamp ?? record.date).getTime()
export function filterRecords(
  records: Transaction[],
  from: number,
  to: number,
  product: string,
  action: string,
  source: string,
  search: string,
) {
  return records.filter(
    (record) =>
      transactionTime(record) >= from &&
      transactionTime(record) <= to &&
      (!product || record.product === product) &&
      (!action || record.action === action) &&
      (!source || record.source === source) &&
      record.product.toLowerCase().includes(search.toLowerCase()),
  )
}
export function csvContent(headers: string[], rows: (string | number)[][]) {
  const cell = (value: string | number) =>
    `"${String(value)
      .replace(/^[=+@-]/, "'$&")
      .replace(/"/g, '""')}"`
  return (
    "\uFEFF" +
    [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n")
  )
}
function download(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const escape = (text: unknown) =>
  String(text).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  )
function Chart({
  title,
  data,
  empty,
  format = String,
}: {
  title: string
  data: {
    label: string
    value: number
  }[]
  empty: string
  format?: (value: number) => string
}) {
  const max = Math.max(1, ...data.map((item) => Math.abs(item.value)))
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="font-bold">{title}</div>
      {!data.length ? (
        <p className="py-10 text-sm text-slate-400">{empty}</p>
      ) : (
        <div className="mt-4 space-y-3" role="img" aria-label={title}>
          <div className="flex justify-between text-xs text-slate-400">
            <span>0</span>
            <span>{format(max)}</span>
          </div>
          {data.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              title={`${item.label}: ${format(item.value)}`}
            >
              <div className="flex justify-between gap-2 text-xs">
                <span>{item.label}</span>
                <b>{format(item.value)}</b>
              </div>
              <progress
                value={Math.abs(item.value)}
                max={max}
                className="mt-1 h-3 w-full accent-emerald-600"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default function Reports({
  products,
  transactions,
  language,
  shop,
}: {
  products: Product[]
  transactions: Transaction[]
  language: string
  shop: string
}) {
  const t = (text: string) => translate(language, text)
  const [range, setRange] = useState("Last 7 days")
  const [product, setProduct] = useState(""),
    [action, setAction] = useState(""),
    [source, setSource] = useState("")
  const [search, setSearch] = useState(""),
    [sort, setSort] = useState("Newest first"),
    [page, setPage] = useState(0)
  const [fromDate, setFromDate] = useState(""),
    [toDate, setToDate] = useState("")
  const [voice, setVoice] = useState(false),
    [notice, setNotice] = useState("")
  const now = new Date(),
    start = new Date(now)
  start.setHours(0, 0, 0, 0)
  if (range === "Last 7 days") start.setDate(start.getDate() - 6)
  if (range === "Last 30 days") start.setDate(start.getDate() - 29)
  if (range === "This month") start.setDate(1)
  const from =
    range === "Custom date range"
      ? new Date(`${fromDate}T00:00:00`).getTime()
      : start.getTime()
  const to =
    range === "Custom date range"
      ? new Date(`${toDate}T23:59:59.999`).getTime()
      : now.getTime()
  const unitPrice = (record: Transaction) =>
    record.price ??
    (record.action === "Stock In"
      ? products.find((item) => item.name === record.product)?.purchasePrice
      : products.find((item) => item.name === record.product)?.price) ??
    0
  const total = (record: Transaction) => record.quantity * unitPrice(record)
  const records = filterRecords(
    transactions,
    from,
    to,
    product,
    action,
    source,
    search,
  ).sort((a, b) =>
    sort === "Highest total"
      ? total(b) - total(a)
      : (transactionTime(a) - transactionTime(b)) *
        (sort === "Newest first" ? -1 : 1),
  )
  const sales = records.filter((record) => record.action === "Sale"),
    incoming = records.filter((record) => record.action === "Stock In")
  const relevant = products.filter((item) => !product || item.name === product)
  const low = relevant.filter((item) => item.quantity <= item.threshold)
  const metrics: [string, string][] = [
    [
      "Estimated profit",
      rupees(
        sales.reduce(
          (sum, record) =>
            sum +
            record.quantity *
              (unitPrice(record) -
                (record.costPrice ??
                  products.find((item) => item.name === record.product)
                    ?.purchasePrice ??
                  unitPrice(record))),
          0,
        ),
      ),
    ],
    [
      "Purchase total",
      rupees(incoming.reduce((sum, record) => sum + total(record), 0)),
    ],
    [
      "Sales revenue",
      rupees(sales.reduce((sum, record) => sum + total(record), 0)),
    ],
    [
      "Units sold",
      String(sales.reduce((sum, record) => sum + record.quantity, 0)),
    ],
    [
      "Stock received",
      String(incoming.reduce((sum, record) => sum + record.quantity, 0)),
    ],
    ["Transactions", String(records.length)],
    [
      "Current stock valuation",
      rupees(
        relevant.reduce(
          (sum, item) =>
            sum + item.quantity * (item.purchasePrice ?? item.price),
          0,
        ),
      ),
    ],
    ["Low-stock products", String(low.length)],
  ]
  const locale =
    language === "हिंदी" ? "hi-IN" : language === "मराठी" ? "mr-IN" : "en-IN"
  const headers = [
    "Date and Time",
    "Product",
    "Action",
    "Quantity",
    "Unit",
    "Unit Price",
    "Total",
    "Source",
    "Status",
  ].map(t)
  const rows = records.map((record) => [
    new Date(transactionTime(record)).toLocaleString(locale),
    t(record.product),
    t(record.action),
    record.quantity,
    t(record.unit),
    unitPrice(record),
    total(record),
    t(
      record.source === "Dashboard"
        ? "Text"
        : record.source === "WhatsApp"
          ? "WhatsApp simulation"
          : record.source,
    ),
    t(record.status),
  ])
  const period = `${new Date(from).toLocaleDateString(locale)} – ${new Date(to).toLocaleDateString(locale)}`
  const reportHTML = () =>
    `<!doctype html><html lang="${locale}"><meta charset="utf-8"><title>StockSathi</title><style>body{font:14px system-ui;margin:32px;color:#10251e}h1{color:#059669}table{border-collapse:collapse;width:100%;font-size:11px}th,td{padding:9px;border-bottom:1px solid #ddd;text-align:left}section{display:flex;flex-wrap:wrap;gap:24px} @media print{button{display:none}thead{display:table-header-group}tr{break-inside:avoid}}</style><h1>▣ StockSathi</h1><h2>${escape(shop)}</h2><p>${escape(t("Reports & analytics"))} · ${escape(period)}</p><section>${metrics.map(([label, value]) => `<p>${escape(t(label))}<br><strong>${escape(value)}</strong></p>`).join("")}</section><p>${escape(t("Mixed units; see individual records. Valuation and alerts show current stock."))}</p><p>${escape([product || t("All"), t(action || "All"), t(source || "All"), search].join(" · "))}</p><table><thead><tr>${headers.map((header) => `<th>${escape(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escape(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></html>`
  const daily = [
    ...new Set(
      records.map((record) =>
        new Date(transactionTime(record)).toLocaleDateString(locale),
      ),
    ),
  ].reverse()
  const revenue = daily.map((label) => ({
    label,
    value: sales
      .filter(
        (record) =>
          new Date(transactionTime(record)).toLocaleDateString(locale) ===
          label,
      )
      .reduce((sum, record) => sum + total(record), 0),
  }))
  const movement = daily.map((label) => ({
    label,
    value: records
      .filter(
        (record) =>
          new Date(transactionTime(record)).toLocaleDateString(locale) ===
          label,
      )
      .reduce(
        (sum, record) =>
          sum + record.quantity * (record.action === "Sale" ? -1 : 1),
        0,
      ),
  }))
  const months = [
    ...new Set(
      sales.map((record) =>
        new Date(transactionTime(record)).toLocaleDateString(locale, {
          month: "long",
          year: "numeric",
        }),
      ),
    ),
  ]
  const monthly = months.map((label) => ({
    label,
    value: sales
      .filter(
        (record) =>
          new Date(transactionTime(record)).toLocaleDateString(locale, {
            month: "long",
            year: "numeric",
          }) === label,
      )
      .reduce((sum, record) => sum + total(record), 0),
  }))
  const top = relevant
    .map((item) => ({
      label: t(item.name),
      value: sales
        .filter((record) => record.product === item.name)
        .reduce((sum, record) => sum + total(record), 0),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
  const options = (values: string[]) =>
    values.map((value) => ({ value, label: t(value) }))
  const change = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setPage(0)
  }
  const pages = Math.max(1, Math.ceil(records.length / 10)),
    currentPage = Math.min(page, pages - 1)
  return (
    <div className="space-y-6 p-4 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-bold">{t("Reports & analytics")}</div>
          <p className="mt-1 text-sm text-slate-500">
            {t("Confirmed transactions · no external messaging or AI API")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              download(
                csvContent(headers, rows),
                "stocksathi-transactions.csv",
                "text/csv;charset=utf-8",
              )
              setNotice(t("File downloaded."))
            }}
          >
            {t("Export CSV")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              download(
                reportHTML(),
                "stocksathi-report.html",
                "text/html;charset=utf-8",
              )
              setNotice(t("File downloaded."))
            }}
          >
            {t("Download Report")}
          </Button>
          <Button
            onClick={() => {
              const popup = window.open("", "_blank")
              if (!popup) {
                setNotice(t("Allow pop-ups to print this report."))
                return
              }
              popup.document.write(reportHTML())
              popup.document.close()
              setTimeout(() => popup.print(), 300)
            }}
          >
            {t("Print Report")}
          </Button>
        </div>
      </div>
      {notice && (
        <p role="status" className="text-sm text-emerald-700">
          {notice}
        </p>
      )}
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 xl:grid-cols-4">
        <SelectField
          label={t("Date range")}
          value={range}
          onChange={change(setRange)}
          options={options([
            "Today",
            "Last 7 days",
            "Last 30 days",
            "This month",
            "Custom date range",
          ])}
        />
        <SelectField
          label={t("Product")}
          value={product}
          onChange={change(setProduct)}
          options={[
            { value: "", label: t("All") },
            ...products.map((item) => ({ value: item.name, label: item.name })),
          ]}
        />
        <SelectField
          label={t("Action")}
          value={action}
          onChange={change(setAction)}
          options={[
            { value: "", label: t("All") },
            ...options(["Stock In", "Sale"]),
          ]}
        />
        <SelectField
          label={t("Source")}
          value={source}
          onChange={change(setSource)}
          options={[
            { value: "", label: t("All") },
            ...["Dashboard", "Voice", "SMS", "WhatsApp"].map((value) => ({
              value,
              label: t(
                value === "Dashboard"
                  ? "Text"
                  : value === "WhatsApp"
                    ? "WhatsApp simulation"
                    : value,
              ),
            })),
          ]}
        />
        {range === "Custom date range" && (
          <>
            <Field
              label={t("From")}
              type="date"
              value={fromDate}
              onChange={change(setFromDate)}
            />
            <Field
              label={t("To")}
              type="date"
              value={toDate}
              onChange={change(setToDate)}
            />
          </>
        )}
        <Field
          label={t("Search")}
          value={search}
          onChange={change(setSearch)}
        />
        <SelectField
          label={t("Sort")}
          value={sort}
          onChange={change(setSort)}
          options={options(["Newest first", "Oldest first", "Highest total"])}
        />
        <Button variant="secondary" onClick={() => setVoice(!voice)}>
          {t("Voice input")}
        </Button>
      </div>
      {voice && (
        <VoiceInput
          language={language}
          onUse={change(setSearch)}
          example="Parle-G"
        />
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, value]) => (
          <StatCard
            key={label}
            label={t(label)}
            value={value}
            icon="chart"
            change={
              label.includes("Current") || label.includes("Low")
                ? t("Today")
                : t(range)
            }
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        {t(
          "Mixed units; see individual records. Valuation and alerts show current stock.",
        )}
      </p>
      <div className="grid gap-5 lg:grid-cols-2">
        <Chart
          title={t("Monthly sales revenue")}
          data={monthly}
          format={rupees}
          empty={t("No matching records.")}
        />
        <Chart
          title={t("Daily sales revenue")}
          data={revenue}
          format={rupees}
          empty={t("No matching records.")}
        />
        <Chart
          title={t("Stock In versus Sales")}
          data={
            records.length
              ? [
                  {
                    label: t("Stock In"),
                    value: incoming.reduce(
                      (sum, record) => sum + record.quantity,
                      0,
                    ),
                  },
                  {
                    label: t("Sale"),
                    value: sales.reduce(
                      (sum, record) => sum + record.quantity,
                      0,
                    ),
                  },
                ]
              : []
          }
          empty={t("No matching records.")}
        />
        <Chart
          title={t("Top-selling products")}
          data={top}
          format={rupees}
          empty={t("No matching records.")}
        />
        <Chart
          title={t("Inventory movement over time")}
          data={movement}
          empty={t("No matching records.")}
        />
        <Chart
          title={t("Low-stock summary")}
          data={low.map((item) => ({
            label: `${t(item.name)} (${t(item.unit)}, ≤ ${item.threshold})`,
            value: item.quantity,
          }))}
          empty={t("No matching records.")}
        />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-5 font-bold">{t("Product-wise performance")}</div>
        <table className="w-full whitespace-nowrap text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              {[
                "Product",
                "Units sold",
                "Sales revenue",
                "Estimated profit",
                "Stock",
              ].map((label) => (
                <th key={label} className="p-3">
                  {t(label)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {relevant.map((item) => {
              const sold = sales.filter(
                (record) => record.product === item.name,
              )
              return (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="p-3">{t(item.name)}</td>
                  <td className="p-3">
                    {sold.reduce((sum, record) => sum + record.quantity, 0)}
                  </td>
                  <td className="p-3">
                    {rupees(
                      sold.reduce((sum, record) => sum + total(record), 0),
                    )}
                  </td>
                  <td className="p-3">
                    {rupees(
                      sold.reduce(
                        (sum, record) =>
                          sum +
                          record.quantity *
                            (unitPrice(record) -
                              (record.costPrice ??
                                item.purchasePrice ??
                                unitPrice(record))),
                        0,
                      ),
                    )}
                  </td>
                  <td className="p-3">
                    {item.quantity} {t(item.unit)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-4 py-3">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows
                .slice(currentPage * 10, currentPage * 10 + 10)
                .map((row, index) => (
                  <tr key={index} className="border-t border-slate-100">
                    {row.map((cell, column) => (
                      <td key={column} className="px-4 py-3">
                        {column === 5 || column === 6
                          ? rupees(Number(cell))
                          : cell}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!records.length && (
          <p className="p-10 text-center text-slate-400">
            {t("No matching records.")}
          </p>
        )}
        <div className="flex items-center justify-between p-4">
          <Button
            variant="secondary"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            {t("Previous")}
          </Button>
          <span className="text-sm">
            {currentPage + 1} / {pages}
          </span>
          <Button
            variant="secondary"
            disabled={currentPage >= pages - 1}
            onClick={() => setPage(currentPage + 1)}
          >
            {t("Next")}
          </Button>
        </div>
      </div>
    </div>
  )
}
