//? ** Await Function that is used to wait
export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

//? ** Displays '...' after string after a given length of chars
export const truncateString = (string: string, length: number) => {
  return string?.length > length ? string.substring(0, length)?.trim() + '...' : string
}

//? ** Checks if given string contains given prefix
export const ensurePrefix = (str: string, prefix: string) => (str.startsWith(prefix) ? str : `${prefix}${str}`)

//? ** Returns the string with sliced suffix
export const withoutSuffix = (str: string, suffix: string) =>
  str.endsWith(suffix) ? str.slice(0, -suffix.length) : str

//? ** Returns the string with sliced prefix
export const withoutPrefix = (str: string, prefix: string) => (str.startsWith(prefix) ? str.slice(prefix.length) : str)

//? ** Checks if given input is a file
export function isFile(input: any): boolean {
  if ('File' in window && input instanceof File) return true
  else return false
}

//? ** Converts 'This is demo' to 'this-is-demo'
export const toFileName = (string: string) => {
  try {
    if (string) {
      if (typeof string === 'string') {
        const updatedString = string.replaceAll(' ', '-').toLowerCase()

        return updatedString
      }

      return string
    }

    return string
  } catch {
    return string
  }
}

//? ** Currency Convert
export const currencyConvert = (value: number, options?: Intl.NumberFormatOptions) => {
  return value.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    style: 'currency',
    currency: 'INR',
    ...options
  })
}

//? ** Checks for number
export const isNumber = (value: any) => {
  return !isNaN(Number(value))
}

//? ** Default Date Format
export const defaultFormatDate = 'DD MMM, YYYY'

//? ** Default DateTime Format
export const defaultFormatTime = 'DD MMM, YYYY h:mm A'
