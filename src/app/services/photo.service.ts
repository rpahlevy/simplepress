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
import { SortColumn, SortDirection } from '../directives/sortable-photo.directive';
import { Photo } from '../interfaces/photo';

interface SearchResult {
  photos: Photo[];
  total: number;
}

interface State {
  albumId: number;
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(photos: Photo[], column: SortColumn, direction: string): Photo[] {
  if (direction === '' || column === '') {
    return photos;
  } else {
    return [...photos].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(photo: Photo, term: string, pipe: PipeTransform) {
  return photo.title.toLowerCase().includes(term.toLowerCase());
}

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private _url = 'https://jsonplaceholder.typicode.com/photos';
  private _urlAlbum = 'https://jsonplaceholder.typicode.com/album';
  private _PHOTOS: Photo[];

  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _photos$ = new BehaviorSubject<Photo[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    albumId: 0,
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
  };

  private _pageInstance = new Subject<any>();
  pageSub$ = this._pageInstance.asObservable();

  constructor(private pipe: DecimalPipe) {
    this._PHOTOS = [];

    this._getPhotos().then(photos => {
      this._PHOTOS = photos;
      this._search$
        .pipe(
          tap(() => this._loading$.next(true)),
          // debounceTime(200),
          switchMap(() => this._search()),
          // delay(200),
          tap(() => this._loading$.next(false))
        )
        .subscribe(result => {
          this._photos$.next(result.photos);
          this._total$.next(result.total);
        });

      this._search$.next();
    });
  }

  async findById(id: number): Promise<Photo | undefined> {
    const data = await fetch(`${this._url}/${id}`);
    return (await data.json()) ?? {};
  }

  get photos$() {
    return this._photos$.asObservable();
  }
  get total$() {
    return this._total$.asObservable();
  }
  get loading$() {
    return this._loading$.asObservable();
  }
  get albumId() {
    return this._state.albumId;
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

  set albumId(albumId: number) {
    this._set({ albumId });
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
    this._getPhotos().then(photos => {
      this._PHOTOS = photos;
      this._search$.next();
    });
  }

  private async _getPhotos(): Promise<Photo[]> {
    const url = this._state.albumId > 0 ?
      `${this._urlAlbum}/${this._state.albumId}/photos` :
      this._url
    const data = await fetch(url);
    return (await data.json()) ?? [];
  }

  private _search(): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page, searchTerm } =
      this._state;

    // 1. sort
    let photos = sort(this._PHOTOS, sortColumn, sortDirection);

    // 2. filter
    photos = photos.filter(post => matches(post, searchTerm, this.pipe));
    const total = photos.length;

    // 3. paginate
    photos = photos.slice(
      (page - 1) * pageSize,
      (page - 1) * pageSize + pageSize
    );
    return of({ photos, total });
  }
}
