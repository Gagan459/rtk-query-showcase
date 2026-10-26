import React, { useState } from 'react';
import type { Post } from '../../types/api';
import { useDeletePostMutation, useLikePostMutation } from '../api/apiSlice';
import { Heart, Edit3, Trash2, Tag, Calendar, User } from 'lucide-react';

interface PostItemProps {
  post: Post;
  onEdit: (post: Post) => void;
}

const CATEGORY_COLORS: Record<Post['category'], string> = {
  Architecture: 'category-badge-purple',
  Frontend: 'category-badge-cyan',
  Tutorial: 'category-badge-emerald',
  Tech: 'category-badge-amber',
};

export const PostItem: React.FC<PostItemProps> = ({ post, onEdit }) => {
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [likePost, { isLoading: isLiking }] = useLikePostMutation();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = async () => {
    try {
      await deletePost(post.id).unwrap();
    } catch (err) {
      console.error('Failed to delete post:', err);
      setIsConfirmingDelete(false);
    }
  };

  const handleLike = async () => {
    try {
      await likePost(post.id).unwrap();
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  return (
    <article className="post-card">
      <div className="post-card-header">
        <div className="post-meta-top">
          <span className={`category-badge ${CATEGORY_COLORS[post.category]}`}>
            <Tag size={12} />
            {post.category}
          </span>
          <span className="post-id-tag">ID #{post.id}</span>
        </div>

        <div className="post-card-actions">
          <button
            className="btn-icon"
            onClick={() => onEdit(post)}
            title="Edit post"
            aria-label="Edit post"
          >
            <Edit3 size={16} />
          </button>

          {isConfirmingDelete ? (
            <div className="confirm-delete-group">
              <span className="confirm-delete-label">Delete?</span>
              <button
                className="btn-danger-sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                Yes
              </button>
              <button
                className="btn-cancel-sm"
                onClick={() => setIsConfirmingDelete(false)}
              >
                No
              </button>
            </div>
          ) : (
            <button
              className="btn-icon text-muted-hover-danger"
              onClick={() => setIsConfirmingDelete(true)}
              title="Delete post"
              aria-label="Delete post"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <h3 className="post-title">{post.title}</h3>
      <p className="post-body">{post.body}</p>

      <div className="post-card-footer">
        <div className="post-meta-details">
          <span className="meta-item">
            <User size={13} />
            <span>Author {post.userId}</span>
          </span>
          <span className="meta-separator">•</span>
          <span className="meta-item">
            <Calendar size={13} />
            <span>{formattedDate}</span>
          </span>
        </div>

        <button
          className={`btn-like ${post.likes > 0 ? 'btn-like-active' : ''}`}
          onClick={handleLike}
          disabled={isLiking}
          title="Like post (Optimistic update demo)"
        >
          <Heart size={15} className={post.likes > 0 ? 'fill-current' : ''} />
          <span>{post.likes}</span>
        </button>
      </div>
    </article>
  );
};
