import { Component } from '@angular/core';
import { BlogService } from './services/blog.service';

import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Blog';
  
  blogForm!: FormGroup;

  blogsList: any[] = [];

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.initCalls();
    this.blogService.subscribeToCreateBlog().subscribe(
      (createdBlog: any) => {
        const newlyCreatedBlog = createdBlog.value.data.onCreateBlog;
        this.blogsList.push(newlyCreatedBlog);
      }
    )
  }

  initCalls() {
    this.initializeForm();
    //this.openCreateBlogSubscriptionSocket();
    this.getAllBlogs();
  }

  initializeForm() {
    this.blogForm = new FormGroup({
      author: new FormControl(null, [ Validators.minLength(2), Validators.required]),
      content: new FormControl(null, [ Validators.minLength(2), Validators.required]),
      title: new FormControl(null, [ Validators.minLength(2), Validators.required]),
      tags: new FormControl(null, [ Validators.minLength(2), Validators.required])
    })
  }

  openCreateBlogSubscriptionSocket() {
    this.blogService.subscribeToCreateBlog().subscribe(
      (createdBlog: any) => {
        const newlyCreatedBlog = createdBlog.value.data.onCreateBlog;
        this.blogsList.push(newlyCreatedBlog);
      }
    )
  }

  createBlog() {
    this.blogService.createBlog(
        this.blogForm.value.author,
        this.blogForm.value.content,
        this.blogForm.value.tags,
        this.blogForm.value.title)
  }

  getAllBlogs() {
    this.blogService.getAllBlogs().then(
      (allBlogs: any) => {
        this.blogsList = allBlogs;
      }
    )
  }
}
