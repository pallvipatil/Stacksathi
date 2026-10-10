import { Button, Icon, Logo, SelectField } from "./components"
import { translate } from "./i18n"
import { productImage } from "./productImages"

export function Footer({
  language,
  onNavigate,
}: {
  language: string
  onNavigate: (path: string) => void
}) {
  const t = (text: string) => translate(language, text)
  return (
    <footer className="border-t border-border bg-card px-6 py-12">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            {t(
              "A little less paperwork. A lot more peace of mind. Your everyday partner for a better-run shop.",
            )}
          </p>
        </div>
        {[
          [
            "Quick links",
            "Home",
            "Dashboard",
            "Inventory",
            "Reports",
            "Contact",
          ],
          ["Features", "AI Chat", "Voice Input", "Stock Alerts", "Analytics"],
        ].map((group, index) => (
          <div key={group[0]}>
            <div className="mb-4 font-bold">{t(group[0])}</div>
            {group.slice(1).map((label, i) => (
              <Button
                key={label}
                variant="ghost"
                className="mb-1 block text-muted-foreground"
                onClick={() =>
                  label === "Contact"
                    ? document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" })
                    : onNavigate(
                        (index === 0
                          ? ["/", "/dashboard", "/inventory", "/reports"]
                          : ["/chat", "/chat", "/alerts", "/reports"])[i],
                      )
                }
              >
                {t(label)}
              </Button>
            ))}
          </div>
        ))}
        <div id="contact">
          <div className="mb-4 font-bold">{t("Contact")}</div>
          <p className="text-sm leading-7 text-muted-foreground">
            {t("Sample contact details")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            hello@stocksathi.example
          </p>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            {t(
              "AI, WhatsApp and SMS are simulations. No external messages are sent.",
            )}
          </p>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-wrap justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
        <span>{t("© 2026 StockSathi. All rights reserved.")}</span>
        <span>{t("Made for the shops that keep India moving.")}</span>
      </div>
    </footer>
  )
}

export default function Landing({
  onDemo,
  onStart,
  language,
  onLanguage,
  onNavigate,
}: {
  onDemo: () => void
  onStart: () => void
  language: string
  onLanguage: (language: string) => void
  onNavigate: (path: string) => void
}) {
  const t = (text: string) => translate(language, text)
  const scroll = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  const features = [
    [
      "box",
      "Smart inventory",
      "Every product. Every update. One place.",
      "Keep your stock organised, spot what’s running low, and make confident restocking decisions.",
    ],
    [
      "mic",
      "Speak. Review. Confirm.",
      "Your voice does the heavy lifting.",
      "Add stock or record a sale in English, Hindi or Marathi. You always review before anything changes.",
    ],
    [
      "chat",
      "A chat that understands you",
      "Less typing. More doing.",
      "Use everyday language to manage your shop. Our simulated assistant keeps you in control.",
    ],
    [
      "chart",
      "Your numbers, made simple",
      "Small insights. Better decisions.",
      "See sales, estimated profit and product performance, then export a report in a click.",
    ],
  ]
  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            <Button variant="ghost" onClick={() => scroll("features")}>
              {t("Features")}
            </Button>
            <Button variant="ghost" onClick={() => scroll("how-it-works")}>
              {t("How it works")}
            </Button>
            <Button variant="ghost" onClick={() => onNavigate("/dashboard")}>
              {t("Dashboard")}
            </Button>
            <Button variant="ghost" onClick={() => scroll("contact")}>
              {t("Contact")}
            </Button>
          </nav>
          <div className="flex items-center gap-3">
            <SelectField
              value={language}
              onChange={onLanguage}
              options={["English", "हिंदी", "मराठी"].map((value) => ({
                value,
                label: value,
              }))}
            />
            <Button onClick={onDemo} className="hidden sm:inline-flex">
              {t("Open workspace")} <Icon name="arrow" size={16} />
            </Button>
          </div>
        </div>
      </header>
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold tracking-wide text-primary">
              <Icon name="spark" size={16} />
              {t("A smarter day at your kirana store")}
            </div>
            <div className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              {t("Less counting.")}
              <br />
              <span className="text-primary">{t("More growing.")}</span>
            </div>
            <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
              {t(
                "Your shop inventory, one message away. Meet the simple AI-powered assistant built for your everyday business.",
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={onStart} className="px-7 py-4">
                {t("Get Started")}
                <Icon name="arrow" size={18} />
              </Button>
              <Button
                variant="secondary"
                onClick={() => scroll("features")}
                className="px-7 py-4"
              >
                {t("Explore Features")}
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-5 text-xs font-medium text-muted-foreground">
              {[
                "English · हिंदी · मराठी",
                "Stock changes only after confirmation",
              ].map((label) => (
                <span key={label} className="flex items-center gap-2">
                  <Icon name="check" size={15} />
                  {t(label)}
                </span>
              ))}
            </div>
          </div>
          <div className="relative pb-8">
            <div className="overflow-hidden rounded-3xl bg-muted shadow-xl">
              <img
                src="/images/kirana-owner.jpg"
                alt={t(
                  "An Indian market vendor surrounded by everyday grocery essentials",
                )}
                className="aspect-square w-full object-cover"
                fetchPriority="high"
              />
            </div>
            <div className="absolute -bottom-2 left-4 right-4 flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-lg sm:left-8 sm:right-8">
              <div className="rounded-2xl bg-emerald-50 p-3 text-primary">
                <Icon name="check" size={25} />
              </div>
              <div className="flex-1">
                <div className="font-bold">
                  {t("Everything in stock. Everything in sync.")}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t("Inventory, sales and reports — connected.")}
                </div>
              </div>
              <Icon name="chart" size={28} />
            </div>
          </div>
        </section>
        <div className="border-y border-border bg-card px-5 py-6 text-center text-sm font-semibold text-muted-foreground">
          {t("Built for local stores. Ready for your everyday.")}
          <span className="mx-5 hidden sm:inline">/</span>
          <span className="mt-2 block text-primary sm:mt-0 sm:inline">
            {t("Simple to use. In your language. Always in your control.")}
          </span>
        </div>
        <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">
            {t("A helping hand for your business")}
          </div>
          <div className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("Your daily work. A whole lot easier.")}
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map(([icon, title, subtitle, copy], index) => (
              <div
                key={title}
                className="group rounded-3xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-7 flex h-24 items-center justify-center rounded-2xl bg-muted text-primary">
                  <Icon name={icon} size={44} />
                </div>
                <div className="text-xs font-semibold text-primary">
                  {t(subtitle)}
                </div>
                <div className="mt-3 text-lg font-bold">{t(title)}</div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {t(copy)}
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 text-primary"
                  onClick={() =>
                    onNavigate(
                      ["/inventory", "/chat", "/chat", "/reports"][index],
                    )
                  }
                >
                  {t("Explore")} <Icon name="arrow" size={16} />
                </Button>
              </div>
            ))}
          </div>
        </section>
        <section
          id="how-it-works"
          className="border-y border-border bg-card px-5 py-16"
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center text-3xl font-bold">
              {t("Three steps. One less thing to worry about.")}
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {[
                [
                  "Add your products",
                  "Start with your shop’s products, prices and stock.",
                ],
                [
                  "Tell us what changed",
                  "Type or speak a purchase or sale in your language.",
                ],
                [
                  "Confirm. You’re all set.",
                  "Review the details. Your stock and reports update together.",
                ],
              ].map(([title, copy], index) => (
                <div key={title} className="rounded-2xl bg-background p-7">
                  <div className="mb-5 text-3xl font-extrabold text-primary">
                    0{index + 1}
                  </div>
                  <div className="font-bold">{t(title)}</div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {t(copy)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2">
          <div className="self-center">
            <div className="text-xs font-bold uppercase tracking-widest text-primary">
              {t("A clear picture of your shop")}
            </div>
            <div className="mt-4 text-3xl font-bold leading-tight">
              {t("Know what’s selling. Know what needs restocking.")}
            </div>
            <p className="mt-5 text-muted-foreground leading-7">
              {t(
                "From the first sale to the last restock, your dashboard brings everything together. Real calculations, live stock and downloadable reports.",
              )}
            </p>
            <Button className="mt-7" onClick={() => onNavigate("/dashboard")}>
              {t("Explore Dashboard")}
              <Icon name="arrow" size={16} />
            </Button>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-primary">
                {t("Inventory preview")}
              </span>
            </div>
            {[
              ["Rice", "25 kg", "₹62"],
              ["Sugar", "12 kg", "₹48"],
              ["Parle-G", "35 packets", "₹10"],
              ["Cooking oil", "4 bottles", "₹145"],
            ].map(([name, stock, price]) => (
              <div
                key={name}
                className="flex items-center gap-4 border-t border-border py-4"
              >
                <div className="rounded-xl bg-muted p-3 text-primary">
                  <Icon name="box" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{t(name)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {t(stock)}
                  </div>
                </div>
                <span className="text-sm font-semibold">{price}</span>
              </div>
            ))}
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={() => onNavigate("/inventory")}
            >
              {t("View your live inventory")}
              <Icon name="arrow" size={16} />
            </Button>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <div className="mb-6 text-center text-2xl font-bold">
            {t("Everyday essentials. Effortlessly organised.")}
          </div>
          <div className="grid grid-cols-4 gap-3 lg:grid-cols-8">
            {[
              "Rice",
              "Sugar",
              "Wheat flour",
              "Cooking oil",
              "Tea",
              "Pulses",
              "Biscuits",
              "Salt",
            ].map((name) => (
              <div
                key={name}
                className="rounded-2xl border border-border bg-card p-3 text-center"
              >
                <img
                  src={productImage(name)}
                  alt={t(name)}
                  loading="lazy"
                  className="aspect-square w-full rounded-xl"
                />
                <div className="mt-3 text-xs font-semibold">{t(name)}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer language={language} onNavigate={onNavigate} />
    </div>
  )
}
