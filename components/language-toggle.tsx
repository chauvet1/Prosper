"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getLocaleFromCookie, setLocaleCookie, type Locale } from "@/lib/i18n"

export function LanguageToggle() {
  const [locale, setLocale] = React.useState<Locale>('en')

  React.useEffect(() => {
    setLocale(getLocaleFromCookie())
  }, [])

  const toggleLanguage = () => {
    const newLocale: Locale = locale === 'en' ? 'fr' : 'en'
    setLocaleCookie(newLocale)
    setLocale(newLocale)
    // Reload page to apply new language
    window.location.reload()
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative" 
      onClick={toggleLanguage}
      title={locale === 'en' ? 'Switch to French' : 'Passer en anglais'}
    >
      <Languages className="h-[1.2rem] w-[1.2rem]" />
      <span className="absolute -bottom-1 -right-1 text-xs font-bold">
        {locale.toUpperCase()}
      </span>
      <span className="sr-only">Toggle language</span>
    </Button>
  )
}
