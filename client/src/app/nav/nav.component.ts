import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { AccountsService } from '../_services/accounts.service'

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {}

  constructor (public accountService: AccountsService) {}

  ngOnInit () {
  }

  login () {
    this.accountService.login(this.model).subscribe({
      next: res => {
        console.log(res)
      },
      error: err => console.log(err)
    })
  }

  logout () {
    this.accountService.logout()
  }
}
