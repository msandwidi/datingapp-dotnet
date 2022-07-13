import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { ToastrService } from 'ngx-toastr'
import { BehaviorSubject } from 'rxjs'
import { take } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import { User } from '../models/user'

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubUrl
  private hubConnection: HubConnection
  private onlineUsersSource = new BehaviorSubject<string[]>([])
  onlineUser$ = this.onlineUsersSource.asObservable()

  constructor (private toastr: ToastrService, private router: Router) {}

  createHubConnection (user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build()

    this.hubConnection.start().catch(err => console.log(err))

    this.hubConnection.on('UserIsOnline', username => {
      this.onlineUser$.pipe(take(1)).subscribe({
        next: usernames => {
          this.onlineUsersSource.next([...usernames, username])
        }
      })
    })

    this.hubConnection.on('UserIsOffline', username => {
      this.onlineUser$.pipe(take(1)).subscribe({
        next: usernames => {
          this.onlineUsersSource.next([
            ...usernames.filter(u => u !== username)
          ])
        }
      })
    })

    this.hubConnection.on('GetOnlineUsers', (usernames: string[]) => {
      this.onlineUsersSource.next(usernames)
    })

    this.hubConnection.on('NewMessageReceived', ({ username, knownAs }) => {
      this.toastr
        .info(knownAs + ' has sent you a new message')
        .onTap.pipe(take(1))
        .subscribe({
          next: () => {
            this.router.navigateByUrl('/members/' + username + '?tab=3')
          }
        })
    })
  }

  stopHubConnection () {
    if (this.hubConnection) {
      this.hubConnection.stop().catch(err => console.log(err))
    }
  }
}