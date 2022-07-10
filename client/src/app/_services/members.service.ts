import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { of } from 'rxjs'
import { map } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import { Member } from '../models/member'
import { PaginatedResult } from '../models/pagination'
import { UserParams } from '../models/userParams'

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl
  members: Member[] = []
  paginatedResult: PaginatedResult<Member[]> = new PaginatedResult<Member[]>()

  constructor (private http: HttpClient) {}

  getMembers (userParams: UserParams) {
    let params = this.getPaginationHeaders(
      userParams.pageNumber,
      userParams.pageSize
    )

    params = params.append('minAge',userParams.minAge.toString())
    params = params.append('maxAge', userParams.maxAge.toString())
    params = params.append('gender', userParams.gender)

    return this.http
      .get<Member[]>(this.baseUrl + 'users', { observe: 'response', params })
      .pipe(
        map(res => {
          this.paginatedResult.result = res.body
          if (res.headers.get('Pagination') !== null) {
            this.paginatedResult.pagination = JSON.parse(
              res.headers.get('Pagination')
            )
          }
          return this.paginatedResult
        })
      )
  }

  private getPaginationHeaders (pageNumber: number, pageSize: number) {
    let params = new HttpParams()

    params = params.append('pageNumber', pageNumber.toString())
    params = params.append('pageSize', pageSize.toString())

    return params
  }

  getMember (username: string) {
    const member = this.members.find(user => user.username === username)

    if (member !== undefined) return of(member)

    return this.http.get<Member>(this.baseUrl + 'users/' + username)
  }

  updateMember (member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member)
        this.members[index] = member
      })
    )
  }

  setMainPhoto (photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {})
  }

  deletePhoto (photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId)
  }
}
