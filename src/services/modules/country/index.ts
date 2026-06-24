import { callApi } from 'src/utils/api-utils'
import { country } from './endpoint'

export interface CountryListAPI {
  ID: number
  Name: string
  Code: string
  CreateDate: string
}

export const fetchCountryList = async (): Promise<CountryListAPI[]> => {
  return callApi({ uriEndPoint: country.list })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}
