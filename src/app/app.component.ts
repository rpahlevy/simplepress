import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { IconsModule } from './modules/icons/icons.module';
import { PostsComponent } from './pages/posts/posts.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    IconsModule,

    DashboardComponent,
    PostsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'simplepress';
}
