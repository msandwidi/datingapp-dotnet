import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ToastrService } from 'ngx-toastr'
import { AccountsService } from '../_services/accounts.service'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter()
  model: any = {}

  constructor (
    private accountService: AccountsService,
    private toastr: ToastrService
  ) {}

  ngOnInit (): void {}

  register () {
    this.accountService.register(this.model).subscribe({
      next: res => {
        console.log(res)
        this.cancel()
      },
      error: err => {
        console.log(err)
        this.toastr.error(err.error)
      }
    })
  }

  cancel () {
    this.cancelRegister.emit(false)
  }
}
