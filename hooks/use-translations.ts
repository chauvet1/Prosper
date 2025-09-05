"use client"

import { useState, useEffect } from 'react'
import { translations, type Translations } from '@/lib/translations'
import { getLocaleFromCookie, type Locale } from '@/lib/i18n'

export function useTranslations() {
  const [locale, setLocale] = useState<Locale>('en')
  const [t, setT] = useState<Translations>(translations.en)

  useEffect(() => {
    const currentLocale = getLocaleFromCookie()
    setLocale(currentLocale)
    setT(translations[currentLocale])
  }, [])

  return { t, locale }
}
