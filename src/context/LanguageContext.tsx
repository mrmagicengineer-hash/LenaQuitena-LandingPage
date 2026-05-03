import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import es from "@/locals/es.json"
import en from "@/locals/en.json"

type Lang = "es" | "en"

interface LanguageContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

type Dictionary = Record<string, string>

const dictionaries: Record<Lang, Dictionary> = {
  es,
  en,
}

const interpolate = (template: string, params?: Record<string, string | number>) => {
  if (!params) return template

  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params[name]
    return value === undefined ? `{${name}}` : String(value)
  })
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("es")
  const t = (key: string, params?: Record<string, string | number>) => {
    const value = dictionaries[lang][key] ?? dictionaries.es[key] ?? key
    return interpolate(value, params)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider")
  return ctx
}