import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code,
  CheckCircle2,
  Trophy,
  Award,
  BookOpen,
  FlaskConical,
  Calendar,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { DashboardData } from '../types';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiFetch<any>('/dashboard');
        setData(res.data || res);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'there';

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-uplivo-card border border-uplivo-border rounded-xl text-center">
        <p className="text-uplivo-error font-medium mb-3">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm font-semibold text-uplivo-primary-light hover:underline"
        >
          Try reloading
        </button>
      </div>
    );
  }

  const stats = data?.stats || {
    todaySolved: user?.todaySolved || 0,
    totalSolved: user?.totalSolved || 0,
    todayRank: user?.todayRank ?? null,
    overallRank: user?.overallRank ?? null,
  };

  const recentActivity = data?.recentActivity || [];
  const latestAcademics = data?.latestAcademics || [];
  const latestResearch = data?.latestResearch || [];
  const upcomingEvents = data?.upcomingEvents || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-uplivo-text tracking-tight">
          Welcome back, {firstName}!
        </h1>
        <p className="text-sm text-uplivo-text-secondary mt-1">
          Here is your daily coding progress, rankings, and campus updates.
        </p>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Solved */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-uplivo-text-muted">
                Today's Solved
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-uplivo-text tracking-tight">
                  {stats.todaySolved}
                </span>
                <span className="text-xs text-uplivo-text-secondary font-medium">problems</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-uplivo-primary/10 border border-uplivo-primary/20 flex items-center justify-center text-uplivo-primary-light">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Solved */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-uplivo-text-muted">
                Total Solved
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-uplivo-text tracking-tight">
                  {stats.totalSolved}
                </span>
                <span className="text-xs text-uplivo-text-secondary font-medium">problems</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-uplivo-accent/10 border border-uplivo-accent/20 flex items-center justify-center text-uplivo-accent">
              <Code className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Today's Rank */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-uplivo-text-muted">
                Today's Rank
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-uplivo-text tracking-tight">
                  {stats.todayRank ? `#${stats.todayRank}` : '—'}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Overall Rank */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-uplivo-text-muted">
                Overall Rank
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-uplivo-text tracking-tight">
                  {stats.overallRank ? `#${stats.overallRank}` : '—'}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Chart (Last 7 Days) */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-uplivo-primary-light" />
              <span>Recent Activity (Last 7 Days)</span>
            </div>
          }
          subtitle="Number of verified LeetCode problems solved per day"
          action={
            <Link
              to="/progress"
              className="text-xs font-semibold text-uplivo-primary-light hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <CardContent>
          {recentActivity.length === 0 ? (
            <EmptyState
              title="No recent activity recorded"
              description="Solve LeetCode problems to start tracking your daily progress chart."
            />
          ) : (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3d" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#9898a8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#2d2d3d' }}
                  />
                  <YAxis
                    stroke="#9898a8"
                    fontSize={12}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={{ stroke: '#2d2d3d' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a24',
                      borderColor: '#2d2d3d',
                      borderRadius: '0.75rem',
                      color: '#e8e8ed',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    }}
                    cursor={{ fill: 'rgba(124, 92, 252, 0.08)' }}
                    formatter={(val: any) => [`${val} solved`, 'Problems']}
                  />
                  <Bar
                    dataKey="count"
                    fill="#7c5cfc"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid for Academic Resources, Research, Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Academic Resources (3 items) */}
        <Card className="flex flex-col">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-uplivo-accent" />
                <span className="text-base font-bold">Academic Resources</span>
              </div>
            }
            action={
              <Link
                to="/academics"
                className="text-xs font-medium text-uplivo-primary-light hover:underline"
              >
                View all
              </Link>
            }
          />
          <CardContent className="flex-1 p-4 space-y-3">
            {latestAcademics.length === 0 ? (
              <EmptyState
                title="No resources yet"
                description="Study materials shared by peers will show up here."
                className="py-6 border-none"
              />
            ) : (
              latestAcademics.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  to="/academics"
                  className="block p-3 rounded-lg bg-uplivo-surface hover:bg-uplivo-surface/70 border border-uplivo-border transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-semibold text-uplivo-text line-clamp-1">
                      {item.title}
                    </h4>
                    <Badge variant="secondary" size="sm">
                      {item.subject}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-uplivo-text-muted">
                    <span>By {item.uploaderName}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Latest Research (3 items) */}
        <Card className="flex flex-col">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-400" />
                <span className="text-base font-bold">Latest Research</span>
              </div>
            }
            action={
              <Link
                to="/research"
                className="text-xs font-medium text-uplivo-primary-light hover:underline"
              >
                View all
              </Link>
            }
          />
          <CardContent className="flex-1 p-4 space-y-3">
            {latestResearch.length === 0 ? (
              <EmptyState
                title="No research published"
                description="Student research and articles will appear here."
                className="py-6 border-none"
              />
            ) : (
              latestResearch.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  to={`/research/${item.id}`}
                  className="block p-3 rounded-lg bg-uplivo-surface hover:bg-uplivo-surface/70 border border-uplivo-border transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-semibold text-uplivo-text line-clamp-1">
                      {item.title}
                    </h4>
                    <Badge variant="primary" size="sm">
                      {item.category}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-uplivo-text-muted">
                    <span>By {item.authorName}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events (3 items) */}
        <Card className="flex flex-col">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-base font-bold">Upcoming Events</span>
              </div>
            }
            action={
              <Link
                to="/hackathons"
                className="text-xs font-medium text-uplivo-primary-light hover:underline"
              >
                View all
              </Link>
            }
          />
          <CardContent className="flex-1 p-4 space-y-3">
            {upcomingEvents.length === 0 ? (
              <EmptyState
                title="No events scheduled"
                description="Upcoming hackathons and contests will be displayed here."
                className="py-6 border-none"
              />
            ) : (
              upcomingEvents.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  to="/hackathons"
                  className="block p-3 rounded-lg bg-uplivo-surface hover:bg-uplivo-surface/70 border border-uplivo-border transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-semibold text-uplivo-text line-clamp-1">
                      {item.title}
                    </h4>
                    <Badge
                      variant={
                        item.mode === 'online'
                          ? 'accent'
                          : item.mode === 'hybrid'
                          ? 'primary'
                          : 'secondary'
                      }
                      size="sm"
                    >
                      {item.mode}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-uplivo-text-muted">
                    <span>{item.organizer}</span>
                    <span>{new Date(item.startDate).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
