import React, { useState } from 'react';
import { useGetPostsQuery } from '../api/apiSlice';
import { PostItem } from './PostItem';
import { PostModal } from './PostModal';
import type { Post } from '../../types/api';
import {
  Search,
  Plus,
  RefreshCw,
  Clock,
  Radio,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Filter,
} from 'lucide-react';

const CATEGORIES = ['All', 'Architecture', 'Frontend', 'Tutorial', 'Tech'];

export const PostsList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [pollingInterval, setPollingInterval] = useState<number>(0);
  const [refetchOnFocus, setRefetchOnFocus] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // RTK Query hook invocation
  const {
    data: posts = [],
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetPostsQuery(
    {
      search: search.trim() || undefined,
      category: category !== 'All' ? category : undefined,
    },
    {
      pollingInterval,
      refetchOnFocus,
    }
  );

  const handleOpenCreateModal = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  return (
    <section className="posts-section">
      {/* Top action toolbar */}
      <div className="toolbar-container">
        <div className="toolbar-left">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search posts by title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button
                className="btn-clear-search"
                onClick={() => setSearch('')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="category-chips">
            <Filter size={15} className="filter-icon" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-chip ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-right">
          <button
            className="btn btn-primary btn-add-post"
            onClick={handleOpenCreateModal}
          >
            <Plus size={18} />
            <span>New Post</span>
          </button>
        </div>
      </div>

      {/* RTK Query Status & Behavior Bar */}
      <div className="rtk-status-bar">
        <div className="status-indicators">
          <div
            className={`status-pill ${
              isFetching ? 'status-pill-fetching' : 'status-pill-idle'
            }`}
            title="isFetching is true whenever any request is in-flight, including background re-validations."
          >
            {isFetching ? (
              <Loader2 size={13} className="spin" />
            ) : (
              <CheckCircle2 size={13} />
            )}
            <span>{isFetching ? 'isFetching: true' : 'isFetching: false'}</span>
          </div>

          <div
            className={`status-pill ${
              isLoading ? 'status-pill-loading' : 'status-pill-idle'
            }`}
            title="isLoading is only true on the very first query request when no data is cached yet."
          >
            <span>{isLoading ? 'isLoading: true' : 'isLoading: false'}</span>
          </div>

          <div
            className={`status-pill ${
              isSuccess ? 'status-pill-success' : 'status-pill-idle'
            }`}
          >
            <span>isSuccess</span>
          </div>

          {isError && (
            <div className="status-pill status-pill-error">
              <AlertTriangle size={13} />
              <span>isError</span>
            </div>
          )}
        </div>

        <div className="query-options-group">
          {/* Polling controller */}
          <div className="option-select-wrap">
            <Clock size={14} className="text-muted" />
            <label htmlFor="poll-interval">Polling:</label>
            <select
              id="poll-interval"
              value={pollingInterval}
              onChange={(e) => setPollingInterval(Number(e.target.value))}
              className="select-compact"
            >
              <option value={0}>Off</option>
              <option value={3000}>Every 3s</option>
              <option value={6000}>Every 6s</option>
              <option value={15000}>Every 15s</option>
            </select>
          </div>

          {/* Refetch on focus toggle */}
          <label className="checkbox-toggle" title="RTK Query setupListeners() auto-refetches when window regains focus.">
            <input
              type="checkbox"
              checked={refetchOnFocus}
              onChange={(e) => setRefetchOnFocus(e.target.checked)}
            />
            <Radio size={14} />
            <span>Refetch on focus</span>
          </label>

          {/* Manual refetch button */}
          <button
            className={`btn-icon-labeled ${isFetching ? 'spinning' : ''}`}
            onClick={() => refetch()}
            disabled={isFetching}
            title="Trigger manual refetch() on the query hook"
          >
            <RefreshCw size={14} className={isFetching ? 'spin' : ''} />
            <span>Refetch</span>
          </button>
        </div>
      </div>

      {/* Post content area */}
      <div className="posts-display-container">
        {isLoading ? (
          <div className="state-panel loading-state">
            <Loader2 size={36} className="spin text-cyan" />
            <p className="state-title">Fetching initial query from RTK Query cache...</p>
            <span className="state-desc">Initializing cache slice in Redux store</span>
          </div>
        ) : isError ? (
          <div className="state-panel error-state">
            <AlertTriangle size={36} className="text-danger" />
            <p className="state-title">Query Error Encountered</p>
            <p className="state-desc">
              {(error as any)?.data || 'Failed to fetch posts.'}
            </p>
            <button className="btn btn-secondary" onClick={() => refetch()}>
              <RefreshCw size={14} />
              <span>Retry Query</span>
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="state-panel empty-state">
            <p className="state-title">No posts found</p>
            <p className="state-desc">
              {search
                ? `No posts matched "${search}". Try clearing the search query.`
                : 'Click "New Post" to add one to the mock API.'}
            </p>
            {search && (
              <button
                className="btn btn-secondary"
                onClick={() => setSearch('')}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                onEdit={handleEditPost}
              />
            ))}
          </div>
        )}
      </div>

      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        postToEdit={editingPost}
      />
    </section>
  );
};
