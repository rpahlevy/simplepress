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
import { SortColumn, SortDirection } from '../directives/sortable-album.directive';
import { Album } from '../interfaces/album';

interface SearchResult {
  albums: Album[];
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

function sort(albums: Album[], column: SortColumn, direction: string): Album[] {
  if (direction === '' || column === '') {
    return albums;
  } else {
    return [...albums].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(album: Album, term: string, pipe: PipeTransform) {
  return album.title.toLowerCase().includes(term.toLowerCase());
}

@Injectable({
  providedIn: 'root',
})
export class AlbumService {
  private _url = 'https://jsonplaceholder.typicode.com/albums';
  private _ALBUMS: Album[];

  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _albums$ = new BehaviorSubject<Album[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
  };

  private _pageInstance = new Subject<any>();
  pageSub$ = this._pageInstance.asObservable();

  constructor(private pipe: DecimalPipe) {
    this._ALBUMS = [];

    this._getAlbums().then(albums => {
      this._ALBUMS = albums;
      this._search$
        .pipe(
          tap(() => this._loading$.next(true)),
          debounceTime(200),
          switchMap(() => this._search()),
          delay(200),
          tap(() => this._loading$.next(false))
        )
        .subscribe(result => {
          this._albums$.next(result.albums);
          this._total$.next(result.total);
        });

      this._search$.next();
    });
  }

  async findById(id: number): Promise<Album | undefined> {
    const data = await fetch(`${this._url}/${id}`);
    return (await data.json()) ?? {};
  }
  async getPhotos(id: number): Promise<Album | undefined> {
    const data = await fetch(`${this._url}/${id}/photos`);
    return (await data.json()) ?? {};
  }

  get albums$() {
    return this._albums$.asObservable();
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
    this._getAlbums().then(albums => {
      this._ALBUMS = albums;
      this._search$.next();
    });
  }

  private async _getAlbums(): Promise<Album[]> {
    const data = await fetch(this._url);
    return (await data.json()) ?? [];
  }

  private _search(): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page, searchTerm } =
      this._state;

    // 1. sort
    let albums = sort(this._ALBUMS, sortColumn, sortDirection);

    // 2. filter
    albums = albums.filter(post => matches(post, searchTerm, this.pipe));
    const total = albums.length;

    // 3. paginate
    albums = albums.slice(
      (page - 1) * pageSize,
      (page - 1) * pageSize + pageSize
    );
    return of({ albums, total });
  }
}
