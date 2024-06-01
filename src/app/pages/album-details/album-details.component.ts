import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Album } from '../../interfaces/album';
import { Photo } from '../../interfaces/photo';
import { AlbumService } from '../../services/album.service';

@Component({
  selector: 'app-album-details',
  standalone: true,
  imports: [],
  templateUrl: './album-details.component.html',
  styleUrl: './album-details.component.scss',
  providers: [AlbumService, DecimalPipe],
})
export class AlbumDetailsComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  albumId: number;
  album: Album | undefined;
  photos: Photo[];
  loading = false;

  constructor(
    public albumService: AlbumService,
    public title: Title
  ) {
    this.loading = true;
    this.photos = [];
    this.albumId = Number(this.route.snapshot.params['id']);
    this.albumService.findById(this.albumId).then(album => {
      console.log(album);
      this.album = album;
      if (album) {
        title.setTitle(album.title);
      }
      this._getPhotos();
    });
  }

  private _getPhotos() {
    this.albumService.getPhotos(this.albumId).then(photos => {
      this.photos = photos;
      this.loading = false;
    });
  }
}
