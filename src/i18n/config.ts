export type Locale = (typeof locales)[number]

export const locales = ['en', 'de', 'guj'] as const

export const defaultLocale: Locale = 'en'
