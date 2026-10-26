export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  category: 'Tech' | 'Architecture' | 'Frontend' | 'Tutorial';
  likes: number;
  createdAt: string;
}

export interface CreatePostInput {
  title: string;
  body: string;
  category: Post['category'];
  userId?: number;
}

export interface UpdatePostInput {
  id: number;
  title?: string;
  body?: string;
  category?: Post['category'];
  likes?: number;
}

export interface PostsQueryParams {
  search?: string;
  category?: string;
  limit?: number;
  page?: number;
}
