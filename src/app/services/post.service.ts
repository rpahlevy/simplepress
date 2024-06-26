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
import { SortColumn, SortDirection } from '../directives/sortablePost.directive';
import { Post } from '../interfaces/post';
// import { POSTS } from '../interfaces/posts';

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
    post.body.toLowerCase().includes(term.toLowerCase())
  );
}

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private _url = 'https://jsonplaceholder.typicode.com/posts';
  private _POSTS: Post[];

  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _posts$ = new BehaviorSubject<Post[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 5,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
  };

  private _pageInstance = new Subject<any>();
  pageSub$ = this._pageInstance.asObservable();

  constructor(private pipe: DecimalPipe) {
    this._POSTS = [];

    this._getPosts().then(posts => {
      this._POSTS = posts;
      this._search$
        .pipe(
          tap(() => this._loading$.next(true)),
          // debounceTime(200),
          switchMap(() => this._search()),
          // delay(200),
          tap(() => this._loading$.next(false))
        )
        .subscribe(result => {
          this._posts$.next(result.posts);
          this._total$.next(result.total);
        });

      this._search$.next();
    });
  }

  async findById(id: number): Promise<Post | undefined> {
    const data = await fetch(`${this._url}/${id}`);
    return (await data.json()) ?? {};
  }

  get posts$() {
    return this._posts$.asObservable();
  }
  get total$() {
    return this._total$.asObservable();
  }
  get loading$() {
    return this._loading$.asObservable();
  }
  get page() {
    return this._state.page;
  }
  get pageSize() {
    return this._state.pageSize;
  }
  get searchTerm() {
    return this._state.searchTerm;
  }

  set page(page: number) {
    this._pageInstance.next(page);
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
    this._getPosts().then(posts => {
      this._POSTS = posts;
      this._search$.next();
    });
  }

  private async _getPosts(): Promise<Post[]> {
    const data = await fetch(this._url);
    return (await data.json()) ?? [];
  }

  private _search(): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page, searchTerm } =
      this._state;

    // 1. sort
    let posts = sort(this._POSTS, sortColumn, sortDirection);

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
