import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { Photo } from '../interfaces/photo';

export type SortColumn = keyof Photo | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = {
  asc: 'desc',
  desc: '',
  '': 'asc',
};

export interface SortEvent extends Event {
  column: SortColumn;
  direction: SortDirection;
}

@Directive({
  selector: '[appSortablePhoto]',
  standalone: true,
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()',
  },
})
export class SortableHeader {
  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({
      column: this.sortable,
      direction: this.direction,
    } as SortEvent);
  }

  constructor() {}
}
