import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import {
  AbstractControl,
  UntypedFormBuilder,
  FormControl,
  UntypedFormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms'
import { Router } from '@angular/router'
import { ToastrService } from 'ngx-toastr'
import { AccountsService } from '../_services/accounts.service'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter()
  registerForm: UntypedFormGroup
  maxDate: Date
  validationErrors: string[] = []

  constructor (
    private accountService: AccountsService,
    private forbuilder: UntypedFormBuilder,
    private router: Router
  ) {}

  ngOnInit (): void {
    this.initializeForm()
    this.maxDate = new Date()
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18)
  }

  initializeForm () {
    this.registerForm = this.forbuilder.group({
      gender: ['male', Validators.required],
      username: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(12)]
      ],
      knownAs: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(20)]
      ],
      dateOfBirth: ['', Validators.required],
      city: ['', [Validators.required,Validators.minLength(2), Validators.maxLength(20)]],
      country: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      password: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(16)]
      ],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    })

    this.registerForm.controls.password.valueChanges.subscribe({
      next: () => {
        this.registerForm.controls.confirmPassword.updateValueAndValidity()
      }
    })
  }

  matchValues (matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control?.value === control?.parent?.controls[matchTo].value
        ? null
        : { isMatch: true }
    }
  }

  register () {
    console.log(this.registerForm.value)
    this.accountService.register(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigateByUrl('/members')
      },
      error: err => {
        console.log(err)
        this.validationErrors = err
      }
    })
  }

  cancel () {
    this.cancelRegister.emit(false)
  }
}
