import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { NgbHighlight, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { SortableHeader, SortEvent } from '../../directives/sortable-photo.directive';
import { Photo } from '../../interfaces/photo';
import { PhotoService } from '../../services/photo.service';

@Component({
  selector: 'app-photos',
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
  templateUrl: './photos.component.html',
  styleUrl: './photos.component.scss',
  providers: [PhotoService, DecimalPipe],
})
export class PhotosComponent {
  photos$: Observable<Photo[]>;
  total$: Observable<number>;
  filtersApplied = false;

  @ViewChildren(SortableHeader) headers: QueryList<SortableHeader> | undefined;

  constructor(
    public service: PhotoService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    service.searchTerm = activatedRoute.snapshot.queryParams['search'] ?? '';
    const sort = (activatedRoute.snapshot.queryParams['search'] ?? '').split(
      ':'
    );
    if (sort.length === 2) {
      service.sortColumn = sort[0];
      service.sortDirection = sort[1];
    }

    this.photos$ = service.photos$;
    this.total$ = service.total$;

    this.service.pageSub$.subscribe(this.onPageChange);
  }

  onSort(event: Event) {
    const { column, direction } = event as SortEvent;
    // resetting other headers
    this.headers?.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;

    this._updateQueryParams({
      sort: column + ':' + direction,
    });
  }

  onSearchTermChange(searchTerm: string) {
    this.service.searchTerm = searchTerm;

    this._updateQueryParams({
      search: searchTerm,
    });
  }

  onPageChange(page: number) {
    console.log('page: ' + page);

    // this._updateQueryParams({
    //   page: page,
    // });
  }

  onClearFilters() {
    this.service.searchTerm = '';
    this.service.sortColumn = '';
    this.service.sortDirection = '';
    this.service.page = 1;
    this.filtersApplied = false;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
    });
  }

  private _updateQueryParams(queryParams: Params) {
    this.filtersApplied = true;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
