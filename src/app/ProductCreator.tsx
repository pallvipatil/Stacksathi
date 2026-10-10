import { useRef, useState } from "react"
import { Button, Field, SelectField, type Product } from "./components"
import VoiceInput from "./VoiceInput"
import { normalizeNumbers, translate } from "./i18n"

export function extractProduct(text: string) {
  const normalized = normalizeNumbers(text)
  const quantity = normalized.match(
    /(-?\d+(?:\.\d+)?)\s*(kg|kilos?|किलो|packets?|पैकेट|पॅकेट|bottles?|litres?|लीटर|pieces?|bags?)/,
  )
  const price = normalized.match(
    /(?:selling price|price|बिक्री मूल्य|बिक्री कीमत|विक्री किंमत)\s*(?:₹|rs\.?)?\s*(-?\d+(?:\.\d+)?)/,
  )
  const threshold = normalized.match(
    /(?:minimum stock|minimum|threshold|न्यूनतम स्टॉक|किमान साठा)\s*(-?\d+(?:\.\d+)?)/,
  )
  const name = text
    .replace(
      /^(?:add\s+(?:a\s+)?(?:new\s+)?product\s*[,،:]?\s*|नया उत्पाद\s*[,،:]?\s*|नवीन उत्पादन\s*[,،:]?\s*)/i,
      "",
    )
    .split(/[,،]|\d|[०-९]/)[0]
    .trim()
  return {
    name,
    category: "Grocery",
    quantity: quantity?.[1] ?? "",
    unit: quantity
      ? /kg|kilo|किलो/.test(quantity[2])
        ? "kg"
        : /packet|पैकेट|पॅकेट/.test(quantity[2])
          ? "packets"
          : /litre|लीटर/.test(quantity[2])
            ? "litre"
            : /bottle/.test(quantity[2])
              ? "bottles"
              : /bag/.test(quantity[2])
                ? "bags"
                : "pieces"
      : "",
    price: price?.[1] ?? "",
    threshold: threshold?.[1] ?? "",
    purchasePrice: "",
    supplier: "",
  }
}
export default function ProductCreator({
  products,
  language,
  onSave,
  onCancel,
}: {
  products: Product[]
  language: string
  onSave: (product: Product, voice: boolean) => void
  onCancel: () => void
}) {
  const t = (text: string) => translate(language, text)
  const [tab, setTab] = useState("manual")
  const [draft, setDraft] = useState({
    name: "",
    category: "Grocery",
    quantity: "",
    unit: "packets",
    price: "",
    threshold: "",
    purchasePrice: "",
    supplier: "",
  })
  const [phrase, setPhrase] = useState("")
  const [voiceSource, setVoiceSource] = useState(false)
  const [review, setReview] = useState(false)
  const submitted = useRef(false)
  const update = (key: keyof typeof draft, value: string) => {
    setReview(false)
    setDraft((current) => ({ ...current, [key]: value }))
  }
  const duplicate = products.some(
    (product) =>
      product.name.trim().toLocaleLowerCase() ===
      draft.name.trim().toLocaleLowerCase(),
  )
  const valid =
    draft.name.trim() &&
    draft.category.trim() &&
    draft.unit &&
    draft.quantity !== "" &&
    Number.isFinite(+draft.quantity) &&
    +draft.quantity >= 0 &&
    (["kg", "litre"].includes(draft.unit) ||
      Number.isInteger(+draft.quantity)) &&
    draft.price !== "" &&
    Number.isFinite(+draft.price) &&
    +draft.price > 0 &&
    draft.threshold !== "" &&
    Number.isFinite(+draft.threshold) &&
    +draft.threshold >= 0 &&
    (!draft.purchasePrice ||
      (Number.isFinite(+draft.purchasePrice) && +draft.purchasePrice > 0)) &&
    !duplicate
  const fill = (text: string, fromVoice = false) => {
    setDraft(extractProduct(text))
    setPhrase(text)
    setVoiceSource(fromVoice)
    setReview(false)
  }
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[
          ["manual", "Enter Details"],
          ["voice", "Add by Voice"],
        ].map(([value, label]) => (
          <Button
            key={value}
            variant={tab === value ? "primary" : "secondary"}
            onClick={() => setTab(value)}
          >
            {t(label)}
          </Button>
        ))}
      </div>
      {tab === "voice" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            {t(
              "Speak naturally. StockSathi will fill in the product details for you.",
            )}
          </p>
          <VoiceInput
            language={language}
            onUse={(text) => fill(text, true)}
            example="Add a new product, Amul Milk, 10 litres, selling price 55 rupees per litre, minimum stock 3 litres."
          />
          <Field
            label={t("Recognized text")}
            value={phrase}
            onChange={setPhrase}
          />
          <Button
            variant="secondary"
            disabled={!phrase.trim()}
            onClick={() => fill(phrase)}
          >
            {t("Use transcription")}
          </Button>
        </div>
      )}
      {review ? (
        <div className="rounded-2xl bg-emerald-50 p-4">
          <div className="mb-3 font-bold">{t("Review product")}</div>
          {Object.entries(draft)
            .filter(([, value]) => value !== "")
            .map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between gap-4 py-1 text-sm"
              >
                <span>
                  {t(
                    ({
                      name: "Product name",
                      category: "Category",
                      quantity: "Initial quantity",
                      unit: "Unit",
                      price: "Selling price (₹)",
                      threshold: "Minimum stock threshold",
                      purchasePrice: "Purchase price (₹, optional)",
                      supplier: "Supplier (optional)",
                    } as Record<string, string>)[key],
                  )}
                </span>
                <b>{value}</b>
              </div>
            ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {([
            ["name", "Product name"],
            ["category", "Category"],
            ["quantity", "Initial quantity"],
            ["price", "Selling price (₹)"],
            ["purchasePrice", "Purchase price (₹, optional)"],
            ["threshold", "Minimum stock threshold"],
            ["supplier", "Supplier (optional)"],
          ] as const).map(([key, label]) => (
            <Field
              key={key}
              label={t(label)}
              value={draft[key]}
              type={
                ["quantity", "price", "purchasePrice", "threshold"].includes(
                  key,
                )
                  ? "number"
                  : "text"
              }
              onChange={(value) => update(key, value)}
            />
          ))}
          <SelectField
            label={t("Unit")}
            value={draft.unit}
            onChange={(value) => update("unit", value)}
            options={[
              "",
              "packets",
              "kg",
              "bottles",
              "bags",
              "pieces",
              "litre",
            ].map((value) => ({ value, label: t(value) || "—" }))}
          />
        </div>
      )}
      <p className="text-sm text-amber-700">
        {duplicate
          ? t("Product already exists. Select the existing item in Inventory.")
          : !valid
            ? t(
                "Complete missing fields. Use valid quantities and a positive selling price.",
              )
            : t("No stock changes until confirmation.")}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={!valid}
          onClick={() => {
            if (!review) {
              setReview(true)
              return
            }
            if (submitted.current) return
            submitted.current = true
            onSave(
              {
                id: Date.now(),
                name: draft.name.trim(),
                category: draft.category.trim(),
                quantity: +draft.quantity,
                unit: draft.unit,
                price: +draft.price,
                threshold: +draft.threshold,
                ...(draft.purchasePrice
                  ? { purchasePrice: +draft.purchasePrice }
                  : {}),
                supplier: draft.supplier.trim(),
              },
              voiceSource,
            )
          }}
        >
          {t(review ? "Confirm" : "Save Product")}
        </Button>
        {review && (
          <Button variant="secondary" onClick={() => setReview(false)}>
            {t("Edit")}
          </Button>
        )}
        <Button variant="ghost" onClick={onCancel}>
          {t("Cancel")}
        </Button>
      </div>
    </div>
  )
}
