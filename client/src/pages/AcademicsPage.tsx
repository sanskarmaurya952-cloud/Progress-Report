import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Upload,
  Download,
  FileText,
  Filter,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { AcademicResource } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';

const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Other',
];

export const AcademicsPage: React.FC = () => {
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    subject: SUBJECTS[3] || 'Computer Science',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = `/academics?page=${page}&limit=9&search=${encodeURIComponent(search)}`;
      if (selectedSubject !== 'All') {
        query += `&subject=${encodeURIComponent(selectedSubject)}`;
      }

      const res = await apiFetch<any>(query);
      const list =
        res.resources ||
        res.data?.resources ||
        (Array.isArray(res.data) ? res.data : []) ||
        res.items ||
        (Array.isArray(res) ? res : []);
      setResources(Array.isArray(list) ? list : []);
      setTotalPages(res.pagination?.totalPages || res.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch academic resources');
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedSubject]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Only PDF files are supported');
      setSelectedFile(null);
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      setFileError('File size exceeds the 10MB limit');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFileError(null);
    setUploadSuccess(null);

    if (!uploadForm.title.trim()) {
      setFileError('Please provide a document title');
      return;
    }

    if (!uploadForm.description.trim()) {
      setFileError('Please provide a brief description');
      return;
    }

    if (!selectedFile) {
      setFileError('Please choose a PDF file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadForm.title.trim());
    formData.append('description', uploadForm.description.trim());
    formData.append('subject', uploadForm.subject);
    formData.append('file', selectedFile);

    setUploading(true);
    try {
      await apiFetch('/academics', {
        method: 'POST',
        body: formData,
      });

      setUploadSuccess('Resource uploaded successfully!');
      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadSuccess(null);
        setUploadForm({
          title: '',
          description: '',
          subject: SUBJECTS[3] || 'Computer Science',
        });
        setSelectedFile(null);
        fetchResources();
      }, 1200);
    } catch (err: any) {
      setFileError(err.message || 'Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (id: string, fileUrl?: string) => {
    const downloadUrl = fileUrl || `/api/v1/academics/${id}/download`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-uplivo-text tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-uplivo-accent" />
            <span>Academic Resources</span>
          </h1>
          <p className="text-sm text-uplivo-text-secondary mt-1">
            Access, download, and share verified study notes and course materials
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setUploadModalOpen(true)}
          icon={<Upload className="w-4 h-4" />}
          className="self-start sm:self-auto"
        >
          Upload Resource
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search notes, textbooks, subjects..."
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-uplivo-text-muted shrink-0" />
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setPage(1);
            }}
            className="bg-uplivo-surface text-uplivo-text text-sm rounded-lg border border-uplivo-border px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-uplivo-primary cursor-pointer"
          >
            <option value="All">All Subjects</option>
            {SUBJECTS.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Content */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" label="Loading study materials..." />
        </div>
      ) : error ? (
        <div className="py-16 text-center text-uplivo-error bg-uplivo-card border border-uplivo-border rounded-xl p-8">
          <p className="font-semibold mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchResources()}>
            Retry
          </Button>
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No resources found"
          description={
            search || selectedSubject !== 'All'
              ? 'No study materials matched your search filters. Try adjusting your query.'
              : 'Be the first to share your notes or course materials with your peers.'
          }
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setUploadModalOpen(true)}
              icon={<Upload className="w-4 h-4" />}
            >
              Upload Document
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <Card key={res.id} hover className="flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 border-none">
                  <div className="flex items-start justify-between gap-3 w-full">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-uplivo-accent/10 border border-uplivo-accent/20 flex items-center justify-center text-uplivo-accent shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <Badge variant="accent" size="sm">
                        {res.subject}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-uplivo-text mt-3 line-clamp-1">
                    {res.title}
                  </h3>
                </CardHeader>

                <CardContent className="pt-0 pb-3">
                  <p className="text-xs text-uplivo-text-secondary line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>
                </CardContent>
              </div>

              <div>
                <div className="px-5 py-2.5 text-xs text-uplivo-text-muted flex items-center justify-between border-t border-uplivo-border/40">
                  <span className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-uplivo-primary-light" />
                    <span>{res.uploaderName}</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>

                <CardFooter className="pt-3 pb-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handleDownload(res.id, res.fileUrl)}
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download PDF
                  </Button>
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

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => {
          if (!uploading) setUploadModalOpen(false);
        }}
        title="Upload Academic Resource"
        maxWidth="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {fileError && (
            <div className="p-3 rounded-lg bg-uplivo-error/15 border border-uplivo-error/30 text-uplivo-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 rounded-lg bg-uplivo-success/15 border border-uplivo-success/30 text-uplivo-success text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <Input
            label="Resource Title"
            required
            placeholder="e.g. Distributed Systems Lecture Notes & Cheatsheet"
            value={uploadForm.title}
            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider mb-1.5">
              Subject <span className="text-uplivo-primary">*</span>
            </label>
            <select
              value={uploadForm.subject}
              onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
              className="w-full bg-uplivo-surface text-uplivo-text text-sm rounded-lg border border-uplivo-border px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-uplivo-primary"
            >
              {SUBJECTS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider mb-1.5">
              Description <span className="text-uplivo-primary">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Brief overview of key concepts covered in this document..."
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              className="w-full bg-uplivo-surface text-uplivo-text placeholder-uplivo-text-muted text-sm rounded-lg border border-uplivo-border p-3 focus:outline-none focus:ring-2 focus:ring-uplivo-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider mb-1.5">
              PDF Document <span className="text-uplivo-primary">*</span> (Max 10MB)
            </label>
            <div className="border-2 border-dashed border-uplivo-border rounded-xl p-4 text-center hover:border-uplivo-primary/50 transition-colors">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Upload className="w-6 h-6 text-uplivo-primary-light" />
                <span className="text-sm font-semibold text-uplivo-text">
                  {selectedFile ? selectedFile.name : 'Choose a PDF file'}
                </span>
                <span className="text-xs text-uplivo-text-muted">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                    : 'PDF files only, up to 10MB'}
                </span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setUploadModalOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={uploading}
              icon={<Upload className="w-4 h-4" />}
            >
              {uploading ? 'Uploading...' : 'Publish Document'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
