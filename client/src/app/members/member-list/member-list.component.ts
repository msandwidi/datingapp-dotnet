import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { take } from 'rxjs/operators'
import { Member } from 'src/app/models/member'
import { Pagination } from 'src/app/models/pagination'
import { User } from 'src/app/models/user'
import { UserParams } from 'src/app/models/userParams'
import { AccountsService } from 'src/app/_services/accounts.service'
import { MembersService } from 'src/app/_services/members.service'

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  members: Member[]
  pagination: Pagination
  userParams: UserParams
  user: User
  genderList= [{value:'male', display:'Males'}, {value:'female', display:'Females'}]

  constructor (private memberService: MembersService, private accountService:AccountsService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user=>{
        this.user = user
        this.userParams = new UserParams(user);
      }
    })
  }

  ngOnInit (): void {
    this.loadMembers()
  }

  loadMembers () {
    this.memberService.getMembers(this.userParams).subscribe({
      next: res => {
        this.members = res.result
        this.pagination = res.pagination
      }
    })
  }

  pageChanged(event:any){
    this.userParams.pageNumber = event.page;
    this.loadMembers()
  }

  resetFilters(){
    this.userParams = new UserParams(this.user);
    this.loadMembers()
  }
}
