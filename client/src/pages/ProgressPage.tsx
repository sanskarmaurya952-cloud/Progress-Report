import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Flame,
  CheckCircle,
  Clock,
  Sparkles,
  Trophy,
  Zap,
  Calendar,
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
import { apiFetch } from '../lib/api';
import { ProgressData } from '../types';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';

export const ProgressPage: React.FC = () => {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch<any>('/progress');
      setData(res.data || res);
    } catch (err: any) {
      setError(err.message || 'Failed to load progress analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await apiFetch<any>('/progress/sync', { method: 'POST' });
      setSyncMessage(res?.message || 'LeetCode progress synchronized successfully!');
      // Refresh data
      await fetchProgress();
    } catch (err: any) {
      setSyncMessage(err.message || 'Sync failed. Please verify your LeetCode profile URL.');
    } finally {
      setSyncing(false);
    }
  };

  // Compute dynamic text insights based on actual user data
  const generateInsights = (progress: ProgressData | null): string[] => {
    if (!progress) return [];
    if (progress.insights && progress.insights.length > 0) {
      return progress.insights;
    }

    const { stats, history } = progress;
    const generated: string[] = [];

    // Streak insight
    if (stats.currentStreak > 0) {
      generated.push(
        `Active Streak: You are currently on a ${stats.currentStreak}-day coding streak! Consistency compounds over time.`
      );
    } else {
      generated.push(
        `Consistency Tip: Solve at least 1 problem today to kickstart a brand new coding streak.`
      );
    }

    // Today vs Yesterday
    if (stats.todaySolved > stats.yesterdaySolved) {
      generated.push(
        `Upward Momentum: You solved ${stats.todaySolved} problems today, surpassing yesterday's total of ${stats.yesterdaySolved}.`
      );
    } else if (stats.todaySolved > 0) {
      generated.push(
        `Daily Goal Met: You've solved ${stats.todaySolved} problems today. Keep pushing to top the daily leaderboard.`
      );
    }

    // Best Day Record
    if (stats.bestDay && stats.bestDay.count > 0) {
      const bestDate = new Date(stats.bestDay.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      generated.push(
        `Personal Record: Your all-time best single day was ${stats.bestDay.count} problems solved on ${bestDate}.`
      );
    }

    // Active days analysis in the 30-day window
    if (history && history.length > 0) {
      const activeDays = history.filter((h) => h.count > 0).length;
      const totalDays = history.length;
      const activeRate = Math.round((activeDays / totalDays) * 100);
      generated.push(
        `30-Day Activity: You were active on ${activeDays} out of the last ${totalDays} days (${activeRate}% activity rate).`
      );
    }

    return generated;
  };

  if (loading && !data) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label="Analyzing progress..." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 bg-uplivo-card border border-uplivo-border rounded-xl text-center">
        <p className="text-uplivo-error font-medium mb-3">{error}</p>
        <Button variant="primary" size="sm" onClick={fetchProgress}>
          Try Again
        </Button>
      </div>
    );
  }

  const stats = data?.stats || {
    todaySolved: 0,
    yesterdaySolved: 0,
    totalSolved: 0,
    currentStreak: 0,
    bestDay: null,
    avgActiveDay: 0,
  };

  const history = data?.history || [];
  const lastSyncTime = data?.syncStatus?.lastSyncTime;
  const insights = generateInsights(data);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-uplivo-text tracking-tight flex items-center gap-2.5">
          <TrendingUp className="w-7 h-7 text-uplivo-primary-light" />
          <span>Progress & Analytics</span>
        </h1>
        <p className="text-sm text-uplivo-text-secondary mt-1">
          Detailed breakdown of your problem solving frequency, consistency streaks, and activity
        </p>
      </div>

      {/* Sync Status Banner */}
      <Card className="bg-gradient-to-r from-uplivo-card via-uplivo-surface to-uplivo-card border-uplivo-primary/30">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-uplivo-primary/20 border border-uplivo-primary/40 flex items-center justify-center text-uplivo-primary-light shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-uplivo-text">
                LeetCode Synchronization Status
              </p>
              <p className="text-xs text-uplivo-text-muted mt-0.5">
                Last synced:{' '}
                <span className="text-uplivo-text-secondary font-medium">
                  {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Never synced'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {syncMessage && (
              <span className="text-xs text-uplivo-accent font-medium hidden md:inline truncate max-w-xs">
                {syncMessage}
              </span>
            )}
            <Button
              variant="primary"
              size="sm"
              loading={syncing}
              onClick={handleSync}
              className="w-full sm:w-auto"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />}
            >
              Sync Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 6 Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Today's Solved */}
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-uplivo-text-muted block">
              Today
            </span>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-black text-uplivo-text">{stats.todaySolved}</span>
              <span className="text-[11px] text-uplivo-text-secondary">solved</span>
            </div>
          </CardContent>
        </Card>

        {/* Yesterday's Solved */}
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-uplivo-text-muted block">
              Yesterday
            </span>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-black text-uplivo-text">{stats.yesterdaySolved}</span>
              <span className="text-[11px] text-uplivo-text-secondary">solved</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Solved */}
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-uplivo-text-muted block">
              Total Solved
            </span>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-black text-uplivo-primary-light">
                {stats.totalSolved}
              </span>
              <span className="text-[11px] text-uplivo-text-secondary">all time</span>
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-uplivo-text-muted block flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Streak</span>
            </span>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-400">{stats.currentStreak}</span>
              <span className="text-[11px] text-uplivo-text-secondary">days</span>
            </div>
          </CardContent>
        </Card>

        {/* Best Day */}
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-uplivo-text-muted block flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-300" />
              <span>Best Day</span>
            </span>
            <div className="mt-1.5">
              <span className="text-2xl font-black text-uplivo-text">
                {stats.bestDay ? stats.bestDay.count : 0}
              </span>
              {stats.bestDay?.date && (
                <span className="block text-[10px] text-uplivo-text-muted truncate mt-0.5">
                  {new Date(stats.bestDay.date).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Avg / Active Day */}
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-uplivo-text-muted block flex items-center gap-1">
              <Zap className="w-3 h-3 text-uplivo-accent" />
              <span>Avg / Active</span>
            </span>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-black text-uplivo-accent">
                {typeof stats.avgActiveDay === 'number'
                  ? stats.avgActiveDay.toFixed(1)
                  : stats.avgActiveDay || '0'}
              </span>
              <span className="text-[11px] text-uplivo-text-secondary">probs</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Chart: Last 30 Days */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-uplivo-primary-light" />
              <span>Daily Activity (Last 30 Days)</span>
            </div>
          }
          subtitle="Number of solved problems recorded each day"
        />
        <CardContent>
          {history.length === 0 ? (
            <EmptyState
              title="No activity history available"
              description="Sync your LeetCode account to populate your 30-day activity timeline."
            />
          ) : (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3d" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#9898a8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#2d2d3d' }}
                    interval="preserveStartEnd"
                    angle={-30}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#9898a8"
                    fontSize={11}
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
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Insights Section */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-uplivo-accent" />
              <span>Personalized Progress Insights</span>
            </div>
          }
          subtitle="Computed based on your recent activity and consistency data"
        />
        <CardContent>
          {insights.length === 0 ? (
            <EmptyState
              title="No insights to display"
              description="Solve coding challenges regularly to unlock automated progress observations."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-uplivo-surface border border-uplivo-border flex items-start gap-3.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-uplivo-primary/20 border border-uplivo-primary/30 flex items-center justify-center text-uplivo-primary-light shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-uplivo-text-secondary leading-relaxed">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
