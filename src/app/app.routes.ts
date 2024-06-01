import { Routes } from '@angular/router';
import { AlbumDetailsComponent } from './pages/album-details/album-details.component';
import { AlbumsComponent } from './pages/albums/albums.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PhotosComponent } from './pages/photos/photos.component';
import { PostDetailsComponent } from './pages/post-details/post-details.component';
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
    path: 'posts/:id',
    component: PostDetailsComponent,
  },
  {
    path: 'albums',
    component: AlbumsComponent,
    title: 'Albums',
  },
  {
    path: 'albums/:id',
    component: AlbumDetailsComponent,
  },
  // {
  //   path: 'albums/:id/photos',
  //   component: AlbumPhotosComponent,
  // },
  {
    path: 'photos',
    component: PhotosComponent,
    title: 'Photos',
  },
];
