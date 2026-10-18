export interface User {
  id: string;
  fullName: string;
  email?: string;
  collegeName: string;
  course: string;
  academicYear: string;
  linkedinUrl: string;
  leetcodeUrl: string;
  totalSolved?: number;
  todaySolved?: number;
  overallRank?: number | null;
  todayRank?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardData {
  stats: {
    todaySolved: number;
    totalSolved: number;
    todayRank: number | null;
    overallRank: number | null;
  };
  recentActivity: {
    date: string;
    count: number;
  }[];
  latestAcademics: AcademicResource[];
  latestResearch: ResearchPaper[];
  upcomingEvents: HackathonEvent[];
}

export interface LeaderboardItem {
  id: string;
  rank: number;
  fullName: string;
  collegeName: string;
  leetcodeUrl: string;
  todaySolved?: number;
  totalSolved?: number;
  isCurrentUser?: boolean;
}

export interface ProgressData {
  syncStatus: {
    lastSyncTime: string | null;
    isSyncing?: boolean;
  };
  stats: {
    todaySolved: number;
    yesterdaySolved: number;
    totalSolved: number;
    currentStreak: number;
    bestDay: {
      date: string;
      count: number;
    } | null;
    avgActiveDay: number;
  };
  history: {
    date: string;
    count: number;
  }[];
  insights?: string[];
}

export interface AcademicResource {
  id: string;
  title: string;
  description: string;
  subject: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploaderName: string;
  uploaderId?: string;
  createdAt: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  content: string;
  category: string;
  referenceLinks: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
  commentsCount?: number;
}

export interface ResearchComment {
  id: string;
  paperId: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HackathonEvent {
  id: string;
  title: string;
  organizer: string;
  description: string;
  category?: string;
  mode: 'online' | 'offline' | 'hybrid';
  location?: string | null;
  startDate?: string;
  eventStartDate?: string;
  endDate?: string | null;
  eventEndDate?: string | null;
  registrationDeadline?: string | null;
  registerUrl?: string;
  registrationUrl?: string;
  creatorId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    fullName: string;
    collegeName: string;
  };
}

export interface PaginatedResponse<T> {
  data?: T[];
  items?: T[];
  results?: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
