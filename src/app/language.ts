import { useSyncExternalStore } from "react"
import { translate } from "./i18n"

let language = "English"
const listeners = new Set<() => void>()
export function setUILanguage(value: string) {
  const next = ["English", "हिंदी", "मराठी"].includes(value) ? value : "English"
  if (language === next) return
  language = next
  document.documentElement.lang =
    next === "हिंदी" ? "hi" : next === "मराठी" ? "mr" : "en"
  listeners.forEach((listener) => listener())
}
export function useTranslator() {
  const selected = useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    () => language,
  )
  return (text: string) => translate(selected, text)
}
