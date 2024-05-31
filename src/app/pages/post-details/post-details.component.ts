import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Post } from '../../interfaces/post';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.scss',
  providers: [PostService, DecimalPipe],
})
export class PostDetailsComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  postId: number;
  post: Post | undefined;

  constructor(
    public postService: PostService,
    public title: Title
  ) {
    this.postId = Number(this.route.snapshot.params['id']);
    this.post = this.postService.findById(this.postId);
    if (this.post) {
      title.setTitle(this.post.title);
    }
    console.log(this.post);
  }
}
