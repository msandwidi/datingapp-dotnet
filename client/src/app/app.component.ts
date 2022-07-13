import { Component, OnInit } from '@angular/core'
import { User } from './models/user'
import { AccountsService } from './_services/accounts.service'
import { PresenceService } from './_services/presence.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Your Dating App'
  users: any

  constructor (
    private accountService: AccountsService,
    private presenceService: PresenceService
  ) {}

  ngOnInit () {
    this.setCurrentUser()
  }

  setCurrentUser () {
    const user: User = JSON.parse(localStorage.getItem('user'))
    if(user){
      this.accountService.setCurrentUser(user)
      this.presenceService.createHubConnection(user)
    }
  }
}
