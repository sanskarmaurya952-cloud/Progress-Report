import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  School,
  GraduationCap,
  Calendar,
  Linkedin,
  Code2,
  Trophy,
  CheckCircle,
  ExternalLink,
  Edit2,
  Save,
  X,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const ACADEMIC_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
  'Other',
];

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    collegeName: '',
    course: '',
    academicYear: '1st Year',
    linkedinUrl: '',
    leetcodeUrl: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        collegeName: user.collegeName || '',
        course: user.course || '',
        academicYear: user.academicYear || '1st Year',
        linkedinUrl: user.linkedinUrl || '',
        leetcodeUrl: user.leetcodeUrl || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = 'Full Name must be at least 2 characters';
    }

    if (!formData.collegeName.trim()) {
      errors.collegeName = 'College Name is required';
    }

    if (!formData.course.trim()) {
      errors.course = 'Course/Degree is required';
    }

    const urlRegex = /^https?:\/\/.+/i;
    if (!formData.linkedinUrl.trim()) {
      errors.linkedinUrl = 'LinkedIn URL is required';
    } else if (!urlRegex.test(formData.linkedinUrl.trim()) || !formData.linkedinUrl.toLowerCase().includes('linkedin.com')) {
      errors.linkedinUrl = 'Must be a valid LinkedIn profile URL';
    }

    if (!formData.leetcodeUrl.trim()) {
      errors.leetcodeUrl = 'LeetCode URL is required';
    } else if (!urlRegex.test(formData.leetcodeUrl.trim()) || !formData.leetcodeUrl.toLowerCase().includes('leetcode.com')) {
      errors.leetcodeUrl = 'Must be a valid LeetCode profile URL';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMsg(null);

    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      await apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          collegeName: formData.collegeName.trim(),
          course: formData.course.trim(),
          academicYear: formData.academicYear,
          linkedinUrl: formData.linkedinUrl.trim(),
          leetcodeUrl: formData.leetcodeUrl.trim(),
        }),
      });

      await refreshUser();
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setApiError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        collegeName: user.collegeName || '',
        course: user.course || '',
        academicYear: user.academicYear || '1st Year',
        linkedinUrl: user.linkedinUrl || '',
        leetcodeUrl: user.leetcodeUrl || '',
      });
    }
    setFieldErrors({});
    setApiError(null);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title & Edit Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-uplivo-text tracking-tight flex items-center gap-2.5">
            <UserIcon className="w-7 h-7 text-uplivo-primary-light" />
            <span>My Profile</span>
          </h1>
          <p className="text-sm text-uplivo-text-secondary mt-1">
            Manage your personal academic information and coding credentials
          </p>
        </div>

        {!isEditing ? (
          <Button
            variant="secondary"
            onClick={() => setIsEditing(true)}
            icon={<Edit2 className="w-4 h-4" />}
            className="self-start sm:self-auto"
          >
            Edit Profile
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={handleCancel}
            icon={<X className="w-4 h-4" />}
            className="self-start sm:self-auto"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Status Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-uplivo-success/15 border border-uplivo-success/30 text-uplivo-success text-sm flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {apiError && (
        <div className="p-4 rounded-xl bg-uplivo-error/15 border border-uplivo-error/30 text-uplivo-error text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <Card>
        {/* Banner with Avatar */}
        <div className="h-32 bg-gradient-to-r from-uplivo-primary/30 via-uplivo-surface to-uplivo-accent/20 relative" />
        <div className="px-6 sm:px-8 pb-6">
          <div className="relative -mt-14 mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-uplivo-surface border-4 border-uplivo-card flex items-center justify-center text-uplivo-primary-light font-black text-3xl shadow-xl">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="mb-2">
                <h2 className="text-xl sm:text-2xl font-black text-uplivo-text">
                  {user.fullName}
                </h2>
                <p className="text-xs sm:text-sm text-uplivo-text-secondary font-medium">
                  {user.collegeName} • {user.course}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" size="md">
                {user.academicYear}
              </Badge>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-uplivo-surface/70 border border-uplivo-border mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-uplivo-text-muted">
                Total Solved
              </span>
              <p className="text-xl font-black text-uplivo-text mt-0.5">
                {user.totalSolved ?? 0}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-uplivo-text-muted">
                Overall Rank
              </span>
              <p className="text-xl font-black text-uplivo-primary-light mt-0.5">
                {user.overallRank ? `#${user.overallRank}` : 'Unranked'}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-uplivo-text-muted">
                Today's Solved
              </span>
              <p className="text-xl font-black text-emerald-400 mt-0.5">
                {user.todaySolved ?? 0}
              </p>
            </div>
          </div>

          {/* Profile Details (View Mode vs Edit Mode) */}
          {!isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Email (Private to self only) */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-uplivo-surface/40 border border-uplivo-border">
                  <Mail className="w-5 h-5 text-uplivo-text-muted shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-uplivo-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <span>Email Address</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-uplivo-accent" />
                    </span>
                    <p className="text-sm font-medium text-uplivo-text mt-0.5">
                      {user.email || 'Not specified'}
                    </p>
                    <span className="text-[10px] text-uplivo-accent font-medium">
                      Private — only visible to you
                    </span>
                  </div>
                </div>

                {/* Academic Year */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-uplivo-surface/40 border border-uplivo-border">
                  <Calendar className="w-5 h-5 text-uplivo-text-muted shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-uplivo-text-muted uppercase tracking-wider">
                      Academic Year
                    </span>
                    <p className="text-sm font-medium text-uplivo-text mt-0.5">
                      {user.academicYear}
                    </p>
                  </div>
                </div>

                {/* College Name */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-uplivo-surface/40 border border-uplivo-border">
                  <School className="w-5 h-5 text-uplivo-text-muted shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-uplivo-text-muted uppercase tracking-wider">
                      College
                    </span>
                    <p className="text-sm font-medium text-uplivo-text mt-0.5">
                      {user.collegeName}
                    </p>
                  </div>
                </div>

                {/* Course */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-uplivo-surface/40 border border-uplivo-border">
                  <GraduationCap className="w-5 h-5 text-uplivo-text-muted shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-uplivo-text-muted uppercase tracking-wider">
                      Course / Degree
                    </span>
                    <p className="text-sm font-medium text-uplivo-text mt-0.5">
                      {user.course}
                    </p>
                  </div>
                </div>

                {/* LinkedIn Link */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-uplivo-surface/40 border border-uplivo-border">
                  <Linkedin className="w-5 h-5 text-[#0077b5] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-uplivo-text-muted uppercase tracking-wider">
                      LinkedIn Profile
                    </span>
                    <div className="mt-0.5 truncate">
                      {user.linkedinUrl ? (
                        <a
                          href={user.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-uplivo-primary-light hover:underline inline-flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{user.linkedinUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-sm text-uplivo-text-muted">Not linked</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* LeetCode Link */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-uplivo-surface/40 border border-uplivo-border">
                  <Code2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-uplivo-text-muted uppercase tracking-wider">
                      LeetCode Profile
                    </span>
                    <div className="mt-0.5 truncate">
                      {user.leetcodeUrl ? (
                        <a
                          href={user.leetcodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-amber-400 hover:underline inline-flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{user.leetcodeUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-sm text-uplivo-text-muted">Not linked</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Form */
            <form onSubmit={handleSave} className="space-y-5 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Full Name"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  error={fieldErrors.fullName}
                />

                <div>
                  <label className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider mb-1.5">
                    Academic Year <span className="text-uplivo-primary">*</span>
                  </label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className="w-full bg-uplivo-surface text-uplivo-text text-sm rounded-lg border border-uplivo-border px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-uplivo-primary"
                  >
                    {ACADEMIC_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="College Name"
                  name="collegeName"
                  required
                  value={formData.collegeName}
                  onChange={handleChange}
                  error={fieldErrors.collegeName}
                />

                <Input
                  label="Course / Degree"
                  name="course"
                  required
                  value={formData.course}
                  onChange={handleChange}
                  error={fieldErrors.course}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="LinkedIn Profile URL"
                  name="linkedinUrl"
                  type="url"
                  required
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  error={fieldErrors.linkedinUrl}
                />

                <Input
                  label="LeetCode Profile URL"
                  name="leetcodeUrl"
                  type="url"
                  required
                  value={formData.leetcodeUrl}
                  onChange={handleChange}
                  error={fieldErrors.leetcodeUrl}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-uplivo-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                  icon={<Save className="w-4 h-4" />}
                >
                  Save Profile
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};
