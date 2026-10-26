# RTK Query in React — Architecture & Interactive Showcase

A production-grade React + TypeScript project configured with **Redux Toolkit 2.x** and **RTK Query**, demonstrating automated caching, declarative tag-based cache invalidation, optimistic updates, polling, and real-time state inspection.

---

## 🚀 Quick Start

The development server is already configured and running at:
```bash
http://localhost:5180/
```

To run it locally or restart:
```bash
cd C:\Users\gagan\.gemini\antigravity-ide\scratch\rtk-query-showcase
npm install
npm run dev -- --port 5180
```

To produce an optimized production build:
```bash
npm run build
```

---

## 📁 Project Architecture

```
src/
├── app/
│   ├── store.ts         # Redux store with apiSlice reducer, middleware & setupListeners()
│   └── hooks.ts         # Typed hooks (useAppDispatch, useAppSelector)
├── features/
│   ├── api/
│   │   ├── apiSlice.ts  # createApi definition, tagTypes, queries, mutations & optimistic updates
│   │   └── mockDb.ts    # Interactive local database with simulated latency & network errors
│   ├── posts/
│   │   ├── PostsList.tsx # Query consumer with search, filter, polling, and cache status flags
│   │   ├── PostItem.tsx  # Post card with optimistic like & delete mutations
│   │   └── PostModal.tsx # Form modal for adding / updating posts
│   ├── inspector/
│   │   └── RtkInspector.tsx # Real-time RTK Query cache debugger & network latency simulator
│   └── code-viewer/
│       └── CodeViewer.tsx   # Interactive tabbed code guide for quick reference
├── types/
│   └── api.ts           # TypeScript interfaces for data entities & query arguments
├── App.tsx              # Main application shell with tab switcher
├── main.tsx             # Root Provider setup with Redux Store
└── index.css            # Dark glassmorphic design system
```

---

## 🔑 Core RTK Query Concepts Implemented

### 1. Defining the API Slice (`src/features/api/apiSlice.ts`)
```typescript
import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: customBaseQuery, // Or fetchBaseQuery({ baseUrl: '/api' })
  tagTypes: ['Post'],        // Tag identifiers for cache invalidation
  keepUnusedDataFor: 60,      // Retain inactive cache entries for 60 seconds
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], PostsQueryParams | void>({
      query: (params) => ({ url: '/posts', method: 'GET', params }),
      providesTags: (result = []) => [
        { type: 'Post', id: 'LIST' },
        ...result.map(({ id }) => ({ type: 'Post' as const, id })),
      ],
    }),
    addPost: builder.mutation<Post, CreatePostInput>({
      query: (newPost) => ({ url: '/posts', method: 'POST', body: newPost }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
  }),
});
```

### 2. Configuring the Redux Store (`src/app/store.ts`)
```typescript
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from '../features/api/apiSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// Enables refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch);
```

### 3. Supplying the Redux Provider (`src/main.tsx`)
```tsx
import { Provider } from 'react-redux';
import { store } from './app/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
```

### 4. Optimistic Cache Updates (`onQueryStarted`)
```typescript
deletePost: builder.mutation<{ success: boolean; id: number }, number>({
  query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
  invalidatesTags: (_result, _error, id) => [
    { type: 'Post', id },
    { type: 'Post', id: 'LIST' },
  ],
  async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
    // Optimistically remove the item from query cache immediately
    const patchResult = dispatch(
      apiSlice.util.updateQueryData('getPosts', undefined, (draft) => {
        const index = draft.findIndex((p) => p.id === id);
        if (index !== -1) draft.splice(index, 1);
      })
    );
    try {
      await queryFulfilled;
    } catch {
      patchResult.undo(); // Roll back if server call fails
    }
  },
});
```

---

## 🧪 Interactive Features

- **Live RTK Query Inspector**: View active queries, subscribed cache keys, mutation results, and raw Redux store state in real-time.
- **Network Latency Simulator**: Toggle between Instant (0ms), Default (400ms), and Slow 3G (1.2s) to observe `isLoading` and `isFetching` states.
- **500 Server Error Emulation**: Toggle server errors to see how RTK Query handles failed queries and rolls back optimistic mutations.
- **Polling & Window Focus Revalidation**: Test automated polling (3s, 6s, 15s) and `refetchOnFocus`.
