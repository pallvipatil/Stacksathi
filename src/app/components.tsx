import { useTranslator } from "./language"
import { productImage } from "./productImages"
import { useState } from "react"

export type Page = "chat" | "dashboard" | "inventory" | "transactions" | "alerts" | "reports" | "settings" | "sms"
export type Product = {
  id: number
  name: string
  category: string
  quantity: number
  unit: string
  price: number
  threshold: number
  purchasePrice?: number
  supplier?: string
}
export type Transaction = {
  id: number
  date: string
  product: string
  action: "Stock In" | "Sale"
  quantity: number
  unit: string
  source: "WhatsApp" | "Voice" | "SMS" | "Dashboard"
  status: "Confirmed"
  timestamp?: string
  price?: number
  costPrice?: number
}
export type Pending = {
  product: string
  quantity: number
  unit: string
  action: "Stock In" | "Sale"
  source: Transaction["source"]
  confidence: number
}

export const initialProducts: Product[] = [
  {
    id: 1,
    name: "Sugar",
    category: "Grocery",
    quantity: 12,
    unit: "kg",
    price: 48,
    threshold: 8,
  },
  {
    id: 2,
    name: "Rice",
    category: "Grocery",
    quantity: 25,
    unit: "kg",
    price: 62,
    threshold: 10,
  },
  {
    id: 3,
    name: "Parle-G",
    category: "Biscuits",
    quantity: 35,
    unit: "packets",
    price: 10,
    threshold: 10,
  },
  {
    id: 4,
    name: "Fortune Oil",
    category: "Oil",
    quantity: 4,
    unit: "bottles",
    price: 145,
    threshold: 5,
  },
  {
    id: 5,
    name: "Tata Salt",
    category: "Grocery",
    quantity: 18,
    unit: "packets",
    price: 28,
    threshold: 6,
  },
  {
    id: 6,
    name: "Tata Tea",
    category: "Beverage",
    quantity: 6,
    unit: "packets",
    price: 120,
    threshold: 8,
  },
  {
    id: 7,
    name: "Aashirvaad Atta",
    category: "Flour",
    quantity: 14,
    unit: "bags",
    price: 285,
    threshold: 5,
  },
  {
    id: 8,
    name: "Maggi",
    category: "Noodles",
    quantity: 28,
    unit: "packets",
    price: 14,
    threshold: 12,
  },
]

export const initialTransactions: Transaction[] = [
  {
    id: 1,
    date: "Today, 11:15 AM",
    product: "Parle-G",
    action: "Sale",
    quantity: 3,
    unit: "packets",
    source: "Voice",
    status: "Confirmed",
  },
  {
    id: 2,
    date: "Today, 10:32 AM",
    product: "Sugar",
    action: "Stock In",
    quantity: 5,
    unit: "kg",
    source: "WhatsApp",
    status: "Confirmed",
  },
  {
    id: 3,
    date: "Today, 9:48 AM",
    product: "Fortune Oil",
    action: "Sale",
    quantity: 2,
    unit: "bottles",
    source: "SMS",
    status: "Confirmed",
  },
  {
    id: 4,
    date: "Yesterday, 6:20 PM",
    product: "Rice",
    action: "Stock In",
    quantity: 10,
    unit: "kg",
    source: "Dashboard",
    status: "Confirmed",
  },
]

const icons: Record<string, React.ReactNode> = {
  spark: (
    <>
      <path d="M12 3l1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
      <path d="M18.5 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" />
    </>
  ),
  chat: (
    <>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  box: (
    <>
      <path d="m4 7 8-4 8 4-8 4-8-4Z" />
      <path d="m4 7 8 4 8-4v10l-8 4-8-4V7Z" />
      <path d="M12 11v10" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v19l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19V5M4 19h16" />
      <path d="m7 15 4-5 3 3 5-7" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  sms: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M7 9h10M7 13h7" />
    </>
  ),
  arrow: <path d="m9 18 6-6-6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 12 4 4L19 6" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  send: (
    <>
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  store: (
    <>
      <path d="M4 10v10h16V10" />
      <path d="M3 10 5 4h14l2 6" />
      <path d="M8 20v-6h5v6M3 10c0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0" />
    </>
  ),
  logout: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M14 3h7v18h-7" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  filter: <path d="M4 5h16M7 12h10M10 19h4" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
}

type IconProps = {
  name: string
  size?: number
}
export function Icon({ name, size = 20 }: IconProps) {
  const t = useTranslator()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  )
}

export function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
  ariaLabel,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "danger"
  className?: string
  disabled?: boolean
  type?: "button" | "submit"
  ariaLabel?: string
}) {
  const t = useTranslator()

  const styles = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "text-rose-600 bg-rose-50 hover:bg-rose-100",
  }
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
}: {
  label: string
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  readOnly?: boolean
}) {
  const t = useTranslator()

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {t(label ?? "")}
      </span>
      <input
        readOnly={readOnly}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  options: {
    value: string
    label: string
  }[]
}) {
  const t = useTranslator()

  return (
    <label className="block text-sm font-medium text-slate-700">
      {label && <span className="mb-2 block">{t(label)}</span>}
      <select
        aria-label={t(label || "Preferred language")}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.label ?? "")}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Logo({ light = false }: { light?: boolean }) {
  const t = useTranslator()

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
        <Icon name="box" size={23} />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-amber-400" />
      </div>
      <div>
        <div
          className={`text-xl font-bold tracking-tight ${
            light ? "text-white" : "text-slate-900"
          }`}
        >
          Stock
          <span className="text-emerald-600">Sathi</span>
        </div>
        <div
          className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
            light ? "text-slate-400" : "text-slate-400"
          }`}
        >
          {t("Smart inventory")}
        </div>
      </div>
    </div>
  )
}

const nav: {
  id: Page
  label: string
  icon: string
}[] = [
  { id: "chat", label: "AI Assistant", icon: "chat" },
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "inventory", label: "Inventory", icon: "box" },
  { id: "transactions", label: "Transactions", icon: "receipt" },
  { id: "alerts", label: "Alerts", icon: "bell" },
  { id: "reports", label: "Reports", icon: "chart" },
  { id: "sms", label: "SMS simulation", icon: "sms" },
  { id: "settings", label: "Settings", icon: "gear" },
]

export function Shell({
  page,
  setPage,
  alertCount,
  children,
  onExit,
  shop,
  owner,
  language,
  onLanguage,
}: {
  language: string
  onLanguage: (language: string) => void
  shop: string
  owner: string
  page: Page
  setPage: (p: Page) => void
  alertCount: number
  children: React.ReactNode
  onExit: () => void
}) {
  const t = useTranslator()

  const [mobile, setMobile] = useState(false)
  return (
    <div className="min-h-screen bg-[#f5f7f6] text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#10251e] p-5 transition-transform lg:translate-x-0 ${
          mobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Logo light />
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Icon name="store" size={19} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                {shop}
              </div>
              <div className="text-xs text-slate-400">{t("Shop owner")}</div>
            </div>
          </div>
        </div>
        <nav className="mt-6 flex-1 space-y-1">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setPage(item.id)
                setMobile(false)
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                page === item.id
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon name={item.icon} size={19} />
              <span className="flex-1 text-left">{t(item.label ?? "")}</span>
              {item.id === "alerts" && alertCount > 0 && (
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-900">
                  {alertCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button
          onClick={onExit}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <Icon name="logout" size={18} />
          {t("Back to home")}
        </button>
      </aside>
      {mobile && (
        <button
          aria-label={t("Close menu")}
          onClick={() => setMobile(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        />
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobile(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Icon name="menu" />
            </button>
            <div>
              <div className="text-sm font-bold capitalize">
                {t(nav.find((n) => n.id === page)?.label ?? "")}
              </div>
              <div className="hidden text-xs text-slate-400 sm:block">
                {shop} {t("·")}
                {t(" ")}
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SelectField
              value={language}
              onChange={onLanguage}
              options={["English", "हिंदी", "मराठी"].map((value) => ({
                value,
                label: value,
              }))}
            />
            <button
              onClick={() => setPage("alerts")}
              className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
            >
              <Icon name="bell" size={20} />
              {alertCount > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
              )}
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
              {owner
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}

export function StatCard({
  icon,
  label,
  value,
  change,
  tone = "emerald",
}: {
  icon: string
  label: string
  value: string
  change: string
  tone?: string
}) {
  const t = useTranslator()

  const tones: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    violet: "bg-violet-100 text-violet-700",
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          <Icon name={icon} size={20} />
        </div>
        <span className="text-xs font-semibold text-emerald-600">
          {t(change ?? "")}
        </span>
      </div>
      <div className="mt-5 text-2xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{t(label ?? "")}</div>
    </div>
  )
}

export function Status({ product }: { product: Product }) {
  const t = useTranslator()

  const low = product.quantity <= product.threshold,
    out = product.quantity === 0
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        out
          ? "bg-rose-100 text-rose-700"
          : low
            ? "bg-amber-100 text-amber-700"
            : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {t(out ? "Out of Stock" : low ? "Low Stock" : "In Stock")}
    </span>
  )
}

export function TransactionRows({
  transactions,
}: {
  transactions: Transaction[]
}) {
  const t = useTranslator()

  return (
    <div className="divide-y divide-slate-100">
      {transactions.map((record) => (
        <div key={record.id} className="flex items-center gap-3 p-4 sm:px-5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              record.action === "Stock In"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            <Icon
              name={record.action === "Stock In" ? "plus" : "minus"}
              size={17}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">
              {t(record.product)}
            </div>
            <div className="text-xs text-slate-400">
              {t(record.date)} {t("·")}
              {t(record.source)}
            </div>
          </div>
          <div
            className={`text-sm font-bold ${
              record.action === "Stock In"
                ? "text-emerald-600"
                : "text-slate-800"
            }`}
          >
            {t(record.action === "Stock In" ? "+" : "−")}
            {record.quantity} {t(record.unit)}
          </div>
        </div>
      ))}
    </div>
  )
}

export function InventoryPage({
  products,
  onProduct,
  onAdd,
}: {
  products: Product[]
  onProduct: (p: Product) => void
  onAdd: () => void
}) {
  const t = useTranslator()

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All categories")
  const shown = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All categories" || p.category === category),
  )
  return (
    <div className="p-4 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-bold">{t("Inventory")}</div>
          <div className="mt-1 text-sm text-slate-500">
            {t("Track and manage all products in one place.")}
          </div>
        </div>
        <Button onClick={onAdd}>
          <Icon name="plus" size={17} />
          {t("Add Product")}
        </Button>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
            <Icon name="search" size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search products...")}
              className="w-full py-2.5 text-sm outline-none"
            />
          </div>
          <select
            aria-label={t("Filter category")}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="All categories">{t("All categories")}</option>
            {[...new Set(products.map((product) => product.category))].map(
              (category) => (
                <option key={category} value={category}>
                  {t(category)}
                </option>
              ),
            )}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                {[
                  "Product",
                  "Category",
                  "Stock",
                  "Unit",
                  "Price",
                  "Status",
                ].map((x) => (
                  <th key={t(x ?? "")} className="px-5 py-3 font-semibold">
                    {t(x ?? "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr
                  key={p.id}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") onProduct(p)
                  }}
                  onClick={() => onProduct(p)}
                  className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-semibold">
                    <div className="flex items-center gap-3">
                      {productImage(p.name) && (
                        <img
                          src={productImage(p.name)}
                          alt=""
                          className="h-11 w-11 rounded-xl"
                          loading="lazy"
                        />
                      )}
                      {t(p.name)}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {t(p.category ?? "")}
                  </td>
                  <td className="px-5 py-4 font-bold">{p.quantity}</td>
                  <td className="px-5 py-4 text-slate-500">
                    {t(p.unit ?? "")}
                  </td>
                  <td className="px-5 py-4">
                    {t("₹")}
                    {p.price}
                  </td>
                  <td className="px-5 py-4">
                    <Status product={p} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function TransactionsPage({
  transactions,
}: {
  transactions: Transaction[]
}) {
  const t = useTranslator()

  const [filter, setFilter] = useState("All")
  const shown = transactions.filter((t) =>
    filter === "All" || filter === "Sales"
      ? filter === "All" || t.action === "Sale"
      : t.action === filter || t.source === filter,
  )
  return (
    <div className="p-4 sm:p-7">
      <div className="text-2xl font-bold">{t("Transaction history")}</div>
      <div className="mt-1 text-sm text-slate-500">
        {t("A complete audit trail of every inventory movement.")}
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-2 overflow-x-auto border-b border-slate-100 p-4">
          {["All", "Stock In", "Sales", "Voice", "WhatsApp", "SMS"].map((x) => (
            <button
              onClick={() => setFilter(x)}
              key={t(x ?? "")}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${
                filter === x
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {t(x ?? "")}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                {[
                  "Date & Time",
                  "Product",
                  "Action",
                  "Quantity",
                  "Source",
                  "Status",
                ].map((x) => (
                  <th key={t(x ?? "")} className="px-5 py-3 font-semibold">
                    {t(x ?? "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((record) => (
                <tr key={record.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 text-slate-500">{t(record.date)}</td>
                  <td className="px-5 py-4 font-semibold">
                    {t(record.product)}
                  </td>
                  <td
                    className={`px-5 py-4 font-semibold ${
                      record.action === "Stock In"
                        ? "text-emerald-600"
                        : "text-blue-600"
                    }`}
                  >
                    {t(record.action)}
                  </td>
                  <td className="px-5 py-4 font-bold">
                    {t(record.action === "Stock In" ? "+" : "−")}
                    {record.quantity} {t(record.unit)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">
                      {t(record.source)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <Icon name="check" size={14} />
                      {t("Confirmed")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
