import React, { useState, useEffect } from 'react';
import type { Post, CreatePostInput } from '../../types/api';
import { useAddPostMutation, useUpdatePostMutation } from '../api/apiSlice';
import { X, Sparkles, AlertCircle } from 'lucide-react';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToEdit?: Post | null;
}

const CATEGORIES: Post['category'][] = ['Architecture', 'Frontend', 'Tutorial', 'Tech'];

export const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, postToEdit }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<Post['category']>('Frontend');
  const [formError, setFormError] = useState('');

  const [addPost, { isLoading: isAdding }] = useAddPostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

  const isSubmitting = isAdding || isUpdating;

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title);
      setBody(postToEdit.body);
      setCategory(postToEdit.category);
    } else {
      setTitle('');
      setBody('');
      setCategory('Frontend');
    }
    setFormError('');
  }, [postToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }

    try {
      if (postToEdit) {
        await updatePost({
          id: postToEdit.id,
          title: title.trim(),
          body: body.trim(),
          category,
        }).unwrap();
      } else {
        const newPost: CreatePostInput = {
          title: title.trim(),
          body: body.trim(),
          category,
          userId: 1,
        };
        await addPost(newPost).unwrap();
      }
      onClose();
    } catch (err: any) {
      setFormError(err?.data || 'Failed to save post. Please check the inspector network error setting.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Sparkles size={18} className="text-cyan" />
            </div>
            <h2 id="modal-title">
              {postToEdit ? 'Edit Post (RTK Mutation)' : 'Create New Post (RTK Mutation)'}
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {formError && (
            <div className="alert-error">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="post-title">Post Title</label>
            <input
              id="post-title"
              type="text"
              placeholder="e.g. Understanding Cache Invalidation in RTK Query"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="post-category">Category</label>
            <select
              id="post-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Post['category'])}
              disabled={isSubmitting}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="post-body">Content</label>
            <textarea
              id="post-body"
              rows={4}
              placeholder="Write the post details here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Mutating Cache...'
                : postToEdit
                ? 'Save Changes'
                : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
