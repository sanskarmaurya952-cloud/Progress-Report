import React from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  TrendingUp,
  BookOpen,
  FlaskConical,
  Calendar,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Trophy,
      title: 'Leaderboard Rankings',
      description:
        'Compete with peers based on verified LeetCode progress. Daily and overall rankings to push your boundaries.',
      gradient: 'from-amber-500/20 to-orange-500/10',
      iconColor: 'text-amber-400',
    },
    {
      icon: TrendingUp,
      title: 'Progress Analytics',
      description:
        'Track your coding streaks, daily activity, and personal growth over time with clear visual insights.',
      gradient: 'from-emerald-500/20 to-teal-500/10',
      iconColor: 'text-emerald-400',
    },
    {
      icon: BookOpen,
      title: 'Academic Resources',
      description:
        'Share and discover curated study materials, lecture notes, and academic documents across subjects.',
      gradient: 'from-blue-500/20 to-indigo-500/10',
      iconColor: 'text-blue-400',
    },
    {
      icon: FlaskConical,
      title: 'Research & Analysis',
      description:
        'Publish research summaries, get constructive feedback, and collaborate with peers in your domain.',
      gradient: 'from-purple-500/20 to-pink-500/10',
      iconColor: 'text-purple-400',
    },
    {
      icon: Calendar,
      title: 'Hackathons & Events',
      description:
        'Discover upcoming coding competitions, hackathons, workshops, and technical events tailored for students.',
      gradient: 'from-cyan-500/20 to-blue-500/10',
      iconColor: 'text-cyan-400',
    },
    {
      icon: Users,
      title: 'Student Profiles',
      description:
        'Build your professional profile with verified coding achievements, college credentials, and project portfolios.',
      gradient: 'from-violet-500/20 to-fuchsia-500/10',
      iconColor: 'text-violet-400',
    },
  ];

  return (
    <div className="min-h-screen bg-uplivo-bg text-uplivo-text flex flex-col selection:bg-uplivo-primary/30">
      {/* Navigation Header */}
      <header className="border-b border-uplivo-border/70 backdrop-blur-md sticky top-0 z-50 bg-uplivo-bg/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/uplivo-logo.svg" alt="ALPHA++ Logo" className="w-10 h-10 rounded-xl shadow-md" />
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-uplivo-primary via-uplivo-primary-light to-uplivo-accent bg-clip-text text-transparent">
                ALPHA++
              </span>
              <span className="text-[10px] tracking-widest text-uplivo-text-muted font-bold uppercase -mt-1">
                Progress Report
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="md">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="md">
                Create a Profile
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-36 overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-uplivo-primary/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[200px] bg-uplivo-accent/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-uplivo-surface border border-uplivo-border mb-8 shadow-inner">
            <Sparkles className="w-4 h-4 text-uplivo-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-uplivo-text-secondary">
              Student Progress Report & Collaboration Platform
            </span>
          </div>

          <div className="flex justify-center mb-6">
            <img
              src="/uplivo-logo.svg"
              alt="ALPHA++"
              className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-2xl hover:scale-105 transition-transform"
            />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
            <span className="bg-gradient-to-r from-uplivo-primary via-uplivo-primary-light to-uplivo-accent bg-clip-text text-transparent">
              ALPHA++
            </span>
          </h1>

          <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-uplivo-text mb-6 tracking-tight">
            Compete Today. Grow Every Day.
          </p>

          <p className="text-base sm:text-lg lg:text-xl text-uplivo-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Track your coding progress, compete on verified peer leaderboards, share academic
            resources, and build your engineering progress report with your community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-lg shadow-uplivo-primary/25">
                <span>Create a Profile</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 border-t border-uplivo-border/60 bg-uplivo-surface/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-uplivo-primary-light mb-3">
              Platform Features
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-uplivo-text tracking-tight">
              Everything you need to level up as a student engineer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-uplivo-card border border-uplivo-border hover:border-uplivo-primary/50 rounded-2xl p-7 transition-all duration-300 hover:shadow-xl hover:shadow-uplivo-primary/10 flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.gradient} border border-white/5`}
                    >
                      <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-uplivo-text mb-2.5 group-hover:text-uplivo-primary-light transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-uplivo-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-uplivo-border py-8 bg-uplivo-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <img src="/uplivo-logo.svg" alt="ALPHA++ Logo" className="w-6 h-6 rounded" />
            <span className="font-bold text-sm text-uplivo-text">ALPHA++</span>
          </div>
          <p className="text-xs text-uplivo-text-muted">
            &copy; 2026 ALPHA++. Progress Report. Compete Today. Grow Every Day.
          </p>
        </div>
      </footer>
    </div>
  );
};
