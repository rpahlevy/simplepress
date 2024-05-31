import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

import { IconsModule } from './modules/icons/icons.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    IconsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'simplepress';
}
