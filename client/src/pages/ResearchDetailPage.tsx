import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Calendar,
  ExternalLink,
  MessageSquare,
  Edit2,
  Trash2,
  Send,
  AlertCircle,
  Plus,
  X,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { ResearchPaper, ResearchComment } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const CATEGORIES = [
  'AI/ML',
  'Web Development',
  'Data Science',
  'Cybersecurity',
  'IoT',
  'Blockchain',
  'Cloud Computing',
  'Other',
];

export const ResearchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [comments, setComments] = useState<ResearchComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comment submission
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Edit / Delete Comment state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [commentActionLoading, setCommentActionLoading] = useState(false);

  // Edit Paper Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAbstract, setEditAbstract] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editReferenceLinks, setEditReferenceLinks] = useState<string[]>(['']);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Paper state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPaperDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<any>(`/research/${id}`);
      const paperData = res.paper || (res.id ? res : null);
      setPaper(paperData);
      setComments(res.comments || paperData?.comments || []);

      if (paperData) {
        setEditTitle(paperData.title);
        setEditAbstract(paperData.abstract);
        setEditContent(paperData.content);
        setEditCategory(paperData.category);
        setEditReferenceLinks(
          paperData.referenceLinks?.length ? paperData.referenceLinks : ['']
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load research paper');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPaperDetails();
  }, [fetchPaperDetails]);

  const isAuthor = user?.id && paper?.authorId && user.id === paper.authorId;

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    setCommentSubmitting(true);
    setCommentError(null);
    try {
      const res = await apiFetch<any>(`/research/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const createdComment = res.comment || res;
      setComments((prev) => [...prev, createdComment]);
      setNewComment('');
    } catch (err: any) {
      setCommentError(err.message || 'Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Edit Comment
  const handleSaveCommentEdit = async (commentId: string) => {
    if (!editingCommentText.trim() || !id) return;
    setCommentActionLoading(true);
    try {
      await apiFetch(`/research/${id}/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content: editingCommentText.trim() }),
      });
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, content: editingCommentText.trim() } : c
        )
      );
      setEditingCommentId(null);
      setEditingCommentText('');
    } catch (err: any) {
      alert(err.message || 'Failed to update comment');
    } finally {
      setCommentActionLoading(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?') || !id) return;
    try {
      await apiFetch(`/research/${id}/comments/${commentId}`, {
        method: 'DELETE',
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  // Save Edit Paper
  const handleSaveEditPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setEditSaving(true);
    setEditError(null);

    const filteredRefs = editReferenceLinks.map((r) => r.trim()).filter(Boolean);

    try {
      const res = await apiFetch<any>(`/research/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle.trim(),
          abstract: editAbstract.trim(),
          content: editContent.trim(),
          category: editCategory,
          referenceLinks: filteredRefs,
        }),
      });

      const updated = res.paper || res;
      setPaper(updated);
      setEditModalOpen(false);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update research paper');
    } finally {
      setEditSaving(false);
    }
  };

  // Delete Paper
  const handleDeletePaper = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await apiFetch(`/research/${id}`, {
        method: 'DELETE',
      });
      navigate('/research');
    } catch (err: any) {
      alert(err.message || 'Failed to delete research paper');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label="Loading paper..." />
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="p-8 text-center bg-uplivo-card border border-uplivo-border rounded-xl">
        <p className="text-uplivo-error font-semibold mb-4">{error || 'Paper not found'}</p>
        <Button variant="secondary" onClick={() => navigate('/research')}>
          Back to Research
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/research')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-uplivo-text-secondary hover:text-uplivo-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Research Publications</span>
      </button>

      {/* Main Research Article Card */}
      <Card>
        <CardHeader className="p-6 sm:p-8 border-b border-uplivo-border/60">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <Badge variant="primary" size="md">
              {paper.category}
            </Badge>

            {/* Author Controls */}
            {isAuthor && (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditModalOpen(true)}
                  icon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteModalOpen(true)}
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-uplivo-text leading-tight mb-4">
            {paper.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-uplivo-text-secondary">
            <Link
              to="/profile"
              className="flex items-center gap-2 hover:text-uplivo-primary-light transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                {paper.authorName ? paper.authorName.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="font-semibold text-uplivo-text">{paper.authorName}</span>
            </Link>

            <span className="text-uplivo-border">•</span>

            <div className="flex items-center gap-1.5 text-uplivo-text-muted">
              <Calendar className="w-4 h-4" />
              <span>Published on {new Date(paper.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Abstract section */}
          <div className="p-5 rounded-xl bg-uplivo-surface/60 border border-uplivo-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-uplivo-primary-light mb-2">
              Abstract
            </h3>
            <p className="text-sm text-uplivo-text leading-relaxed italic">
              "{paper.abstract}"
            </p>
          </div>

          {/* Full content section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-uplivo-text-muted mb-4">
              Article Content
            </h3>
            <div className="text-sm sm:text-base text-uplivo-text-secondary leading-relaxed whitespace-pre-wrap font-sans space-y-4">
              {paper.content}
            </div>
          </div>

          {/* References section */}
          {paper.referenceLinks && paper.referenceLinks.length > 0 && (
            <div className="pt-6 border-t border-uplivo-border/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-uplivo-text-muted mb-3">
                References & Further Reading
              </h3>
              <ul className="space-y-2">
                {paper.referenceLinks.map((link, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-uplivo-primary-light shrink-0" />
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-uplivo-primary-light hover:underline truncate"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discussion / Comments Section */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-uplivo-primary-light" />
              <span>Peer Discussion ({comments.length})</span>
            </div>
          }
          subtitle="Join the conversation, leave feedback, or ask questions"
        />

        <CardContent className="p-6 space-y-6">
          {/* New Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-3">
            {commentError && (
              <p className="text-xs text-uplivo-error font-medium">{commentError}</p>
            )}
            <textarea
              rows={3}
              placeholder="Write a constructive comment or question..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
              className="w-full bg-uplivo-surface text-uplivo-text placeholder-uplivo-text-muted text-sm rounded-lg border border-uplivo-border p-3 focus:outline-none focus:ring-2 focus:ring-uplivo-primary resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={commentSubmitting}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Post Comment
              </Button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4 pt-4 border-t border-uplivo-border/60">
            {comments.length === 0 ? (
              <p className="text-center text-sm text-uplivo-text-muted py-6">
                No comments yet. Be the first to start the discussion!
              </p>
            ) : (
              comments.map((comment) => {
                const isCommentAuthor = user?.id === comment.userId;
                const isEditingThis = editingCommentId === comment.id;

                return (
                  <div
                    key={comment.id}
                    className="p-4 rounded-xl bg-uplivo-surface border border-uplivo-border/70 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-uplivo-primary/20 text-uplivo-primary-light flex items-center justify-center font-bold text-xs">
                          {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-uplivo-text">
                            {comment.authorName}
                          </span>
                          <span className="text-[11px] text-uplivo-text-muted ml-2">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Comment Actions for Author */}
                      {isCommentAuthor && !isEditingThis && (
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditingCommentText(comment.content);
                            }}
                            className="text-uplivo-text-muted hover:text-uplivo-text"
                          >
                            Edit
                          </button>
                          <span className="text-uplivo-border">•</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-uplivo-text-muted hover:text-uplivo-error"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditingThis ? (
                      <div className="space-y-2 pt-2">
                        <textarea
                          rows={2}
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          className="w-full bg-uplivo-card text-uplivo-text text-sm rounded-lg border border-uplivo-border p-2.5 focus:outline-none focus:ring-2 focus:ring-uplivo-primary"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCommentId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            loading={commentActionLoading}
                            onClick={() => handleSaveCommentEdit(comment.id)}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-uplivo-text-secondary leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Paper Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Research Paper"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveEditPaper} className="space-y-4">
          {editError && (
            <div className="p-3 rounded-lg bg-uplivo-error/15 border border-uplivo-error/30 text-uplivo-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-uplivo-surface text-uplivo-text text-sm rounded-lg border border-uplivo-border p-2.5 focus:outline-none focus:ring-2 focus:ring-uplivo-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full bg-uplivo-surface text-uplivo-text text-sm rounded-lg border border-uplivo-border p-2.5 focus:outline-none focus:ring-2 focus:ring-uplivo-primary"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider mb-1.5">
              Abstract
            </label>
            <textarea
              rows={3}
              required
              value={editAbstract}
              onChange={(e) => setEditAbstract(e.target.value)}
              className="w-full bg-uplivo-surface text-uplivo-text text-sm rounded-lg border border-uplivo-border p-2.5 focus:outline-none focus:ring-2 focus:ring-uplivo-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider mb-1.5">
              Full Content
            </label>
            <textarea
              rows={6}
              required
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-uplivo-surface text-uplivo-text text-sm rounded-lg border border-uplivo-border p-2.5 focus:outline-none focus:ring-2 focus:ring-uplivo-primary resize-y leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditModalOpen(false)}
              disabled={editSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={editSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Research Paper"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-uplivo-text-secondary">
            Are you sure you want to delete this research paper? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleting}
              onClick={handleDeletePaper}
            >
              Delete Paper
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
