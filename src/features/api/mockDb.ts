import type { Post, CreatePostInput, UpdatePostInput, PostsQueryParams } from '../../types/api';

const STORAGE_KEY = 'rtk_query_posts_db';

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    title: 'Mastering RTK Query: Modern Data Fetching in React',
    body: 'RTK Query eliminates the need to hand-write data fetching & caching logic. It provides automated caching, polling, deduplication, and tag-based invalidation out of the box.',
    userId: 1,
    category: 'Architecture',
    likes: 42,
    createdAt: '2026-10-24T10:30:00Z',
  },
  {
    id: 2,
    title: 'Optimistic Updates & Cache Mutation Mechanics',
    body: 'Using onQueryStarted, RTK Query allows you to update cached query data immediately while the request is in-flight, automatically rolling back on mutation errors.',
    userId: 2,
    category: 'Frontend',
    likes: 29,
    createdAt: '2026-10-25T14:15:00Z',
  },
  {
    id: 3,
    title: 'Automated Cache Management with providesTags & invalidatesTags',
    body: 'Tags create a declarative dependency between mutations and queries. When a mutation invalidates a tag, any active query subscribing to that tag automatically refetches.',
    userId: 1,
    category: 'Tutorial',
    likes: 58,
    createdAt: '2026-10-26T08:00:00Z',
  },
  {
    id: 4,
    title: 'Refetch On Focus & Reconnect with setupListeners',
    body: 'By wiring setupListeners to your Redux store, RTK Query detects window focus or network reconnect events and can automatically trigger background revalidation.',
    userId: 3,
    category: 'Tech',
    likes: 19,
    createdAt: '2026-10-26T12:45:00Z',
  },
];

class MockDatabase {
  private posts: Post[] = [];
  public simulatedLatencyMs: number = 400;
  public simulateError: boolean = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.posts = JSON.parse(stored);
      } else {
        this.posts = [...INITIAL_POSTS];
        this.saveToStorage();
      }
    } catch {
      this.posts = [...INITIAL_POSTS];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.posts));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  public resetDatabase() {
    this.posts = [...INITIAL_POSTS];
    this.saveToStorage();
  }

  private async delay(): Promise<void> {
    if (this.simulatedLatencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.simulatedLatencyMs));
    }
    if (this.simulateError) {
      throw new Error('Simulated Network Failure: RTK Query caught this 500 error.');
    }
  }

  async getPosts(params?: PostsQueryParams): Promise<Post[]> {
    await this.delay();
    let result = [...this.posts];

    if (params?.search) {
      const query = params.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.body.toLowerCase().includes(query)
      );
    }

    if (params?.category && params.category !== 'All') {
      result = result.filter((p) => p.category === params.category);
    }

    // Sort descending by id/date
    result.sort((a, b) => b.id - a.id);

    if (params?.limit) {
      result = result.slice(0, params.limit);
    }

    return result;
  }

  async getPostById(id: number): Promise<Post> {
    await this.delay();
    const post = this.posts.find((p) => p.id === id);
    if (!post) {
      throw new Error(`Post with id #${id} not found.`);
    }
    return post;
  }

  async addPost(input: CreatePostInput): Promise<Post> {
    await this.delay();
    const newId = this.posts.length > 0 ? Math.max(...this.posts.map((p) => p.id)) + 1 : 1;
    const newPost: Post = {
      id: newId,
      title: input.title,
      body: input.body,
      category: input.category,
      userId: input.userId || 1,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    this.posts.unshift(newPost);
    this.saveToStorage();
    return newPost;
  }

  async updatePost(input: UpdatePostInput): Promise<Post> {
    await this.delay();
    const index = this.posts.findIndex((p) => p.id === input.id);
    if (index === -1) {
      throw new Error(`Post with id #${input.id} not found.`);
    }
    this.posts[index] = {
      ...this.posts[index],
      ...(input.title !== undefined && { title: input.title }),
      ...(input.body !== undefined && { body: input.body }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.likes !== undefined && { likes: input.likes }),
    };
    this.saveToStorage();
    return this.posts[index];
  }

  async deletePost(id: number): Promise<{ success: boolean; id: number }> {
    await this.delay();
    const index = this.posts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Post with id #${id} not found.`);
    }
    this.posts.splice(index, 1);
    this.saveToStorage();
    return { success: true, id };
  }

  async toggleLike(id: number): Promise<Post> {
    await this.delay();
    const post = this.posts.find((p) => p.id === id);
    if (!post) throw new Error('Post not found');
    post.likes += 1;
    this.saveToStorage();
    return { ...post };
  }
}

export const mockDb = new MockDatabase();
