import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { AccountsService } from '../_services/accounts.service'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter()
  model: any = {}

  constructor (private accountService: AccountsService) {}

  ngOnInit (): void {}

  register () {
    this.accountService.register(this.model).subscribe({
      next: res => {
        console.log(res)
        this.cancel()
      },
      error: err => console.log(err)
    })
  }

  cancel () {
    this.cancelRegister.emit(false)
  }
}
