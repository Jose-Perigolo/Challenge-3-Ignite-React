import { format, isAfter, isBefore } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

export function FormatDate(date : string) {

  return format(new Date(date), 'dd MMM yyyy', {
    locale: ptBR,
  })
}

export function IsAfterDate(date1 : string, date2 : string) {

  return isAfter(new Date(date1), new Date(date2))
}

export function IsBeforeDate(date1 : string, date2 : string) {

  return isBefore(new Date(date1), new Date(date2))
}
