import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

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

  constructor(title: Title) {
    this.title = title;
  }
}
