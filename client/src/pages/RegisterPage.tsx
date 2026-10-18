import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, School, GraduationCap, Calendar, Linkedin, Code2, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const ACADEMIC_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
  'Other',
];

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    collegeName: '',
    course: '',
    academicYear: '1st Year',
    linkedinUrl: '',
    leetcodeUrl: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.collegeName.trim()) {
      errors.collegeName = 'College Name is required';
    }

    if (!formData.course.trim()) {
      errors.course = 'Course/Degree is required';
    }

    if (!formData.academicYear) {
      errors.academicYear = 'Please select your academic year';
    }

    const urlRegex = /^https?:\/\/.+/i;
    if (!formData.linkedinUrl.trim()) {
      errors.linkedinUrl = 'LinkedIn Profile URL is required';
    } else if (!urlRegex.test(formData.linkedinUrl.trim()) || !formData.linkedinUrl.toLowerCase().includes('linkedin.com')) {
      errors.linkedinUrl = 'Must be a valid LinkedIn URL (e.g. https://linkedin.com/in/username)';
    }

    if (!formData.leetcodeUrl.trim()) {
      errors.leetcodeUrl = 'LeetCode Profile URL is required';
    } else if (!urlRegex.test(formData.leetcodeUrl.trim()) || !formData.leetcodeUrl.toLowerCase().includes('leetcode.com')) {
      errors.leetcodeUrl = 'Must be a valid LeetCode URL (e.g. https://leetcode.com/u/username)';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        collegeName: formData.collegeName.trim(),
        course: formData.course.trim(),
        academicYear: formData.academicYear,
        linkedinUrl: formData.linkedinUrl.trim(),
        leetcodeUrl: formData.leetcodeUrl.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setApiError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-uplivo-bg text-uplivo-text flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <Link to="/" className="flex items-center justify-center gap-3 mb-6">
          <img src="/uplivo-logo.svg" alt="ALPHA++" className="w-10 h-10 rounded-xl" />
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-uplivo-primary to-uplivo-accent bg-clip-text text-transparent">
            ALPHA++
          </span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-uplivo-text">
          Create your student profile
        </h2>
        <p className="mt-2 text-center text-sm text-uplivo-text-secondary">
          Join the platform to track verified coding progress and collaborate with peers
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-uplivo-card border border-uplivo-border py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {apiError && (
            <div className="mb-6 p-4 rounded-xl bg-uplivo-error/15 border border-uplivo-error/30 text-uplivo-error flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{apiError}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <Input
                label="Full Name"
                name="fullName"
                type="text"
                required
                placeholder="Alex Morgan"
                value={formData.fullName}
                onChange={handleChange}
                error={fieldErrors.fullName}
                icon={<User className="w-4 h-4" />}
              />

              {/* Email Address */}
              <Input
                label="Email Address"
                name="email"
                type="email"
                required
                placeholder="alex@college.edu"
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                icon={<Mail className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* College Name */}
              <Input
                label="College Name"
                name="collegeName"
                type="text"
                required
                placeholder="Stanford University"
                value={formData.collegeName}
                onChange={handleChange}
                error={fieldErrors.collegeName}
                icon={<School className="w-4 h-4" />}
              />

              {/* Course / Degree */}
              <Input
                label="Course / Degree"
                name="course"
                type="text"
                required
                placeholder="B.Tech Computer Science"
                value={formData.course}
                onChange={handleChange}
                error={fieldErrors.course}
                icon={<GraduationCap className="w-4 h-4" />}
              />
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider mb-1.5">
                Academic Year <span className="text-uplivo-primary">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-uplivo-text-muted">
                  <Calendar className="w-4 h-4" />
                </div>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  className="w-full bg-uplivo-surface text-uplivo-text text-sm rounded-lg border border-uplivo-border pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-uplivo-primary focus:border-transparent cursor-pointer"
                >
                  {ACADEMIC_YEARS.map((year) => (
                    <option key={year} value={year} className="bg-uplivo-surface text-uplivo-text">
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors.academicYear && (
                <p className="mt-1.5 text-xs text-uplivo-error">{fieldErrors.academicYear}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* LinkedIn URL */}
              <Input
                label="LinkedIn Profile URL"
                name="linkedinUrl"
                type="url"
                required
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedinUrl}
                onChange={handleChange}
                error={fieldErrors.linkedinUrl}
                icon={<Linkedin className="w-4 h-4" />}
              />

              {/* LeetCode URL */}
              <Input
                label="LeetCode Profile URL"
                name="leetcodeUrl"
                type="url"
                required
                placeholder="https://leetcode.com/u/username"
                value={formData.leetcodeUrl}
                onChange={handleChange}
                error={fieldErrors.leetcodeUrl}
                icon={<Code2 className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Password */}
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={fieldErrors.password}
                icon={<Lock className="w-4 h-4" />}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-uplivo-text transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {/* Confirm Password */}
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={fieldErrors.confirmPassword}
                icon={<Lock className="w-4 h-4" />}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="hover:text-uplivo-text transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full text-base py-3"
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-uplivo-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-uplivo-primary-light hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
