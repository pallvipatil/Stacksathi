import { useEffect, useRef, useState } from "react"
import { Button, Field, Icon, SelectField } from "./components"
import { translate } from "./i18n"

type Recognition = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: (event: {
    results: {
      isFinal: boolean
      0: { transcript: string }
    }[]
  }) => void
  onerror: (event: { error: string }) => void
  onend: () => void
  start: () => void
  stop: () => void
  abort: () => void
}
export default function VoiceInput({
  language,
  onUse,
  example = "Add five kilos of sugar.",
}: {
  language: string
  onUse: (text: string) => void
  example?: string
}) {
  const t = (text: string) => translate(language, text)
  const defaultCode =
    language === "हिंदी" ? "hi-IN" : language === "मराठी" ? "mr-IN" : "en-IN"
  const [code, setCode] = useState(defaultCode)
  const [state, setState] = useState("idle")
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const [simulated, setSimulated] = useState(false)
  const recognition = useRef<Recognition | null>(null)
  const received = useRef(false)
  useEffect(() => setCode(defaultCode), [defaultCode])
  useEffect(
    () => () => {
      if (recognition.current) {
        recognition.current.onend = () => {}
        recognition.current.abort()
      }
    },
    [],
  )
  const cancel = () => {
    if (recognition.current) {
      recognition.current.onend = () => {}
      recognition.current.abort()
    }
    setState("idle")
    setText("")
    setError("")
  }
  const start = () => {
    cancel()
    setSimulated(false)
    received.current = false
    const api = window as unknown as {
      SpeechRecognition?: new () => Recognition
      webkitSpeechRecognition?: new () => Recognition
    }
    const Constructor = api.SpeechRecognition ?? api.webkitSpeechRecognition
    if (!Constructor) {
      setState("error")
      setError(
        "Speech recognition is unavailable. Use text or the labelled simulation.",
      )
      return
    }
    const instance = new Constructor()
    recognition.current = instance
    instance.lang = code
    instance.interimResults = true
    instance.continuous = false
    instance.onresult = (event) => {
      const results = Array.from(event.results)
      const transcript = results.map((result) => result[0].transcript).join(" ")
      received.current = Boolean(transcript.trim())
      setText(transcript)
      if (results.every((result) => result.isFinal)) setState("success")
    }
    instance.onerror = (event) => {
      setState("error")
      setError(
        ["not-allowed", "service-not-allowed"].includes(event.error)
          ? "Microphone permission denied. Allow microphone access in browser settings."
          : event.error === "no-speech"
            ? "No speech detected. Please retry."
            : "Recognition failed. Retry or use text.",
      )
    }
    instance.onend = () =>
      setState((current) => {
        if (current === "error") return current
        if (received.current) return "success"
        setError("No speech detected. Please retry.")
        return "error"
      })
    try {
      setState("recording")
      instance.start()
    } catch {
      setState("error")
      setError("Recognition failed. Retry or use text.")
    }
  }
  return (
    <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
      <div className="flex items-center gap-2 font-semibold text-emerald-800">
        <Icon name="mic" />
        {t("Voice input")}
      </div>
      <SelectField
        label={t("Voice language")}
        value={code}
        onChange={(value) => {
          cancel()
          setCode(value)
        }}
        options={[
          { value: "en-IN", label: "English (India)" },
          { value: "hi-IN", label: "हिंदी" },
          { value: "mr-IN", label: "मराठी" },
        ]}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={
            state === "recording"
              ? () => {
                  setState("processing")
                  recognition.current?.stop()
                }
              : start
          }
        >
          <Icon name="mic" />
          {t(state === "recording" ? "Stop recording" : "Start recording")}
        </Button>
        <Button
          variant="secondary"
          disabled={state === "recording" || state === "processing"}
          onClick={() => {
            cancel()
            setText(example)
            setSimulated(true)
            setState("success")
          }}
        >
          {t("Simulated voice input")}
        </Button>
        {!text && state !== "idle" && (
          <Button variant="ghost" onClick={cancel}>
            {t("Cancel")}
          </Button>
        )}
      </div>
      <div
        role="status"
        className={
          state === "error"
            ? "text-sm text-rose-700"
            : "text-sm text-emerald-700"
        }
      >
        {t(
          error ||
            (state === "recording"
              ? "Recording…"
              : state === "processing"
                ? "Processing…"
                : state === "success"
                  ? "Review transcription"
                  : "No stock changes until confirmation."),
        )}
      </div>
      {text && (
        <div className="space-y-3">
          {simulated && (
            <div className="text-xs font-bold text-amber-700">
              {t("Simulated voice input")}
            </div>
          )}
          <Field label={t("Recognized text")} value={text} onChange={setText} />
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={
                !text.trim() || state === "recording" || state === "processing"
              }
              onClick={() => {
                onUse(text.trim())
                cancel()
              }}
            >
              {t("Use transcription")}
            </Button>
            <Button variant="secondary" onClick={start}>
              {t("Retry")}
            </Button>
            <Button variant="ghost" onClick={cancel}>
              {t("Cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
