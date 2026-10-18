import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Trophy, Calendar, Users, Award, Search as SearchIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { LeaderboardItem } from '../types';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'today' | 'overall'>('today');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const kolkataDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        activeTab === 'today'
          ? `/leaderboard/today?page=${page}&limit=20&search=${encodeURIComponent(search)}`
          : `/leaderboard/overall?page=${page}&limit=20&search=${encodeURIComponent(search)}`;

      const res = await apiFetch<any>(endpoint);
      const list =
        res.leaderboard ||
        res.users ||
        (Array.isArray(res.data) ? res.data : []) ||
        res.items ||
        (Array.isArray(res) ? res : []);
      setItems(Array.isArray(list) ? list : []);
      setTotalPages(res.pagination?.totalPages || res.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, search]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleTabChange = (tab: 'today' | 'overall') => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-base border border-amber-500/40 shadow-sm shadow-amber-500/20">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-300/20 text-slate-200 font-extrabold text-base border border-slate-300/40">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 text-amber-600 font-extrabold text-base border border-amber-700/40">
          🥉
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center min-w-7 h-7 px-1.5 rounded-md bg-uplivo-surface text-uplivo-text-secondary text-xs font-bold border border-uplivo-border">
        #{rank}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-uplivo-text tracking-tight flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-400" />
            <span>Leaderboard</span>
          </h1>
          <p className="text-sm text-uplivo-text-secondary mt-1">
            Rankings verified via LeetCode daily problem stats
          </p>
        </div>

        {activeTab === 'today' && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-uplivo-surface border border-uplivo-border text-xs text-uplivo-text-secondary">
            <Calendar className="w-3.5 h-3.5 text-uplivo-primary-light" />
            <span>IST: {kolkataDate}</span>
          </div>
        )}
      </div>

      {/* Control Bar: Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-uplivo-surface p-1 rounded-xl border border-uplivo-border">
          <button
            type="button"
            onClick={() => handleTabChange('today')}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'today'
                ? 'bg-uplivo-primary text-white shadow-md shadow-uplivo-primary/25'
                : 'text-uplivo-text-secondary hover:text-uplivo-text'
            }`}
          >
            Today's Rankings
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('overall')}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'overall'
                ? 'bg-uplivo-primary text-white shadow-md shadow-uplivo-primary/25'
                : 'text-uplivo-text-secondary hover:text-uplivo-text'
            }`}
          >
            Overall Leaderboard
          </button>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search student or college..."
          />
        </div>
      </div>

      {/* Table Card */}
      <Card>
        {loading ? (
          <div className="py-24 flex justify-center">
            <LoadingSpinner size="lg" label="Updating rankings..." />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-uplivo-error">
            <p className="font-semibold mb-2">{error}</p>
            <button
              onClick={() => fetchLeaderboard()}
              className="text-xs text-uplivo-primary-light underline"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title={activeTab === 'today' ? 'No coding data for today yet' : 'No students found'}
            description={
              search
                ? `No results matching "${search}". Try searching for another name or college.`
                : activeTab === 'today'
                ? 'Be the first to solve a problem today and lead the leaderboard!'
                : 'No registered student coding profiles yet.'
            }
            className="py-16 border-none"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-uplivo-border/70 bg-uplivo-surface/40 text-xs font-bold uppercase tracking-wider text-uplivo-text-muted">
                  <th className="py-4 px-5 w-20 text-center">Rank</th>
                  <th className="py-4 px-5">Student</th>
                  <th className="py-4 px-5 hidden sm:table-cell">College</th>
                  <th className="py-4 px-5">LeetCode Profile</th>
                  <th className="py-4 px-5 text-right">
                    {activeTab === 'today' ? 'Solved Today' : 'Total Solved'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-uplivo-border/40 text-sm">
                {items.map((item, idx) => {
                  const isCurrent =
                    item.isCurrentUser ||
                    item.id === user?.id ||
                    (user?.leetcodeUrl && item.leetcodeUrl === user.leetcodeUrl);

                  const rank = item.rank || (page - 1) * 20 + idx + 1;
                  const solvedCount =
                    activeTab === 'today'
                      ? item.todaySolved ?? (item as any).solvedToday ?? 0
                      : item.totalSolved ?? 0;

                  return (
                    <tr
                      key={item.id || idx}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-uplivo-primary/10 border-l-4 border-uplivo-primary hover:bg-uplivo-primary/15'
                          : 'hover:bg-uplivo-surface/40'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-4 px-5 text-center font-bold">
                        {renderRankBadge(rank)}
                      </td>

                      {/* Student */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-uplivo-card border border-uplivo-border flex items-center justify-center text-xs font-bold text-uplivo-text-secondary shrink-0">
                            {item.fullName ? item.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-uplivo-text flex items-center gap-1.5">
                              <span>{item.fullName}</span>
                              {isCurrent && (
                                <Badge variant="primary" size="sm">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-uplivo-text-muted sm:hidden">
                              {item.collegeName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* College */}
                      <td className="py-4 px-5 hidden sm:table-cell text-uplivo-text-secondary">
                        {item.collegeName}
                      </td>

                      {/* LeetCode Profile */}
                      <td className="py-4 px-5">
                        {item.leetcodeUrl ? (
                          <a
                            href={item.leetcodeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 hover:underline"
                          >
                            <span>LeetCode</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-uplivo-text-muted">—</span>
                        )}
                      </td>

                      {/* Solved Count */}
                      <td className="py-4 px-5 text-right">
                        <span className="font-extrabold text-base text-uplivo-text tracking-tight">
                          {solvedCount}
                        </span>
                        <span className="text-xs text-uplivo-text-muted ml-1">
                          {solvedCount === 1 ? 'problem' : 'problems'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-uplivo-border/60 flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
