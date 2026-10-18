import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  MessageSquare,
  Link as LinkIcon,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { ResearchPaper } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';

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

export const ResearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Publish Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0] || 'AI/ML');
  const [referenceLinks, setReferenceLinks] = useState<string[]>(['']);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = `/research?page=${page}&limit=6&search=${encodeURIComponent(search)}`;
      if (selectedCategory !== 'All') {
        query += `&category=${encodeURIComponent(selectedCategory)}`;
      }

      const res = await apiFetch<any>(query);
      const list =
        res.posts ||
        res.papers ||
        res.data?.posts ||
        (Array.isArray(res.data) ? res.data : []) ||
        res.items ||
        (Array.isArray(res) ? res : []);
      setPapers(Array.isArray(list) ? list : []);
      setTotalPages(res.pagination?.totalPages || res.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load research articles');
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const handleAddRefLink = () => {
    setReferenceLinks([...referenceLinks, '']);
  };

  const handleRemoveRefLink = (index: number) => {
    const updated = referenceLinks.filter((_, i) => i !== index);
    setReferenceLinks(updated.length ? updated : ['']);
  };

  const handleRefLinkChange = (index: number, val: string) => {
    const updated = [...referenceLinks];
    updated[index] = val;
    setReferenceLinks(updated);
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!abstract.trim()) {
      setFormError('Abstract is required');
      return;
    }
    if (!content.trim()) {
      setFormError('Full content is required');
      return;
    }

    const filteredRefs = referenceLinks.map((r) => r.trim()).filter(Boolean);

    setSubmitting(true);
    try {
      await apiFetch('/research', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          abstract: abstract.trim(),
          content: content.trim(),
          category,
          referenceLinks: filteredRefs,
        }),
      });

      setSuccessMsg('Research paper published successfully!');
      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg(null);
        setTitle('');
        setAbstract('');
        setContent('');
        setCategory(CATEGORIES[0] || 'AI/ML');
        setReferenceLinks(['']);
        fetchPapers();
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to publish research');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-uplivo-text tracking-tight flex items-center gap-2.5">
            <FlaskConical className="w-7 h-7 text-purple-400" />
            <span>Research & Analysis</span>
          </h1>
          <p className="text-sm text-uplivo-text-secondary mt-1">
            Publish research articles, read student technical explorations, and engage in constructive discussions
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
          className="self-start sm:self-auto"
        >
          Publish Research
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search research topics, authors..."
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-uplivo-text-muted shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="bg-uplivo-surface text-uplivo-text text-sm rounded-lg border border-uplivo-border px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-uplivo-primary cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Papers Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" label="Loading research publications..." />
        </div>
      ) : error ? (
        <div className="py-16 text-center text-uplivo-error bg-uplivo-card border border-uplivo-border rounded-xl p-8">
          <p className="font-semibold mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchPapers()}>
            Retry
          </Button>
        </div>
      ) : papers.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="w-8 h-8" />}
          title="No research publications found"
          description={
            search || selectedCategory !== 'All'
              ? 'No publications matched your search criteria. Try a broader search or category.'
              : 'Share your project findings, system architecture, or literature reviews with the community.'
          }
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Publish Research
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <Card
              key={paper.id}
              hover
              onClick={() => navigate(`/research/${paper.id}`)}
              className="flex flex-col justify-between cursor-pointer"
            >
              <div>
                <CardHeader className="pb-3 border-none">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <Badge variant="primary" size="sm">
                      {paper.category}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-base text-uplivo-text line-clamp-2 hover:text-uplivo-primary-light transition-colors">
                    {paper.title}
                  </h3>
                </CardHeader>

                <CardContent className="pt-0 pb-3">
                  <p className="text-xs text-uplivo-text-secondary line-clamp-4 leading-relaxed">
                    {paper.abstract}
                  </p>
                </CardContent>
              </div>

              <div>
                <div className="px-5 py-2.5 text-xs text-uplivo-text-muted flex items-center justify-between border-t border-uplivo-border/40">
                  <span className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span>{paper.authorName}</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>

                <CardFooter className="pt-3 pb-3 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-uplivo-text-secondary font-medium">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{paper.commentsCount || 0} Comments</span>
                  </span>
                  <span className="text-uplivo-primary-light font-semibold hover:underline">
                    Read article &rarr;
                  </span>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Publish Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          if (!submitting) setModalOpen(false);
        }}
        title="Publish Research & Analysis"
        maxWidth="2xl"
      >
        <form onSubmit={handlePublishSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-uplivo-error/15 border border-uplivo-error/30 text-uplivo-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-uplivo-success/15 border border-uplivo-success/30 text-uplivo-success text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <Input
            label="Research Title"
            required
            placeholder="e.g. Comparative Analysis of High-Throughput Key-Value Stores"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider mb-1.5">
              Category <span className="text-uplivo-primary">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-uplivo-surface text-uplivo-text text-sm rounded-lg border border-uplivo-border px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-uplivo-primary"
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
              Abstract <span className="text-uplivo-primary">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="High-level overview and problem statement (1-2 paragraphs)..."
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              className="w-full bg-uplivo-surface text-uplivo-text placeholder-uplivo-text-muted text-sm rounded-lg border border-uplivo-border p-3 focus:outline-none focus:ring-2 focus:ring-uplivo-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider mb-1.5">
              Full Content <span className="text-uplivo-primary">*</span>
            </label>
            <textarea
              rows={7}
              required
              placeholder="Write your detailed findings, architecture, methodology, benchmarks, conclusions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-uplivo-surface text-uplivo-text placeholder-uplivo-text-muted text-sm rounded-lg border border-uplivo-border p-3 focus:outline-none focus:ring-2 focus:ring-uplivo-primary resize-y font-sans leading-relaxed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider">
                Reference Links
              </label>
              <button
                type="button"
                onClick={handleAddRefLink}
                className="text-xs text-uplivo-primary-light hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            <div className="space-y-2">
              {referenceLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-uplivo-text-muted pointer-events-none" />
                    <input
                      type="url"
                      placeholder="https://arxiv.org/abs/... or https://github.com/..."
                      value={link}
                      onChange={(e) => handleRefLinkChange(idx, e.target.value)}
                      className="w-full bg-uplivo-surface text-uplivo-text placeholder-uplivo-text-muted text-sm rounded-lg border border-uplivo-border pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-uplivo-primary"
                    />
                  </div>
                  {referenceLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRefLink(idx)}
                      className="p-2 text-uplivo-text-muted hover:text-uplivo-error rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon={<FlaskConical className="w-4 h-4" />}
            >
              Publish Article
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
