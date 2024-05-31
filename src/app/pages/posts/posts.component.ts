import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbHighlight, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { SortableHeader, SortEvent } from '../../directives/sortable.directive';
import { Post } from '../../interfaces/post';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    FormsModule,
    AsyncPipe,
    NgbHighlight,
    NgbPagination,
    SortableHeader,
  ],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss',
  providers: [PostService, DecimalPipe],
})
export class PostsComponent {
  posts$: Observable<Post[]>;
  total$: Observable<number>;

  @ViewChildren(SortableHeader) headers: QueryList<SortableHeader> | undefined;

  constructor(public service: PostService) {
    this.posts$ = service.posts$;
    this.total$ = service.total$;
  }

  onSort(ev: Event) {
    const { column, direction } = ev as SortEvent;
    // resetting other headers
    this.headers?.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }
}
