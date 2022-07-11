import { HttpClient, HttpParams } from '@angular/common/http'
import { map } from 'rxjs/operators'
import { PaginatedResult } from '../models/pagination'

export function getPaginationHeaders (pageNumber: number, pageSize: number) {
  let params = new HttpParams()

  params = params.append('pageNumber', pageNumber.toString())
  params = params.append('pageSize', pageSize.toString())

  return params
}

export function getPaginationResult<T> (url: string, params, http: HttpClient) {
  const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>()

  return http.get<T>(url, { observe: 'response', params }).pipe(
    map(res => {
      paginatedResult.result = res.body
      if (res.headers.get('Pagination') !== null) {
        paginatedResult.pagination = JSON.parse(res.headers.get('Pagination'))
      }

      return paginatedResult
    })
  )
}
