import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { of } from 'rxjs'
import { map, take } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import { Member } from '../models/member'
import { PaginatedResult } from '../models/pagination'
import { User } from '../models/user'
import { UserParams } from '../models/userParams'
import { AccountsService } from './accounts.service'
import { getPaginationHeaders, getPaginatedResult } from './paginationHelper'

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl
  members: Member[] = []
  memberCache = new Map()
  userParams: UserParams
  user: User

  constructor (
    private http: HttpClient,
    private accountService: AccountsService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        this.userParams = new UserParams(user)
        this.user = user
      }
    })
  }

  getUserParams () {
    return this.userParams
  }

  setUserParams (params: UserParams) {
    this.userParams = params
  }

  resetUserParams () {
    this.userParams = new UserParams(this.user)
    return this.userParams
  }

  getMembers (userParams: UserParams) {
    var res = this.memberCache.get(Object.values(userParams).join('-'))

    if (res) return of(res)

    let params = getPaginationHeaders(
      userParams.pageNumber,
      userParams.pageSize
    )

    params = params.append('minAge', userParams.minAge.toString())
    params = params.append('maxAge', userParams.maxAge.toString())
    params = params.append('gender', userParams.gender)
    params = params.append('orderBy', userParams.orderBy)

    return getPaginatedResult<Member[]>(
      this.baseUrl + 'users',
      params,
      this.http
    ).pipe(
      map(res => {
        this.memberCache.set(Object.values(userParams).join('-'), res)
        return res
      })
    )
  }

 

  getMember (username: string) {
    const member = [...this.memberCache.values()]
      .reduce((prev, curr) => prev.concat(curr.result), [])
      .find((member: Member) => member.username === username)

    if (member) return of(member)

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

  addLike (username: string) {
    return this.http.post(this.baseUrl + 'likes/' + username, {})
  }

  getLIkes (predicate: string, pageNumber: number, pageSize: number) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    params= params.append('predicate', predicate);
    return getPaginatedResult<Partial<Member[]>>(this.baseUrl + 'likes' , params, this.http)
  }
}
