import { useTranslator } from "./language"
import { setUILanguage } from "./language"
import VoiceInput from "./VoiceInput"
import ProductCreator from "./ProductCreator"
import Reports from "./Reports"
import Landing, { Footer } from "./Landing"
import { sampleTransactions } from "./sampleData"
import { normalizeNumbers, translate } from "./i18n"
import { useEffect, useRef, useState } from "react"
import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
  useNavigate,
} from "react-router"
import {
  Button,
  Field,
  Icon,
  Logo,
  Shell,
  StatCard,
  InventoryPage,
  TransactionsPage,
  TransactionRows,
  Status,
  SelectField,
  initialProducts,
  type Product,
  type Transaction,
  type Pending,
  type Page,
} from "./components"

type Profile = {
  shop: string
  owner: string
  phone: string
  type: string
  language: string
}
type Message = {
  id: number
  text: string
  vendor?: boolean
  source?: string
  time: string
}
type Interpretation = Pending & {
  price?: number
  supplier?: string
}
const defaultProfile: Profile = {
  shop: "Sharma General Store",
  owner: "Rajesh Sharma",
  phone: "9876543210",
  type: "Kirana / General Store",
  language: "English",
}
const catalogue: Product[] = [
  ...initialProducts,
  {
    id: 9,
    name: "Saffola Oil",
    category: "Oil",
    quantity: 12,
    unit: "bottles",
    price: 175,
    threshold: 5,
  },
  {
    id: 10,
    name: "Sunflower Oil",
    category: "Oil",
    quantity: 9,
    unit: "bottles",
    price: 135,
    threshold: 5,
  },
  {
    id: 11,
    name: "Toor Dal",
    category: "Pulses",
    quantity: 16,
    unit: "kg",
    price: 160,
    threshold: 5,
  },
  {
    id: 12,
    name: "Moong Dal",
    category: "Pulses",
    quantity: 10,
    unit: "kg",
    price: 130,
    threshold: 4,
  },
  {
    id: 13,
    name: "Chana Dal",
    category: "Pulses",
    quantity: 0,
    unit: "kg",
    price: 95,
    threshold: 5,
  },
  {
    id: 14,
    name: "Turmeric Powder",
    category: "Spices",
    quantity: 15,
    unit: "packets",
    price: 35,
    threshold: 6,
  },
].map((product) => ({
  ...product,
  purchasePrice: Math.round(product.price * 0.8),
  supplier:
    product.category === "Pulses"
      ? "Pune Grain Traders"
      : "Sharma Wholesale Distributors",
}))
const money = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
const examples = {
  English: "5 kg sugar add",
  हिंदी: "5 किलो चीनी डाल दो",
  मराठी: "आज 5 किलो तांदूळ आला",
}
const aliases: Record<string, string[]> = {
  Sugar: ["sugar", "चीनी", "साखर"],
  Rice: ["rice", "चावल", "तांदूळ", "तांदुळ"],
  "Parle-G": ["parle", "पार्ले"],
  "Fortune Oil": ["fortune", "फॉर्च्यून"],
  "Saffola Oil": ["saffola"],
  "Sunflower Oil": ["sunflower"],
  "Tata Salt": ["salt", "नमक", "मीठ"],
  "Tata Tea": ["tea", "चाय", "चहा"],
  "Aashirvaad Atta": ["atta", "आटा"],
  "Toor Dal": ["toor", "तूर", "अरहर"],
  "Moong Dal": ["moong", "मूंग", "मूग"],
  "Chana Dal": ["chana", "चना", "हरभरा"],
  "Turmeric Powder": ["turmeric", "हल्दी", "हळद"],
  Maggi: ["maggi", "मैगी"],
}
const clock = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })

function parseMessage(
  text: string,
  products: Product[],
  source: Transaction["source"],
) {
  const normalized = normalizeNumbers(text)
  const quantity = Number(normalized.match(/-?\d+(?:\.\d+)?/)?.[0])
  const matches = products.filter((product) =>
    [product.name.toLowerCase(), ...(aliases[product.name] ?? [])].some(
      (alias) => normalized.includes(alias),
    ),
  )
  const action: Pending["action"] = /sold|sale|sell|बेच|बिक|विक|बिक्री/.test(
    normalized,
  )
    ? "Sale"
    : "Stock In"
  const item = matches.length === 1 ? matches[0] : undefined
  const candidates =
    !item && /oil|तेल/.test(normalized)
      ? products.filter((product) => product.category === "Oil")
      : matches
  const price = normalized.match(/(?:₹|rs\.?|price|@)\s*(\d+(?:\.\d+)?)/)?.[1]
  const pending =
    item && quantity > 0
      ? {
          product: item.name,
          quantity,
          unit: item.unit,
          action,
          source,
          confidence: source === "Voice" ? 96 : 98,
          ...(price ? { price: Number(price) } : {}),
        }
      : null
  return { pending, candidates, quantity, action }
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  const t = useTranslator()

  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement
    container.current?.focus()
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      if (event.key === "Tab") {
        const fields = container.current?.querySelectorAll<HTMLElement>(
          "button, input, select, [tabindex='0']",
        )
        if (!fields?.length) return
        const first = fields[0],
          last = fields[fields.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener("keydown", handle)
    return () => {
      document.removeEventListener("keydown", handle)
      previous?.focus()
    }
  }, [])
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={container}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={t(title ?? "")}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl outline-none"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t(title ?? "")}</h2>
          <button
            aria-label={t("Close dialog")}
            className="rounded-xl p-2 hover:bg-slate-100"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function InterpretationForm({
  value,
  products,
  save,
  close,
  language,
}: {
  value: Interpretation
  products: Product[]
  save: (value: Interpretation) => void
  close: () => void
  language: string
}) {
  const t = (text: string) => translate(language, text)
  const [draft, setDraft] = useState(value)
  const product = products.find((item) => item.name === draft.product)!
  const valid =
    Number.isFinite(draft.quantity) &&
    draft.quantity > 0 &&
    (["kg", "litre"].includes(product.unit) ||
      Number.isInteger(draft.quantity)) &&
    (draft.action !== "Sale" || draft.quantity <= product.quantity) &&
    (draft.price === undefined || draft.price > 0)
  return (
    <Modal title={t("Review transcription")} onClose={close}>
      <div className="space-y-4">
        <SelectField
          label={t("Product")}
          value={draft.product}
          onChange={(name) => {
            const item = products.find((product) => product.name === name)!
            setDraft({ ...draft, product: item.name, unit: item.unit })
          }}
          options={products.map((item) => ({
            value: item.name,
            label: item.name,
          }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <Field
            label={t("Quantity")}
            type="number"
            value={draft.quantity}
            onChange={(value) =>
              setDraft({ ...draft, quantity: Number(value) })
            }
          />
          <Field
            label={t("Unit")}
            readOnly
            value={draft.unit}
            onChange={() => {}}
          />
        </div>
        <SelectField
          label={t("Action")}
          value={draft.action}
          onChange={(action) =>
            setDraft({
              ...draft,
              action: action as Pending["action"],
            })
          }
          options={["Stock In", "Sale"].map((value) => ({
            value,
            label: t(value),
          }))}
        />
        <Field
          label={
            draft.action === "Sale"
              ? t("Selling price (₹)")
              : t("Purchase price (₹, optional)")
          }
          type="number"
          value={draft.price ?? product.price}
          onChange={(value) => setDraft({ ...draft, price: Number(value) })}
        />
        {draft.action === "Stock In" && (
          <Field
            label={t("Supplier (optional)")}
            value={draft.supplier ?? ""}
            onChange={(supplier) => setDraft({ ...draft, supplier })}
          />
        )}
        <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          {product.quantity} {t("→")}
          {t(" ")}
          {product.quantity +
            (draft.action === "Sale" ? -draft.quantity : draft.quantity)}
          {t(" ")}
          {t(product.unit ?? "")}
          {t(".")}
          {t("No stock changes until confirmation.")}
        </p>
        {!valid && (
          <p className="text-sm text-red-600">
            {t(
              "Complete missing fields. Use valid quantities and a positive selling price.",
            )}
          </p>
        )}
        <Button
          className="w-full py-3"
          disabled={!valid}
          onClick={() => save(draft)}
        >
          {t("Review transcription")} <Icon name="arrow" size={16} />
        </Button>
      </div>
    </Modal>
  )
}

function Pipeline({
  stage,
  source,
  pending,
  onClose,
}: {
  stage: number
  source: string
  pending: Interpretation | null
  onClose: () => void
}) {
  const t = useTranslator()

  const steps = [
    ["Message received", `${source} → Webhook / FastAPI`],
    [
      source === "Voice" ? "Speech converted to text" : "Text normalized",
      source === "Voice"
        ? "Whisper · multilingual transcription"
        : "English · हिंदी · मराठी",
    ],
    [
      "AI entity extraction",
      pending
        ? `${pending.product} · ${pending.quantity} ${pending.unit} · ${pending.action}`
        : "LLM · identify item, quantity, unit and action",
    ],
    ["Catalogue matching", "Fuzzy matching against your shop catalogue"],
    [
      "Validation & vendor approval",
      "Stock rules checked · explicit confirmation required",
    ],
    [
      "Inventory updated",
      "PostgreSQL inventory · represented by shared local state",
    ],
    ["Confirmation & dashboard sync", "Reply to vendor · live React dashboard"],
  ]
  return (
    <Modal title={t("A message. A smarter inventory.")} onClose={onClose}>
      <p className="mb-5 text-sm text-slate-500">
        {t("Architecture simulation · no live API or backend connection")}
      </p>
      <div className="space-y-1">
        {steps.map(([title, detail], index) => (
          <div key={t(title ?? "")} className="flex gap-3 py-2">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                index < stage
                  ? "bg-emerald-100 text-emerald-700"
                  : index === stage
                    ? "animate-pulse bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {index < stage ? <Icon name="check" size={16} /> : index + 1}
            </div>
            <div>
              <div className="text-sm font-bold">{t(title ?? "")}</div>
              <p className="mt-1 text-xs text-slate-500">{t(detail)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
        {t(
          stage < 5
            ? "Waiting for your confirmation before changing inventory."
            : "Confirmed. All views now use the updated inventory.",
        )}
      </div>
    </Modal>
  )
}

function loadDemo<T>(key: string, fallback: T): T {
  try {
    const saved = JSON.parse(
      localStorage.getItem("stocksathi-demo-v2") ?? "null",
    )
    return saved?.[key] ?? fallback
  } catch {
    return fallback
  }
}

function Prototype() {
  const t = useTranslator()

  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname.slice(1)
  const page: Page = (
    [
      "chat",
      "dashboard",
      "inventory",
      "transactions",
      "alerts",
      "reports",
      "settings",
      "sms",
    ].includes(path)
      ? path
      : "chat"
  ) as Page
  const [products, setProducts] = useState<Product[]>(() =>
    loadDemo("products", catalogue),
  )
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadDemo("transactions", sampleTransactions(catalogue)),
  )
  const [profile, setProfile] = useState(() =>
    loadDemo("profile", defaultProfile),
  )
  useEffect(() => {
    document.title = "StockSathi — Inventory Assistant"
    setUILanguage(profile.language)
    if (!["English", "हिंदी", "मराठी"].includes(profile.language))
      setProfile((current) => ({ ...current, language: "English" }))
  }, [profile.language])
  const [messages, setMessages] = useState<Message[]>([])
  const [pending, setPending] = useState<Interpretation | null>(null)
  const [clarify, setClarify] =
    useState<ReturnType<typeof parseMessage> | null>(null)
  const [input, setInput] = useState("")
  const [stage, setStage] = useState(-1)
  const [processing, setProcessing] = useState(false)
  const [pipeline, setPipeline] = useState(false)
  const [editing, setEditing] = useState<Interpretation | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Product | null>(null)
  const [notice, setNotice] = useState("")
  const [panel, setPanel] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const confirmationLock = useRef(false)
  useEffect(() => {
    try {
      localStorage.setItem(
        "stocksathi-demo-v2",
        JSON.stringify({ products, transactions, profile }),
      )
    } catch {
      setNotice(
        translate(
          profile.language,
          "Storage unavailable; changes will last only this session.",
        ),
      )
    }
  }, [products, transactions, profile])
  const [onboarded, setOnboarded] = useState(false)
  const [read, setRead] = useState<number[]>([])
  const [dismissed, setDismissed] = useState<number[]>([])
  const [notifications, setNotifications] = useState([true, true, true])
  const [channels, setChannels] = useState([true, true])
  const [source, setSource] = useState<Transaction["source"]>("WhatsApp")
  const [settingDraft, setSettingDraft] = useState(defaultProfile)
  const [threshold, setThreshold] = useState("10")
  const [applyThreshold, setApplyThreshold] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const chatScroll = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const low = products.filter(
    (product) => product.quantity <= product.threshold,
  )
  const activeAlerts = low.filter((product) => !dismissed.includes(product.id))
  const soldValue = transactions
    .filter(
      (transaction) =>
        transaction.action === "Sale" &&
        new Date(transaction.timestamp ?? transaction.date).toDateString() ===
          new Date().toDateString(),
    )
    .reduce(
      (sum, transaction) =>
        sum +
        transaction.quantity *
          ((transaction as Transaction & { price?: number }).price ??
            products.find((product) => product.name === transaction.product)
              ?.price ??
            0),
      0,
    )
  const stockValue = products.reduce(
    (sum, product) =>
      sum + product.quantity * (product.purchasePrice ?? product.price),
    0,
  )
  const go = (page: Page) => navigate(`/${page}`)
  const addMessage = (text: string, vendor = false, channel?: string) =>
    setMessages((current) => [
      ...current,
      {
        id: Date.now() + Math.random(),
        text,
        vendor,
        source: channel,
        time: clock(),
      },
    ])
  useEffect(() => {
    chatScroll.current?.scrollTo({
      top: chatScroll.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, pending, clarify, processing])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => {
    if (!notice) return
    const timeout = setTimeout(() => setNotice(""), 5000)
    return () => clearTimeout(timeout)
  }, [notice])
  const cancel = () => {
    setPending(null)
    setClarify(null)
    setStage(-1)
    addMessage("Cancelled. Your inventory has not changed.")
  }
  const send = (
    text: string,
    channel: Transaction["source"] = page === "sms" ? "SMS" : "WhatsApp",
  ) => {
    if (!text.trim() || processing || pending || clarify) return
    if (
      (channel === "SMS" && !channels[1]) ||
      ((channel === "WhatsApp" || channel === "Voice") && !channels[0])
    ) {
      setNotice(`${channel} is disconnected. Reconnect it in Settings.`)
      return
    }
    setSource(channel)
    setInput("")
    setStage(0)
    setProcessing(true)
    addMessage(
      channel === "Voice" ? `Voice transcription: “${text}”` : text,
      true,
      channel,
    )
    const normalized = text.toLowerCase()
    const result = parseMessage(text, products, channel)
    for (let step = 1; step <= 4; step++)
      timers.current.push(setTimeout(() => setStage(step), step * 280))
    timers.current.push(
      setTimeout(() => {
        setProcessing(false)
        if (
          /sales|sales dikhao|बिक्री दिख|विक्री दाख/.test(normalized) &&
          !/\d/.test(normalized)
        ) {
          addMessage(
            `Today's sales: ${money(soldValue)} · ${transactions.filter((transaction) => transaction.action === "Sale" && new Date(transaction.timestamp ?? transaction.date).toDateString() === new Date().toDateString()).length} confirmed sales. Open Reports for details.`,
          )
          return
        }
        if (
          /check|how much|available|stock.*\?|kitna|कितना|किती|remaining/.test(
            normalized,
          )
        ) {
          addMessage(
            result.candidates.length
              ? result.candidates
                  .map(
                    (product) =>
                      `${product.name}: ${product.quantity} ${product.unit}`,
                  )
                  .join("\n")
              : products
                  .map(
                    (product) =>
                      `${product.name}: ${product.quantity} ${product.unit}`,
                  )
                  .join("\n"),
          )
          return
        }
        if (result.pending) setPending(result.pending)
        else {
          setClarify(result)
          addMessage(
            result.candidates.length
              ? "I’m not completely sure which product you mean. Please choose the item below."
              : "I couldn’t safely identify a product and quantity. Choose a catalogue item and enter the quantity, or cancel and try again.",
          )
        }
      }, 1300),
    )
  }
  const confirm = () => {
    if (!pending || confirmationLock.current) return
    const product = products.find((product) => product.name === pending.product)
    if (
      !product ||
      pending.quantity <= 0 ||
      !Number.isFinite(pending.quantity) ||
      (!["kg", "litre"].includes(product.unit) &&
        !Number.isInteger(pending.quantity)) ||
      (pending.action === "Sale" && pending.quantity > product.quantity)
    ) {
      setNotice("Cannot confirm: check quantity and available stock.")
      return
    }
    confirmationLock.current = true
    const after =
      product.quantity +
      (pending.action === "Sale" ? -pending.quantity : pending.quantity)
    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, quantity: after } : item,
      ),
    )
    const transaction = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      product: product.name,
      action: pending.action,
      quantity: pending.quantity,
      unit: product.unit,
      source: pending.source,
      status: "Confirmed" as const,
      price:
        pending.price ??
        (pending.action === "Stock In"
          ? (product.purchasePrice ?? product.price)
          : product.price),
      costPrice: product.purchasePrice ?? product.price,
      supplier: pending.supplier,
    }
    setTransactions((current) => [transaction, ...current])
    queueMicrotask(() => {
      confirmationLock.current = false
    })
    const text = ` ${
      pending.action === "Sale" ? "Sale recorded" : "Stock updated successfully"
    }.\n${product.name}: ${product.quantity} → ${after} ${product.unit}${
      after <= product.threshold ? "\n Low stock. Please restock soon." : ""
    }`
    addMessage(text)
    setNotice(text)
    setStage(7)
    setPending(null)
    setDismissed((current) => current.filter((id) => id !== product.id))
    setRead((current) => current.filter((id) => id !== product.id))
  }
  const simulate = (kind: string) => {
    if (pending || clarify || processing) {
      setNotice("Confirm or cancel the current interpretation first.")
      return
    }
    if (kind === "reset") {
      setProducts(catalogue)
      setTransactions(sampleTransactions(catalogue))
      setMessages([])
      setRead([])
      setDismissed([])
      setStage(-1)
      setNotice("Workspace reset. Parle-G starts at 35 packets.")
      go("chat")
      return
    }
    if (kind === "low") {
      const product = products.find((product) => product.name === "Parle-G")
      if (!product) {
        setNotice(t("Select a product in Inventory to update stock."))
        return
      }
      setSource("Dashboard")
      setPending({
        product: product.name,
        quantity: Math.max(1, product.quantity - 8),
        unit: product.unit,
        action: "Sale",
        source: "Dashboard",
        confidence: 100,
      })
      addMessage(
        "Sample workflow: record a sale leaving 8 Parle-G packets. Confirm to trigger a low-stock warning.",
      )
      go("chat")
      return
    }
    go(kind === "sms" ? "sms" : "chat")
    send(
      kind === "voice"
        ? "5 kg sugar add karo"
        : kind === "sale"
          ? "3 Parle-G packets sold"
          : kind === "sms"
            ? "sale 2 oil"
            : kind === "wrong"
              ? "10 dabbe oil"
              : "10 Parle-G packets aaye hain",
      kind === "voice" ? "Voice" : kind === "sms" ? "SMS" : "WhatsApp",
    )
  }
  const beginAdjust = (product: Product, action: Pending["action"]) => {
    if (pending || clarify || processing) {
      setNotice("Confirm or cancel the current interpretation first.")
      return
    }
    setSelected(null)
    setEditing({
      product: product.name,
      quantity: 1,
      unit: product.unit,
      action,
      source: "Dashboard",
      confidence: 100,
      price: product.price,
    })
  }
  const selectedProduct = products.find((product) => product.id === selected)
  const renderConfirmation = () =>
    pending && (
      <div className="max-w-lg rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-bold">
            <Icon name="spark" size={17} />
            {t(" ")}
            {translate(profile.language, "Review transcription")}
          </span>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
            {pending.confidence}
            {t("% confidence")}
          </span>
        </div>
        <div className="my-4 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4">
          {[
            ["Product", pending.product],
            ["Quantity", `${pending.quantity} ${pending.unit}`],
            ["Action", pending.action],
            [
              "Unit Price",
              money(
                pending.price ??
                  products.find((product) => product.name === pending.product)!
                    .price,
              ),
            ],
          ].map(([label, value]) => (
            <div key={translate(profile.language, label)}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {translate(profile.language, label)}
              </div>
              <div className="mt-1 text-sm font-bold">
                {translate(profile.language, value)}
              </div>
            </div>
          ))}
        </div>
        <p className="mb-4 text-xs text-slate-500">
          {translate(profile.language, "No stock changes until confirmation.")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={confirm}>
            <Icon name="check" size={16} />
            {t(page === "sms" ? "1. " : "")}
            {translate(profile.language, "Confirm")}
          </Button>
          <Button variant="secondary" onClick={() => setEditing(pending)}>
            <Icon name="edit" size={15} />
            {t(page === "sms" ? "2. " : "")}
            {translate(profile.language, "Edit")}
          </Button>
          <Button variant="ghost" onClick={cancel}>
            {t(page === "sms" ? "3. " : "")}
            {translate(profile.language, "Cancel")}
          </Button>
        </div>
        <button
          className="mt-4 text-xs font-semibold text-emerald-600"
          onClick={() => setPipeline(true)}
        >
          {t("View AI processing pipeline →")}
        </button>
      </div>
    )
  const assistant = (
    <div className="grid min-h-[calc(100vh-104px)] xl:grid-cols-[1fr_310px]">
      <section className="flex h-[calc(100dvh-104px)] min-w-0 flex-col bg-[#eef3f0]">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-4">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Icon name={page === "sms" ? "sms" : "spark"} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="flex-1">
            <h1 className="font-bold">
              {t(page === "sms" ? "StockSathi SMS" : "StockSathi AI")}
            </h1>
            <p className="text-xs text-slate-500">
              <span className="text-emerald-600">{t("● Online")}</span>{" "}
              {t("· Your inventory assistant")}
            </p>
          </div>
          <button
            onClick={() => setPipeline(true)}
            className="hidden rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold sm:block"
          >
            {t("How AI works ↗")}
          </button>
          <button
            aria-label={t("Show simulation controls")}
            className="rounded-xl p-2 xl:hidden"
            onClick={() => setPanel(!panel)}
          >
            <Icon name="more" />
          </button>
        </header>
        <div ref={chatScroll} className="flex-1 overflow-y-auto p-4 sm:p-7">
          <div className="mx-auto max-w-2xl space-y-5">
            <div className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t("Today · Workspace")}
            </div>
            <div className="max-w-lg rounded-2xl rounded-bl-sm bg-white p-5 text-sm leading-6 shadow-sm">
              <p className="font-semibold">
                {t("Namaste,")}
                {profile.owner.split(" ")[0]}
                {t("!")}
              </p>
              <p className="mt-1 text-slate-600">
                {t(
                  "Your shop, one message away. Tell me what arrived or what sold — I’ll handle the numbers.",
                )}
              </p>
              <p className="mt-3 text-xs text-slate-400">
                {t("English · हिंदी · मराठी")}
              </p>
            </div>
            {page === "sms" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                {t(
                  "No internet? Same inventory, simple SMS. Type a message, then reply 1 to confirm, 2 to edit, or 3 to cancel. Messaging is simulated.",
                )}
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-lg whitespace-pre-line rounded-2xl p-4 text-sm leading-6 shadow-sm ${
                  message.vendor
                    ? "ml-auto rounded-br-sm bg-emerald-600 text-white"
                    : "rounded-bl-sm bg-white text-slate-700"
                }`}
              >
                <p>{message.vendor ? message.text : t(message.text)}</p>
                <p
                  className={`mt-2 text-right text-[10px] ${
                    message.vendor ? "text-emerald-100" : "text-slate-400"
                  }`}
                >
                  {message.source && `${message.source} · `}
                  {message.time}
                  {t(message.vendor ? " · Delivered " : "")}
                </p>
              </div>
            ))}
            {processing && (
              <div
                role="status"
                className="max-w-lg rounded-2xl bg-white p-4 text-sm text-emerald-700"
              >
                <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                {t(
                  source === "Voice" && stage < 2
                    ? "Transcribing voice message…"
                    : [
                        "Message received…",
                        "Normalizing message…",
                        "AI extracting item and quantity…",
                        "Matching your catalogue…",
                        "Validating your inventory…",
                      ][Math.min(stage, 4)],
                )}
                <button
                  onClick={() => setPipeline(true)}
                  className="mt-2 block text-xs font-semibold underline"
                >
                  {t("Watch AI process")}
                </button>
              </div>
            )}
            {clarify && (
              <div className="max-w-lg rounded-2xl border border-amber-200 bg-white p-5">
                <div className="mb-3 text-sm font-bold text-amber-700">
                  {t("Clarification needed · no stock changed")}
                </div>
                <p className="mb-3 text-sm text-slate-500">
                  {t(
                    "Please select the item. You can correct the quantity next.",
                  )}
                </p>
                <div className="space-y-2">
                  {(clarify.candidates.length
                    ? clarify.candidates
                    : products
                  ).map((product) => (
                    <button
                      key={product.id}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left text-sm font-semibold hover:border-emerald-400 hover:bg-emerald-50"
                      onClick={() => {
                        const next = {
                          product: product.name,
                          quantity: clarify.quantity > 0 ? clarify.quantity : 1,
                          unit: product.unit,
                          action: clarify.action,
                          source,
                          confidence: 100,
                        }
                        setClarify(null)
                        if (!(clarify.quantity > 0))
                          setEditing({
                            ...next,
                            quantity: clarify.quantity || 0,
                          })
                        else setPending(next)
                        addMessage(
                          ` Got it. ${next.quantity} ${product.unit} of ${product.name}. Please review and confirm.`,
                        )
                      }}
                    >
                      {t(product.name ?? "")}
                      <span className="text-xs font-normal text-slate-400">
                        {t(product.unit ?? "")} {t("→")}
                      </span>
                    </button>
                  ))}
                </div>
                <Button onClick={cancel} variant="ghost" className="mt-3">
                  {t("Cancel")}
                </Button>
              </div>
            )}
            {renderConfirmation()}
            <div ref={end} />
          </div>
        </div>
        <footer className="border-t border-slate-200 bg-white p-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {[
                examples[(profile.language as keyof typeof examples)] ??
                  examples.English,
                "3 Parle-G packets sold",
                "Check stock",
                "Show today's sales",
              ].map((example) => (
                <button
                  key={example}
                  disabled={!!pending || !!clarify || processing}
                  onClick={() => send(example)}
                  className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-40"
                >
                  {t(example)}
                </button>
              ))}
            </div>
            {voiceOpen && !pending && !clarify && !processing && (
              <div className="mb-3">
                <VoiceInput
                  language={profile.language}
                  onUse={(text) => {
                    setVoiceOpen(false)
                    send(text, "Voice")
                  }}
                  example={
                    profile.language === "हिंदी"
                      ? "पाँच किलो चीनी जोड़ो।"
                      : profile.language === "मराठी"
                        ? "पाच किलो साखर जोडा."
                        : "Add five kilos of sugar."
                  }
                />
              </div>
            )}
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                if (page === "sms" && pending && /^[123]$/.test(input.trim())) {
                  const reply = input.trim()
                  setInput("")
                  if (reply === "1") confirm()
                  if (reply === "2") setEditing(pending)
                  if (reply === "3") cancel()
                } else send(input)
              }}
            >
              <Button
                variant="secondary"
                ariaLabel={translate(profile.language, "Voice input")}
                disabled={!!pending || !!clarify || processing}
                onClick={() => setVoiceOpen(!voiceOpen)}
              >
                <Icon name="mic" />
              </Button>
              <input
                aria-label={t("Message to StockSathi")}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={processing}
                placeholder={t(
                  pending
                    ? page === "sms"
                      ? "Reply 1, 2 or 3…"
                      : "Review the AI interpretation above…"
                    : "Type naturally, e.g. 5 kilo sugar add karo…",
                )}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
              <Button
                type="submit"
                ariaLabel={translate(profile.language, "Send message")}
                disabled={
                  processing ||
                  (!!pending && page !== "sms") ||
                  !!clarify ||
                  !input.trim()
                }
                className="px-4 py-3"
              >
                <Icon name="send" size={18} />
              </Button>
            </form>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              {t(
                "AI interprets. You confirm. Your inventory stays in your control.",
              )}
            </p>
          </div>
        </footer>
      </section>
      <aside
        className={`${
          panel ? "block" : "hidden"
        } h-[calc(100dvh-104px)] overflow-y-auto border-l border-slate-200 bg-white p-5 xl:block`}
      >
        <div className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-600">
          {t("Your shop, live")}
        </div>
        <h2 className="mt-2 text-lg font-bold">{t("Inventory at a glance")}</h2>
        <div className="mt-5 rounded-2xl border border-slate-200 p-4">
          <div className="flex justify-between text-sm font-semibold">
            <span>{t("Parle-G")}</span>
            <span className="text-emerald-600">{t("Live ●")}</span>
          </div>
          <div className="mt-3 text-4xl font-bold">
            {products.find((product) => product.name === "Parle-G")?.quantity ??
              0}
            <span className="ml-2 text-sm font-medium text-slate-400">
              {t("packets")}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {t("Example: 35 → 45 → 42")}
          </p>
          <button
            onClick={() => go("inventory")}
            className="mt-4 text-xs font-bold text-emerald-600"
          >
            {t("View inventory →")}
          </button>
        </div>
        <button
          onClick={() => go("alerts")}
          className="mt-3 w-full rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-xs text-amber-800"
        >
          <b>
            {" "}
            {low.length} {t("items need restocking")}
          </b>
          <p className="mt-1">
            {low.map((product) => product.name).join(", ")}
          </p>
        </button>
        <div className="my-6 border-t border-slate-100" />
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">{t("Channel simulations")}</h3>
          <span className="rounded bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
            {t("SIMULATION")}
          </span>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          {t(
            "A complete shop workflow in 2 minutes. No real messages are sent.",
          )}
        </p>
        <div className="mt-4 space-y-2">
          {[
            ["text", "Simulate WhatsApp Text", "chat"],
            ["sale", "Record 3-packet sale", "receipt"],
            ["voice", "Simulate Voice Message", "mic"],
            ["sms", "Simulate SMS", "sms"],
            ["wrong", "Simulate Wrong Input", "spark"],
            ["low", "Simulate Low Stock", "bell"],
          ].map(([kind, label, icon]) => (
            <button
              key={kind}
              onClick={() => simulate(kind)}
              disabled={!!pending || !!clarify || processing}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-left text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-40"
            >
              <Icon name={icon} size={16} />
              {t(label ?? "")}
              <span className="ml-auto text-slate-300">{t("→")}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => simulate("reset")}
          className="mt-4 text-xs font-semibold text-slate-400 hover:text-red-600"
        >
          {t("Reset workspace")}
        </button>
        <div className="mt-6 rounded-xl bg-[#10251e] p-4 text-white">
          <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">
            {t("StockSathi")}
          </div>
          <p className="mt-2 text-sm font-bold">{t("Built for Bharat.")}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {t("Simple inventory management")}
            <br />
            {t("Local Vendor Inventory Digitization")}
          </p>
        </div>
      </aside>
    </div>
  )

  if (location.pathname === "/")
    return (
      <div>
        <Landing
          language={profile.language}
          onLanguage={(language) => {
            setProfile({ ...profile, language })
            setSettingDraft({ ...profile, language })
          }}
          onDemo={() => go("chat")}
          onStart={() => navigate("/onboarding")}
          onNavigate={navigate}
        />
      </div>
    )
  if (location.pathname === "/onboarding")
    return (
      <div className="min-h-screen bg-[#f7faf8] px-5 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex justify-between">
            <Logo />
            <Button variant="ghost" onClick={() => navigate("/")}>
              {t("Back")}
            </Button>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/30">
            {!onboarded ? (
              <>
                <div className="text-xs font-bold tracking-widest text-emerald-600">
                  {t("SET UP YOUR SHOP · 1 MINUTE")}
                </div>
                <h1 className="mt-3 text-3xl font-bold">
                  {t("Meet your new shop assistant.")}
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                  {t("Just a few details. No POS training needed.")}
                </p>
                <ProfileFields profile={profile} setProfile={setProfile} />
                <Button
                  className="mt-6 w-full py-3"
                  disabled={
                    !profile.shop.trim() ||
                    !profile.owner.trim() ||
                    !/^(?:\+91\s*)?\d{10}$/.test(
                      profile.phone.replace(/\s/g, ""),
                    )
                  }
                  onClick={() => {
                    setOnboarded(true)
                    setSettingDraft(profile)
                  }}
                >
                  {t("Create my shop")}
                </Button>
                <p className="mt-3 text-xs text-slate-400">
                  {t(
                    "Use a 10-digit Indian mobile number. Simulation only — no OTP sent.",
                  )}
                </p>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Icon name="check" size={30} />
                </div>
                <h1 className="mt-6 text-3xl font-bold">
                  {t("Your inventory assistant is ready.")}
                </h1>
                <p className="mt-3 text-slate-500">
                  {t("Just send a message to StockSathi.")}
                </p>
                <div className="my-6 grid grid-cols-2 gap-3 text-left">
                  {[
                    ["Add stock", "5 kg sugar add karo"],
                    ["Record a sale", "3 Parle-G packets sold"],
                    ["Check stock", "Check stock"],
                    ["Today's sales", "Show today's sales"],
                  ].map(([title, example]) => (
                    <div
                      key={t(title ?? "")}
                      className="rounded-xl bg-slate-50 p-4"
                    >
                      <b className="text-sm">{t(title ?? "")}</b>
                      <p className="mt-1 text-xs text-slate-500">
                        {t(example)}
                      </p>
                    </div>
                  ))}
                </div>
                <Button className="w-full py-3" onClick={() => go("chat")}>
                  {t("Start using StockSathi →")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )

  return (
    <Shell
      language={profile.language}
      onLanguage={(language) => {
        setProfile({ ...profile, language })
        setSettingDraft({ ...profile, language })
      }}
      shop={profile.shop}
      owner={profile.owner}
      page={page}
      setPage={go}
      alertCount={
        activeAlerts.filter((product) => !read.includes(product.id)).length
      }
      onExit={() => navigate("/")}
    >
      <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/60 px-5 py-2 text-[11px] text-emerald-800">
        <span className="truncate">
          {profile.shop} {t("·")}
          {profile.owner}
          {t(" ")}
          <span className="hidden sm:inline">
            {t("· All channels share one inventory")}
          </span>
        </span>
      </div>
      {(page === "chat" || page === "sms") && assistant}
      {page === "inventory" && (
        <InventoryPage
          products={products}
          onAdd={() =>
            setNewProduct({
              id: Date.now(),
              name: "",
              category: "Grocery",
              quantity: 0,
              unit: "packets",
              price: 10,
              threshold: Number(threshold),
            })
          }
          onProduct={(product) => setSelected(product.id)}
        />
      )}
      {page === "transactions" && (
        <TransactionsPage transactions={transactions} />
      )}
      {page === "dashboard" && (
        <div className="p-4 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-emerald-600">
                {t("YOUR SHOP. YOUR CONTROL.")}
              </p>
              <h1 className="mt-2 text-2xl font-bold">
                {t("Good day,")}
                {profile.owner.split(" ")[0]}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t("Here’s what’s happening at")}
                {profile.shop}
                {t(".")}
              </p>
            </div>
            <Button onClick={() => go("chat")}>
              <Icon name="chat" size={17} /> {t("Update with AI")}
            </Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon="box"
              label={t("Total Products")}
              value={String(products.length)}
              change={t("In your catalogue")}
            />
            <StatCard
              icon="grid"
              label={t("Total Stock Value")}
              value={money(stockValue)}
              change={t("Live inventory value")}
              tone="blue"
            />
            <StatCard
              icon="chart"
              label={t("Today's Sales")}
              value={money(soldValue)}
              change={`${transactions.filter((transaction) => transaction.action === "Sale" && new Date(transaction.timestamp ?? transaction.date).toDateString() === new Date().toDateString()).length} confirmed sales`}
            />
            <StatCard
              icon="bell"
              label={t("Low Stock Items")}
              value={String(low.length)}
              change={t("Restock recommended")}
              tone="amber"
            />
          </div>
          <div className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex justify-between">
                <h2 className="font-bold">{t("Inventory overview")}</h2>
                <button
                  className="text-xs font-semibold text-emerald-600"
                  onClick={() => go("inventory")}
                >
                  {t("View all →")}
                </button>
              </div>
              {products.slice(0, 6).map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelected(product.id)}
                  className="mt-3 flex w-full items-center justify-between gap-2 rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50"
                >
                  <div>
                    <div className="text-sm font-semibold">
                      {t(product.name ?? "")}
                    </div>
                    <div className="text-xs text-slate-400">
                      {t(product.category ?? "")}
                    </div>
                  </div>
                  <span className="text-sm font-bold">
                    {product.quantity}
                    {t(" ")}
                    <span className="text-xs font-normal text-slate-400">
                      {t(product.unit ?? "")}
                    </span>
                  </span>
                  <Status product={product} />
                </button>
              ))}
            </div>
            <div className="space-y-5">
              <div className="rounded-2xl border border-amber-200 bg-white p-5">
                <h2 className="font-bold">
                  {" "}
                  {t("Stock needs your attention")}
                </h2>
                {low.map((product) => (
                  <div
                    key={product.id}
                    className="mt-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {t(product.name ?? "")}
                      </p>
                      <p className="text-xs text-amber-700">
                        {t("Only")}
                        {product.quantity} {t(product.unit ?? "")} {t("left")}
                      </p>
                    </div>
                    <button
                      onClick={() => beginAdjust(product, "Stock In")}
                      className="text-xs font-bold text-emerald-600"
                    >
                      {t("Restock →")}
                    </button>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-[#10251e] p-5 text-white">
                <p className="text-xs text-emerald-400">
                  {t("CHAT → CONFIRM → LIVE INVENTORY")}
                </p>
                <h2 className="mt-3 text-xl font-bold">
                  {t("No spreadsheets.")}
                  <br />
                  {t("Just send a message.")}
                </h2>
                <Button onClick={() => go("reports")} className="mt-5">
                  {t("View live analytics →")}
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex justify-between">
              <h2 className="font-bold">{t("Recent transactions")}</h2>
              <button
                className="text-xs font-semibold text-emerald-600"
                onClick={() => go("transactions")}
              >
                {t("View history →")}
              </button>
            </div>
            {transactions.length ? (
              <TransactionRows transactions={transactions.slice(0, 5)} />
            ) : (
              <p className="py-6 text-sm text-slate-400">
                {t("Your first confirmed message will appear here.")}
              </p>
            )}
          </div>
        </div>
      )}
      {page === "reports" && (
        <Reports
          products={products}
          transactions={transactions}
          language={profile.language}
          shop={profile.shop}
        />
      )}
      {page === "alerts" && (
        <div className="p-4 sm:p-7">
          <div className="flex justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t("Low stock alerts")}</h1>
              <p className="mt-2 text-sm text-slate-500">
                {t("Restock before your customers ask.")}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setRead(activeAlerts.map((product) => product.id))}
            >
              {t("Mark all as read")}
            </Button>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {activeAlerts.map((product) => (
              <div
                key={product.id}
                className={`rounded-2xl border bg-white p-5 ${
                  read.includes(product.id)
                    ? "border-slate-200"
                    : "border-amber-300"
                }`}
              >
                <div className="flex justify-between">
                  <p className="text-xs font-bold tracking-widest text-amber-600">
                    {t(product.quantity === 0 ? "OUT OF STOCK" : "LOW STOCK")}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {t(read.includes(product.id) ? "Read" : "New alert")}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-bold">
                  {t(product.name ?? "")}
                </h2>
                <p className="mt-2 text-sm">
                  {t("Only")}
                  {t(" ")}
                  <b>
                    {product.quantity} {t(product.unit ?? "")}
                  </b>
                  {t(" ")}
                  {t("remaining")}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {t("Minimum threshold:")}
                  {product.threshold} {t(product.unit ?? "")}
                </p>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <Button onClick={() => beginAdjust(product, "Stock In")}>
                    {t("+ Restock")}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setRead((current) => [...current, product.id])
                    }
                  >
                    {t("Mark as read")}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setDismissed((current) => [...current, product.id])
                    }
                  >
                    {t("Dismiss")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {!activeAlerts.length && (
            <div className="mt-6 rounded-2xl bg-white p-12 text-center">
              <Icon name="check" />
              <p className="mt-4 font-bold">{t("You’re all caught up.")}</p>
              <p className="mt-2 text-sm text-slate-400">
                {t("Dismissed alerts don’t change your actual stock levels.")}
              </p>
            </div>
          )}
        </div>
      )}
      {page === "settings" && (
        <div className="p-4 sm:p-7">
          <h1 className="text-2xl font-bold">{t("Settings")}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {t("A simple setup for the way you run your shop.")}
          </p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-bold">{t("Shop & owner details")}</h2>
              <ProfileFields
                profile={settingDraft}
                setProfile={setSettingDraft}
              />
              <div className="mt-6 border-t border-slate-100 pt-5">
                <Field
                  label={t("Default minimum stock threshold")}
                  type="number"
                  value={threshold}
                  onChange={setThreshold}
                />
                <label className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={applyThreshold}
                    onChange={(event) =>
                      setApplyThreshold(event.target.checked)
                    }
                    className="accent-emerald-600"
                  />
                  {t(" ")}
                  {t("Apply this threshold to all existing products")}
                </label>
              </div>
              <Button
                className="mt-6"
                disabled={
                  !settingDraft.shop.trim() ||
                  !settingDraft.owner.trim() ||
                  !/^(?:\+91)?\d{10}$/.test(
                    settingDraft.phone.replace(/\s/g, ""),
                  ) ||
                  !Number.isFinite(Number(threshold)) ||
                  Number(threshold) < 0
                }
                onClick={() => {
                  setProfile(settingDraft)
                  if (applyThreshold)
                    setProducts((current) =>
                      current.map((product) => ({
                        ...product,
                        threshold: Number(threshold),
                      })),
                    )
                  setNotice("Shop profile and preferences saved.")
                }}
              >
                {t("Save settings")}
              </Button>
            </div>
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-bold">{t("Connected channels")}</h2>
                <p className="mt-2 text-xs text-slate-400">
                  {t("Simulated connections · no live messaging APIs")}
                </p>
                {["WhatsApp", "SMS"].map((channel, index) => (
                  <div
                    key={channel}
                    className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-bold">{channel}</p>
                      <p
                        className={`mt-1 text-xs ${
                          channels[index]
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        {t(
                          channels[index]
                            ? "● Simulated connection"
                            : "Disconnected",
                        )}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setChannels((current) =>
                          current.map((connected, position) =>
                            position === index ? !connected : connected,
                          ),
                        )
                      }
                    >
                      {t(channels[index] ? "Disconnect" : "Connect")}
                    </Button>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-bold">{t("Notification preferences")}</h2>
                {[
                  "Low-stock alerts",
                  "Daily sales summary",
                  "Transaction confirmations",
                ].map((label, index) => (
                  <label
                    key={t(label ?? "")}
                    className="mt-5 flex justify-between gap-3 text-sm"
                  >
                    <span>{t(label ?? "")}</span>
                    <input
                      type="checkbox"
                      checked={notifications[index]}
                      onChange={() =>
                        setNotifications((current) =>
                          current.map((enabled, position) =>
                            position === index ? !enabled : enabled,
                          ),
                        )
                      }
                      className="h-5 w-5 accent-emerald-600"
                    />
                  </label>
                ))}
                <p className="mt-4 text-xs text-slate-400">
                  {t(
                    "Preferences are stored during this session. Safety confirmations always remain enabled.",
                  )}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-800">
                {t("Frontend simulation is ready.")}
                <p className="mt-2 text-xs leading-5">
                  {t(
                    "WhatsApp / SMS → FastAPI → Whisper → LLM → Catalogue → PostgreSQL → React. Backend services are represented, not connected.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedProduct && (
        <Modal title={selectedProduct.name} onClose={() => setSelected(null)}>
          <div className="flex justify-between">
            <div>
              <p className="text-4xl font-bold">
                {selectedProduct.quantity}
                <span className="ml-2 text-sm font-normal text-slate-400">
                  {t(selectedProduct.unit ?? "")}
                </span>
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {t(selectedProduct.category ?? "")}
              </p>
            </div>
            <Status product={selectedProduct} />
          </div>
          <div className="my-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">{t("Selling price")}</p>
              <p className="mt-1 font-bold">{money(selectedProduct.price)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">{t("Minimum stock")}</p>
              <p className="mt-1 font-bold">
                {selectedProduct.threshold} {t(selectedProduct.unit ?? "")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => beginAdjust(selectedProduct, "Stock In")}>
              {t("+ Add Stock")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => beginAdjust(selectedProduct, "Sale")}
            >
              {t("− Record Sale")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSelected(null)
                setEditProduct({ ...selectedProduct })
              }}
            >
              {t("Edit Product")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (
                  !window.confirm(
                    translate(
                      profile.language,
                      "Delete this product? Transaction history will be preserved.",
                    ),
                  )
                )
                  return
                setProducts((current) =>
                  current.filter(
                    (product) => product.id !== selectedProduct.id,
                  ),
                )
                setSelected(null)
                setNotice(translate(profile.language, "Product deleted."))
              }}
            >
              {translate(profile.language, "Delete Product")}
            </Button>
          </div>
          <h3 className="mt-7 text-sm font-bold">
            {t("Stock history · confirmed activity")}
          </h3>
          <StockHistory product={selectedProduct} transactions={transactions} />
          <h3 className="mt-6 text-sm font-bold">{t("Recent transactions")}</h3>
          {transactions
            .filter(
              (transaction) => transaction.product === selectedProduct.name,
            )
            .slice(0, 5)
            .map((transaction) => (
              <div
                key={transaction.id}
                className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-xs"
              >
                <span>
                  {t(transaction.action ?? "")} {t("·")}
                  {t(transaction.source ?? "")}
                  <p className="mt-1 text-slate-400">{transaction.date}</p>
                </span>
                <b>
                  {t(transaction.action === "Sale" ? "−" : "+")}
                  {transaction.quantity} {transaction.unit}
                </b>
              </div>
            ))}
          {!transactions.some(
            (transaction) => transaction.product === selectedProduct.name,
          ) && (
            <p className="mt-3 text-xs text-slate-400">
              {t(
                "No changes yet. Add stock or record a sale to see the history.",
              )}
            </p>
          )}
        </Modal>
      )}
      {newProduct && (
        <Modal
          title={translate(profile.language, "Review product")}
          onClose={() => setNewProduct(null)}
        >
          <ProductCreator
            products={products}
            language={profile.language}
            onCancel={() => setNewProduct(null)}
            onSave={(product, voice) => {
              if (
                products.some(
                  (item) =>
                    item.name.trim().toLowerCase() ===
                    product.name.toLowerCase(),
                )
              )
                return
              setProducts((current) => [...current, product])
              if (product.quantity > 0)
                setTransactions((current) => [
                  {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    date: new Date().toLocaleString("en-IN"),
                    product: product.name,
                    action: "Stock In",
                    quantity: product.quantity,
                    unit: product.unit,
                    source: voice ? "Voice" : "Dashboard",
                    status: "Confirmed",
                    price: product.purchasePrice ?? product.price,
                  },
                  ...current,
                ])
              setNewProduct(null)
              setSelected(product.id)
              setNotice(
                translate(profile.language, "Product created successfully."),
              )
            }}
          />
        </Modal>
      )}
      {editing && (
        <InterpretationForm
          language={profile.language}
          key={`${editing.product}-${editing.source}`}
          value={editing}
          products={products}
          close={() => setEditing(null)}
          save={(value) => {
            setPending(value)
            setClarify(null)
            setEditing(null)
            setSelected(null)
            setSource(value.source)
            setStage(4)
            go(value.source === "SMS" ? "sms" : "chat")
          }}
        />
      )}
      {editProduct && (
        <Modal
          title={t("Edit product details")}
          onClose={() => setEditProduct(null)}
        >
          <div className="space-y-4">
            <Field
              label={t("Product (catalogue identity)")}
              readOnly
              value={editProduct.name}
              onChange={() => {}}
            />
            <Field
              label={t("Category")}
              value={editProduct.category}
              onChange={(category) =>
                setEditProduct({ ...editProduct, category })
              }
            />
            <Field
              label={t("Selling price (₹)")}
              type="number"
              value={editProduct.price}
              onChange={(value) =>
                setEditProduct({ ...editProduct, price: Number(value) })
              }
            />
            <Field
              label={t("Purchase price (₹, optional)")}
              type="number"
              value={editProduct.purchasePrice ?? ""}
              onChange={(value) =>
                setEditProduct({
                  ...editProduct,
                  purchasePrice: value === "" ? undefined : Number(value),
                })
              }
            />
            <Field
              label={t("Supplier (optional)")}
              value={editProduct.supplier ?? ""}
              onChange={(supplier) =>
                setEditProduct({ ...editProduct, supplier })
              }
            />
            <Field
              label={t("Minimum threshold")}
              type="number"
              value={editProduct.threshold}
              onChange={(value) =>
                setEditProduct({ ...editProduct, threshold: Number(value) })
              }
            />
            <p className="text-xs text-slate-400">
              {t(
                "Stock quantities can only be changed through a confirmed stock-in or sale.",
              )}
            </p>
            <Button
              disabled={
                !editProduct.category.trim() ||
                !Number.isFinite(editProduct.price) ||
                editProduct.price <= 0 ||
                (editProduct.purchasePrice !== undefined &&
                  (!Number.isFinite(editProduct.purchasePrice) ||
                    editProduct.purchasePrice < 0)) ||
                !Number.isFinite(editProduct.threshold) ||
                editProduct.threshold < 0
              }
              onClick={() => {
                setProducts((current) =>
                  current.map((product) =>
                    product.id === editProduct.id ? editProduct : product,
                  ),
                )
                setEditProduct(null)
                setNotice("Product details saved.")
              }}
            >
              {t("Confirm product changes")}
            </Button>
          </div>
        </Modal>
      )}
      {pipeline && (
        <Pipeline
          stage={Math.max(0, stage)}
          source={source}
          pending={pending}
          onClose={() => setPipeline(false)}
        />
      )}
      {page !== "chat" && page !== "sms" && (
        <Footer language={profile.language} onNavigate={navigate} />
      )}
      {notice && (
        <div
          role="status"
          className="fixed bottom-5 left-4 right-4 z-[60] mx-auto flex max-w-xl items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl"
        >
          <span className="mt-1 text-emerald-600">
            <Icon name="check" size={18} />
          </span>
          <p className="flex-1 whitespace-pre-line text-sm">
            {t(notice ?? "")}
          </p>
          <button
            aria-label={t("Dismiss notification")}
            onClick={() => setNotice("")}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      )}
    </Shell>
  )
}

function ProfileFields({
  profile,
  setProfile,
}: {
  profile: Profile
  setProfile: (profile: Profile) => void
}) {
  const t = useTranslator()

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <Field
        label={t("Shop Name")}
        value={profile.shop}
        onChange={(shop) => setProfile({ ...profile, shop })}
      />
      <Field
        label={t("Owner Name")}
        value={profile.owner}
        onChange={(owner) => setProfile({ ...profile, owner })}
      />
      <Field
        label={t("Mobile Number")}
        type="tel"
        value={profile.phone}
        onChange={(phone) => setProfile({ ...profile, phone })}
      />
      <label className="text-sm font-medium">
        {t("Shop Type")}
        <select
          value={profile.type}
          onChange={(event) =>
            setProfile({ ...profile, type: event.target.value })
          }
          className="mt-2 w-full rounded-xl border border-slate-200 p-3"
        >
          {["Kirana / General Store", "Street Vendor", "Small Wholesaler"].map(
            (type) => (
              <option key={type}>{type}</option>
            ),
          )}
        </select>
      </label>
      <label className="text-sm font-medium">
        {t("Preferred Language")}
        <select
          value={profile.language}
          onChange={(event) =>
            setProfile({ ...profile, language: event.target.value })
          }
          className="mt-2 w-full rounded-xl border border-slate-200 p-3"
        >
          {Object.keys(examples).map((language) => (
            <option key={language}>{language}</option>
          ))}
        </select>
      </label>
    </div>
  )
}

function StockHistory({
  product,
  transactions,
}: {
  product: Product
  transactions: Transaction[]
}) {
  const t = useTranslator()

  const history = transactions
    .filter((transaction) => transaction.product === product.name)
    .slice()
    .reverse()
  const start =
    product.quantity -
    history.reduce(
      (sum, transaction) =>
        sum +
        (transaction.action === "Sale"
          ? -transaction.quantity
          : transaction.quantity),
      0,
    )
  const values = [start]
  history.forEach((transaction) =>
    values.push(
      values[values.length - 1] +
        (transaction.action === "Sale"
          ? -transaction.quantity
          : transaction.quantity),
    ),
  )
  const maximum = Math.max(...values, 1)
  const points = values.map(
    (value, index) =>
      `${20 + (index * 360) / Math.max(1, values.length - 1)},${110 - (value / maximum) * 90}`,
  )
  return (
    <div className="mt-3 rounded-xl bg-emerald-50/60 p-3">
      <svg
        viewBox="0 0 400 130"
        role="img"
        aria-label={`Stock history: ${values.join(" to ")} ${product.unit}`}
        className="w-full"
      >
        <path d="M20 110H380" fill="none" stroke="#d1e5da" />
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#059669"
          strokeWidth="3"
        />
        {values.map((value, index) => (
          <g key={index}>
            <circle
              cx={20 + (index * 360) / Math.max(1, values.length - 1)}
              cy={110 - (value / maximum) * 90}
              r="4"
              fill="#059669"
            />
            <text
              x={20 + (index * 360) / Math.max(1, values.length - 1)}
              y={Math.max(12, 100 - (value / maximum) * 90)}
              textAnchor="middle"
              fontSize="11"
              fill="#065f46"
            >
              {value}
            </text>
          </g>
        ))}
      </svg>
      <p className="text-[10px] text-slate-400">
        {t("Opening stock → confirmed transactions → current stock")}
      </p>
    </div>
  )
}

const router = createBrowserRouter([{ path: "*", Component: Prototype }])
export default function App() {
  return <RouterProvider router={router} />
}
