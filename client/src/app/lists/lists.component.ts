import { Component, OnInit } from '@angular/core';
import { Member } from '../models/member';
import { Pagination } from '../models/pagination';
import { MembersService } from '../_services/members.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {
  members: Partial<Member[]>
  predicate= 'liked'
  pageNumber = 1;
  pageSize = 10;
  pagination: Pagination

  constructor(private memberService:MembersService) { }

  ngOnInit(): void {
    this.loadLikes()
  }

  loadLikes(){
    this.memberService.getLIkes(this.predicate, this.pageNumber, this.pageSize).subscribe({
      next: res=>{
        this.members = res.result;
        this.pagination = res.pagination
      }
    })
  }

  pageChanged(event:any){
    if(this.pageNumber!==event.page){    
      this.pageNumber = event.page;
      this.loadLikes();
    }
  }

}
