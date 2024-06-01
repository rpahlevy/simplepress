import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Event, NavigationEnd, Router, RouterModule } from '@angular/router';

import { IconsModule } from './modules/icons/icons.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    IconsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // title = 'simplepress';
  title: Title;
  path: string = '';

  constructor(title: Title, router: Router) {
    this.title = title;

    router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        const url = (<NavigationEnd>event).url
        this.path = url.slice(1)
      }
    })
  }
}
