import { Routes } from '@angular/router';
import { AlbumsComponent } from './pages/albums/albums.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PhotosComponent } from './pages/photos/photos.component';
import { PostsComponent } from './pages/posts/posts.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    title: 'Dashboard',
  },
  {
    path: 'posts',
    component: PostsComponent,
    title: 'Posts',
  },
  {
    path: 'albums',
    component: AlbumsComponent,
    title: 'Albums',
  },
  {
    path: 'photos',
    component: PhotosComponent,
    title: 'Photos',
  },
];
