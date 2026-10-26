import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode } from 'lucide-react';

interface CodeSnippet {
  id: string;
  title: string;
  filePath: string;
  description: string;
  code: string;
}

const SNIPPETS: CodeSnippet[] = [
  {
    id: 'api-slice',
    title: '1. Define API Slice',
    filePath: 'src/features/api/apiSlice.ts',
    description: 'Create endpoints, define tagTypes for automated caching & invalidation, and export auto-generated React hooks.',
    code: `import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Post } from './types';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Post'], // Used for cache invalidation
  endpoints: (builder) => ({
    // Query hook: useGetPostsQuery
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      providesTags: (result = []) => [
        { type: 'Post', id: 'LIST' },
        ...result.map(({ id }) => ({ type: 'Post' as const, id })),
      ],
    }),

    // Mutation hook: useAddPostMutation
    addPost: builder.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: '/posts',
        method: 'POST',
        body,
      }),
      // Invalidate the 'LIST' tag to trigger automatic refetch
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
  }),
});

export const { useGetPostsQuery, useAddPostMutation } = apiSlice;`,
  },
  {
    id: 'store',
    title: '2. Configure Store',
    filePath: 'src/app/store.ts',
    description: 'Add the apiSlice reducer and custom middleware to the Redux store, and call setupListeners.',
    code: `import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from '../features/api/apiSlice';

export const store = configureStore({
  reducer: {
    // 1. Add RTK Query reducer
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  // 2. Add RTK Query middleware for caching, invalidation & polling
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// 3. Optional: Enables refetchOnFocus & refetchOnReconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;`,
  },
  {
    id: 'provider',
    title: '3. Provide Store in React',
    filePath: 'src/main.tsx',
    description: 'Wrap your root React component tree with the Redux Provider.',
    code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);`,
  },
  {
    id: 'component',
    title: '4. Consume in Components',
    filePath: 'src/features/posts/PostsList.tsx',
    description: 'Use the auto-generated hooks in your UI. They handle loading, errors, caching, and data automatically!',
    code: `import React from 'react';
import { useGetPostsQuery, useAddPostMutation } from './apiSlice';

export function PostsList() {
  // Query hook gives you reactive status & data
  const { data: posts, isLoading, isFetching, error } = useGetPostsQuery();
  // Mutation hook gives you trigger function and mutation status
  const [addPost, { isLoading: isPosting }] = useAddPostMutation();

  if (isLoading) return <div>Loading initial cache...</div>;
  if (error) return <div>Failed to load posts</div>;

  return (
    <div>
      {isFetching && <span>Background refreshing...</span>}
      <button onClick={() => addPost({ title: 'New Post' })}>
        {isPosting ? 'Adding...' : 'Add Post'}
      </button>
      <ul>
        {posts?.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
    </div>
  );
}`,
  },
];

export const CodeViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState(SNIPPETS[0].id);
  const [copied, setCopied] = useState(false);

  const currentSnippet = SNIPPETS.find((s) => s.id === activeTab) || SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-viewer-container">
      <div className="code-viewer-header">
        <div className="code-viewer-tabs">
          {SNIPPETS.map((snippet) => (
            <button
              key={snippet.id}
              className={`code-tab ${activeTab === snippet.id ? 'active' : ''}`}
              onClick={() => setActiveTab(snippet.id)}
            >
              <FileCode size={14} />
              <span>{snippet.title}</span>
            </button>
          ))}
        </div>

        <button className="btn-copy-code" onClick={handleCopy}>
          {copied ? (
            <>
              <Check size={14} className="text-emerald" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy snippet</span>
            </>
          )}
        </button>
      </div>

      <div className="code-snippet-meta">
        <div className="file-tag">
          <Code2 size={13} />
          <code>{currentSnippet.filePath}</code>
        </div>
        <p className="file-desc">{currentSnippet.description}</p>
      </div>

      <div className="code-block-wrap">
        <pre className="code-block">
          <code>{currentSnippet.code}</code>
        </pre>
      </div>
    </div>
  );
};
