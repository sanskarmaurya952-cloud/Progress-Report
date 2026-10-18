import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Plus,
  MapPin,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  Building,
  Filter,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { HackathonEvent } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { SearchBar } from '../components/ui/SearchBar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';

const CATEGORIES = [
  'All',
  'Hackathon',
  'Coding Contest',
  'Workshop',
  'Conference',
  'Meetup',
  'Other',
];

export const HackathonsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State (Create / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HackathonEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    description: '',
    category: 'Hackathon',
    mode: 'online' as 'online' | 'offline' | 'hybrid',
    location: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    registerUrl: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = `/events?tab=${activeTab}&search=${encodeURIComponent(search)}`;
      if (selectedCategory !== 'All') {
        query += `&category=${encodeURIComponent(selectedCategory)}`;
      }

      const res = await apiFetch<any>(query);
      const list =
        res.events ||
        res.data?.events ||
        (Array.isArray(res.data) ? res.data : []) ||
        res.items ||
        (Array.isArray(res) ? res : []);
      setEvents(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, selectedCategory]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      organizer: '',
      description: '',
      category: 'Hackathon',
      mode: 'online',
      location: '',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      registerUrl: '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (event: HackathonEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      organizer: event.organizer,
      description: event.description,
      category: event.category || 'Hackathon',
      mode: event.mode,
      location: event.location || '',
      startDate: event.startDate ? event.startDate.split('T')[0] || '' : '',
      endDate: event.endDate ? event.endDate.split('T')[0] || '' : '',
      registrationDeadline: event.registrationDeadline
        ? event.registrationDeadline.split('T')[0] || ''
        : '',
      registerUrl: event.registerUrl,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Event title is required');
      return;
    }
    if (!formData.organizer.trim()) {
      setFormError('Organizer name is required');
      return;
    }
    if (!formData.startDate) {
      setFormError('Start date is required');
      return;
    }
    if (!formData.endDate) {
      setFormError('End date is required');
      return;
    }
    if (!formData.registrationDeadline) {
      setFormError('Registration deadline is required');
      return;
    }
    if (!formData.registerUrl.trim()) {
      setFormError('Registration URL is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingEvent) {
        await apiFetch(`/events/${editingEvent.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch('/events', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }

      setModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteEventId) return;
    setDeleting(true);
    try {
      await apiFetch(`/events/${deleteEventId}`, {
        method: 'DELETE',
      });
      setEvents((prev) => prev.filter((e) => e.id !== deleteEventId));
      setDeleteEventId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-uplivo-text tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-emerald-400" />
            <span>Hackathons & Events</span>
          </h1>
          <p className="text-sm text-uplivo-text-secondary mt-1">
            Discover peer competitions, technical hackathons, and developer conferences
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreateModal}
          icon={<Plus className="w-4 h-4" />}
          className="self-start sm:self-auto"
        >
          Post Event
        </Button>
      </div>

      {/* Control Bar: Tabs & Search/Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-uplivo-surface p-1 rounded-xl border border-uplivo-border self-start">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-uplivo-primary text-white shadow-md shadow-uplivo-primary/25'
                : 'text-uplivo-text-secondary hover:text-uplivo-text'
            }`}
          >
            Upcoming Events
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'past'
                ? 'bg-uplivo-primary text-white shadow-md shadow-uplivo-primary/25'
                : 'text-uplivo-text-secondary hover:text-uplivo-text'
            }`}
          >
            Past Events
          </button>
        </div>

        {/* Search & Category */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchBar
              value={search}
              onChange={(val) => setSearch(val)}
              placeholder="Search events, organizers..."
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-uplivo-text-muted shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-uplivo-surface text-uplivo-text text-sm rounded-lg border border-uplivo-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-uplivo-primary cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" label="Loading events..." />
        </div>
      ) : error ? (
        <div className="py-16 text-center text-uplivo-error bg-uplivo-card border border-uplivo-border rounded-xl p-8">
          <p className="font-semibold mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchEvents()}>
            Retry
          </Button>
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8" />}
          title={activeTab === 'upcoming' ? 'No upcoming events found' : 'No past events found'}
          description={
            search || selectedCategory !== 'All'
              ? 'No events match your current filter settings. Try adjusting your search query.'
              : 'Host or share a coding hackathon or workshop with fellow students.'
          }
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
              icon={<Plus className="w-4 h-4" />}
            >
              Post an Event
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isCreator = user?.id && event.creatorId && user.id === event.creatorId;

            return (
              <Card key={event.id} hover className="flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3 border-none">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant={
                            event.mode === 'online'
                              ? 'accent'
                              : event.mode === 'hybrid'
                              ? 'primary'
                              : 'secondary'
                          }
                          size="sm"
                        >
                          {event.mode.toUpperCase()}
                        </Badge>
                        {event.category && (
                          <Badge variant="outline" size="sm">
                            {event.category}
                          </Badge>
                        )}
                      </div>

                      {isCreator && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(event)}
                            className="p-1 text-uplivo-text-muted hover:text-uplivo-text rounded"
                            title="Edit Event"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteEventId(event.id)}
                            className="p-1 text-uplivo-text-muted hover:text-uplivo-error rounded"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-uplivo-text line-clamp-2 mt-1">
                      {event.title}
                    </h3>
                    <p className="text-xs text-uplivo-text-muted flex items-center gap-1 mt-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>{event.organizer}</span>
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0 pb-3 space-y-3">
                    <p className="text-xs text-uplivo-text-secondary line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="pt-2 border-t border-uplivo-border/40 space-y-1.5 text-xs text-uplivo-text-muted">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-uplivo-primary-light shrink-0" />
                        <span>
                          {new Date(event.startDate).toLocaleDateString()} —{' '}
                          {new Date(event.endDate).toLocaleDateString()}
                        </span>
                      </div>

                      {event.location && event.mode !== 'online' && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-uplivo-accent shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>
                          Register by:{' '}
                          <span className="text-uplivo-text-secondary font-medium">
                            {new Date(event.registrationDeadline).toLocaleDateString()}
                          </span>
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="pt-3 pb-3">
                  <a
                    href={event.registerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button
                      variant={activeTab === 'past' ? 'secondary' : 'primary'}
                      size="sm"
                      className="w-full text-xs"
                      icon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      {activeTab === 'past' ? 'View Details' : 'Register Now'}
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Post/Edit Event Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          if (!submitting) setModalOpen(false);
        }}
        title={editingEvent ? 'Edit Event Details' : 'Post an Event'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-uplivo-error/15 border border-uplivo-error/30 text-uplivo-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Event Title"
            required
            placeholder="e.g. National Hackathon 2025"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Organizer / Host"
              required
              placeholder="e.g. ACM Student Chapter"
              value={formData.organizer}
              onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-uplivo-surface text-uplivo-text text-sm rounded-lg border border-uplivo-border px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-uplivo-primary"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider mb-1.5">
                Event Mode <span className="text-uplivo-primary">*</span>
              </label>
              <select
                value={formData.mode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mode: e.target.value as 'online' | 'offline' | 'hybrid',
                  })
                }
                className="w-full bg-uplivo-surface text-uplivo-text text-sm rounded-lg border border-uplivo-border px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-uplivo-primary"
              >
                <option value="online">Online</option>
                <option value="offline">Offline / In-Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {formData.mode !== 'online' ? (
              <Input
                label="Location / Venue"
                placeholder="e.g. Bangalore, India"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            ) : (
              <div />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider mb-1.5">
              Description <span className="text-uplivo-primary">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Eligibility, problem statement tracks, prizes, and key requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-uplivo-surface text-uplivo-text text-sm rounded-lg border border-uplivo-border p-3 focus:outline-none focus:ring-2 focus:ring-uplivo-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Start Date"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />

            <Input
              label="End Date"
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />

            <Input
              label="Reg. Deadline"
              type="date"
              required
              value={formData.registrationDeadline}
              onChange={(e) =>
                setFormData({ ...formData, registrationDeadline: e.target.value })
              }
            />
          </div>

          <Input
            label="Registration URL"
            type="url"
            required
            placeholder="https://event-website.com/register"
            value={formData.registerUrl}
            onChange={(e) => setFormData({ ...formData, registerUrl: e.target.value })}
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingEvent ? 'Save Changes' : 'Publish Event'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Event Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteEventId)}
        onClose={() => setDeleteEventId(null)}
        title="Delete Event"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-uplivo-text-secondary">
            Are you sure you want to remove this event listing?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteEventId(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleting}
              onClick={handleDeleteEvent}
            >
              Delete Event
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
