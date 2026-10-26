import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { Post, CreatePostInput, UpdatePostInput, PostsQueryParams } from '../../types/api';
import { mockDb } from './mockDb';

// A custom BaseQueryFn simulating real HTTP API calls with network latency and error handling
const customBaseQuery: BaseQueryFn<
  { url: string; method?: string; body?: any; params?: any },
  unknown,
  { status: number; data: string }
> = async ({ url, method = 'GET', body, params }) => {
  try {
    if (url === '/posts' && method === 'GET') {
      const data = await mockDb.getPosts(params);
      return { data };
    }

    if (url.startsWith('/posts/') && method === 'GET') {
      const id = Number(url.replace('/posts/', ''));
      const data = await mockDb.getPostById(id);
      return { data };
    }

    if (url === '/posts' && method === 'POST') {
      const data = await mockDb.addPost(body as CreatePostInput);
      return { data };
    }

    if (url.startsWith('/posts/') && method === 'PUT') {
      const data = await mockDb.updatePost(body as UpdatePostInput);
      return { data };
    }

    if (url.startsWith('/posts/') && method === 'DELETE') {
      const id = Number(url.replace('/posts/', ''));
      const data = await mockDb.deletePost(id);
      return { data };
    }

    if (url.includes('/like') && method === 'POST') {
      const id = body.id;
      const data = await mockDb.toggleLike(id);
      return { data };
    }

    return { error: { status: 404, data: 'Not Found' } };
  } catch (error: any) {
    return {
      error: {
        status: 500,
        data: error?.message || 'Internal Server Error',
      },
    };
  }
};

/**
 * RTK Query API Slice
 *
 * Demonstrates:
 * 1. `reducerPath` & tag definitions (`tagTypes`)
 * 2. `providesTags` with hierarchical cache keys ('LIST' & individual IDs)
 * 3. `invalidatesTags` for automatic re-fetching on mutations
 * 4. Optimistic Updates using `onQueryStarted`
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: customBaseQuery,
  // Cache lifetime: retain unused cache entries for 60 seconds
  keepUnusedDataFor: 60,
  // Tag types used for caching and invalidation
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    // Query: Fetch all posts with optional filtering & search
    getPosts: builder.query<Post[], PostsQueryParams | void>({
      query: (params) => ({
        url: '/posts',
        method: 'GET',
        params,
      }),
      // Provides tags for the list and each individual item
      providesTags: (result = []) => [
        { type: 'Post', id: 'LIST' },
        ...result.map(({ id }) => ({ type: 'Post' as const, id })),
      ],
    }),

    // Query: Fetch a single post by ID
    getPostById: builder.query<Post, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Post', id }],
    }),

    // Mutation: Add new post
    addPost: builder.mutation<Post, CreatePostInput>({
      query: (newPost) => ({
        url: '/posts',
        method: 'POST',
        body: newPost,
      }),
      // Invalidate the list tag so getPosts refetches automatically
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),

    // Mutation: Update existing post
    updatePost: builder.mutation<Post, UpdatePostInput>({
      query: (postUpdate) => ({
        url: `/posts/${postUpdate.id}`,
        method: 'PUT',
        body: postUpdate,
      }),
      // Invalidate both the individual post and the list
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),

    // Mutation: Delete post with Optimistic Update
    deletePost: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
      // OPTIMISTIC UPDATE:
      // Remove item from the cached getPosts query immediately before the network finishes!
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        // Find existing query cache keys
        const patchResults: any[] = [];
        const state: any = getState();
        const queries = state.api.queries;

        for (const queryKey of Object.keys(queries)) {
          if (queryKey.startsWith('getPosts(')) {
            // Read endpoint argument from query
            const endpointArg = queries[queryKey]?.originalArgs;
            const patchResult = dispatch(
              apiSlice.util.updateQueryData('getPosts', endpointArg, (draft) => {
                const index = draft.findIndex((p) => p.id === id);
                if (index !== -1) {
                  draft.splice(index, 1);
                }
              })
            );
            patchResults.push(patchResult);
          }
        }

        try {
          await queryFulfilled;
        } catch {
          // If server fails, undo all optimistic patches!
          patchResults.forEach((patch) => patch.undo());
        }
      },
    }),

    // Mutation: Like post with Optimistic Cache Update
    likePost: builder.mutation<Post, number>({
      query: (id) => ({
        url: `/posts/${id}/like`,
        method: 'POST',
        body: { id },
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const patchResults: any[] = [];
        const state: any = getState();
        const queries = state.api.queries;

        for (const queryKey of Object.keys(queries)) {
          if (queryKey.startsWith('getPosts(')) {
            const endpointArg = queries[queryKey]?.originalArgs;
            const patchResult = dispatch(
              apiSlice.util.updateQueryData('getPosts', endpointArg, (draft) => {
                const post = draft.find((p) => p.id === id);
                if (post) {
                  post.likes += 1;
                }
              })
            );
            patchResults.push(patchResult);
          }
        }

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((patch) => patch.undo());
        }
      },
    }),
  }),
});

// Export auto-generated React hooks for queries and mutations
export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useAddPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useLikePostMutation,
} = apiSlice;
