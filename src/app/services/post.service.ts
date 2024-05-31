import { DecimalPipe } from '@angular/common';
import { Injectable, PipeTransform } from '@angular/core';
import {
  BehaviorSubject,
  debounceTime,
  delay,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { SortColumn, SortDirection } from '../directives/sortable.directive';
import { Post } from '../interfaces/post';
import { POSTS } from '../interfaces/posts';

interface SearchResult {
  posts: Post[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(posts: Post[], column: SortColumn, direction: string): Post[] {
  if (direction === '' || column === '') {
    return posts;
  } else {
    return [...posts].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(post: Post, term: string, pipe: PipeTransform) {
  return (
    post.title.toLowerCase().includes(term.toLowerCase()) ||
    pipe.transform(post.body).includes(term)
  );
}

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _posts$ = new BehaviorSubject<Post[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 4,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
  };

  constructor(private pipe: DecimalPipe) {
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe(result => {
        this._posts$.next(result.posts);
        this._total$.next(result.total);
      });

    this._search$.next();
  }

  get posts$() {
    return this._posts$.asObservable();
  }
  get totals$() {
    return this._total$.asObservable();
  }
  get loading$() {
    return this._loading$.asObservable();
  }
  get page$() {
    return this._state.page;
  }
  get pageSize() {
    return this._state.pageSize;
  }
  get searchTerm() {
    return this._state.searchTerm;
  }

  set page(page: number) {
    this._set({ page });
  }
  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }
  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }
  set sortColumn(sortColumn: SortColumn) {
    this._set({ sortColumn });
  }
  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page, searchTerm } =
      this._state;

    // 1. sort
    let posts = sort(POSTS, sortColumn, sortDirection);

    // 2. filter
    posts = posts.filter(post => matches(post, searchTerm, this.pipe));
    const total = posts.length;

    // 3. paginate
    posts = posts.slice(
      (page - 1) * pageSize,
      (page - 1) * pageSize + pageSize
    );
    return of({ posts, total });
  }
}
