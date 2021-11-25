import { Injectable } from '@angular/core';
import API, { graphqlOperation } from '@aws-amplify/api';
import Observable from "zen-observable-ts";

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  getStatement = 'query getAllBlogs{ listBlogs {items {author,content,id,tags, title}}}'
  createBlogStatement = 'mutation addBlog { \
    createBlog( input: {author: ":AUTHOR", content: ":CONTENT", tags: ":TAGS", title: ":TITLE"} ) { \
      id \
      title \
      author \
      content \
      tags \
    } \
  }';
  subscriptionStatement = 'subscription createBlogSubscrition { \
    onCreateBlog { \
      author \
      content \
      id \
      tags \
      title \
    } \
  }';
  
  async getAllBlogs() {
    const response = (await API.graphql(graphqlOperation(this.getStatement))) as any;
    return response.data.listBlogs.items;
  }

  async createBlog(author: string, content: string, tags: string, title: string) {
    let stmt = this.createBlogStatement;
    stmt = stmt.replace(':CONTENT', content);
    stmt = stmt.replace(':AUTHOR', author);
    stmt = stmt.replace(':TAGS', tags);
    stmt = stmt.replace(':TITLE', title);
    console.log(stmt);
    const response = (await API.graphql(graphqlOperation(stmt))) as any;
    console.log(response);
    return response.data.addBlog;
  }

  subscribeToCreateBlog(): Observable<object> {
    return API.graphql(graphqlOperation(this.subscriptionStatement)) as Observable<object>;
  }
}
