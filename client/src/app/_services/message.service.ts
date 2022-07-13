import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { BehaviorSubject } from 'rxjs'
import { take } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import { Group } from '../models/group'
import { Message } from '../models/message'
import { User } from '../models/user'
import { BusyService } from './busy.service'
import { getPaginationHeaders, getPaginationResult } from './paginationHelper'

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl
  hubUrl = environment.hubUrl
  private hubConnection: HubConnection
  private messageThreadSource = new BehaviorSubject<Message[]>([])
  messageThread$ = this.messageThreadSource.asObservable()

  constructor (private http: HttpClient, private busyService: BusyService) {}

  createHubConnection (user: User, otherUsername: string) {
    this.busyService.busy()

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUsername, {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build()

    this.hubConnection
      .start()
      .catch(err => console.log(err))
      .finally(() => {
        this.busyService.busy()
      })

    this.hubConnection.on('ReceiveMessageThread', messages => {
      this.messageThreadSource.next(messages)
    })

    this.hubConnection.on('NewMessage', message => {
      this.messageThread$.pipe(take(1)).subscribe({
        next: messages => {
          this.messageThreadSource.next([...messages, message])
        }
      })
    })

    this.hubConnection.on('UpdatedGroup', (group: Group) => {
      if (group.connections.some(c => c.username === otherUsername)) {
        this.messageThread$.pipe(take(1)).subscribe({
          next: messages => {
            messages.forEach(message => {
              if (!message.dateRead) {
                message.dateRead = new Date(Date.now())
              }
            })
            this.messageThreadSource.next([...messages])
          }
        })
      }
    })
  }

  stopHubConnection () {
    if (this.hubConnection) {
      this.messageThreadSource.next([])
      this.hubConnection.stop().catch(err => console.log(err))
    }
  }

  getMessages (pageNumber: number, pageSize: number, container: string) {
    let params = getPaginationHeaders(pageNumber, pageSize)
    params = params.append('Container', container)
    return getPaginationResult<Message[]>(
      this.baseUrl + 'messages',
      params,
      this.http
    )
  }

  getMessageThread (username: string) {
    return this.http.get<Message[]>(
      this.baseUrl + 'messages/thread/' + username
    )
  }

  async sendMessage (username: string, content: string) {
    this.hubConnection
      .invoke('SendMessage', {
        recipientUsername: username,
        content
      })
      .catch(err => console.log(err))
  }

  deleteMessage (id: number) {
    return this.http.delete(this.baseUrl + 'messages/' + id)
  }
}
