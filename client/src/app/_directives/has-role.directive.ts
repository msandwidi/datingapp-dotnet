import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef
} from '@angular/core'
import { take } from 'rxjs/operators'
import { User } from '../models/user'
import { AccountsService } from '../_services/accounts.service'

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit {
  user: User
  @Input() appHasRole: string[]

  ngOnInit (): void {
    if (!this.user?.roles || this.user == null) {
      this.viewContainerRef.clear()
      return
    }

    if (this.user?.roles.some(r => this.appHasRole.includes(r))) {
      this.viewContainerRef.createEmbeddedView(this.templateRef)
    }else {
      this.viewContainerRef.clear()
      return
    }
  }

  constructor (
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private accountService: AccountsService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => (this.user = user)
    })
  }
}
