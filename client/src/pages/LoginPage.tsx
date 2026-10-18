import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
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
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setApiError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-uplivo-bg text-uplivo-text flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-6">
          <img src="/uplivo-logo.svg" alt="ALPHA++" className="w-10 h-10 rounded-xl" />
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-uplivo-primary to-uplivo-accent bg-clip-text text-transparent">
            ALPHA++
          </span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-uplivo-text">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-uplivo-text-secondary">
          Welcome back! Access your coding stats and community
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-uplivo-card border border-uplivo-border py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {apiError && (
            <div className="mb-6 p-4 rounded-xl bg-uplivo-error/15 border border-uplivo-error/30 text-uplivo-error flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{apiError}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full text-base py-3"
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-uplivo-text-secondary">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-uplivo-primary-light hover:underline">
              Create a profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
