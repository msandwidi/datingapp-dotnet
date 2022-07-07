import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router';
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

  constructor (public accountService: AccountsService, private router: Router) {}

  ngOnInit () {
  }

  login () {
    this.accountService.login(this.model).subscribe({
      next: res => {
        this.router.navigateByUrl("/members")
      },
      error: err => console.log(err)
    })
  }

  logout () {
    this.accountService.logout()
    this.router.navigateByUrl("/")
  }
}
