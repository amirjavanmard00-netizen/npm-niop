export interface RegionNews {
  id: string;
  name: string;
  newsCount7Days: number;
  topStory: string;
  publishDate: string;
  importance: number; // 1 - 10
  status: 'active_24h' | 'active_7d' | 'moderate' | 'low_activity' | 'no_recent';
  category: 'supply' | 'anti_smuggling' | 'smart_card' | 'cng_clean' | 'hse_safety' | 'infrastructure' | 'logistics';
  link: string;
  summary: string;
  keyDetails: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  catchyTitle: string;
  summary: string;
  importanceScore: number; // 1-10
  appealScore: number; // 1-10
  viralProbability: number; // 1-100
  category: 'policy' | 'crisis_management' | 'technology' | 'anti_smuggling' | 'logistics' | 'cng_clean' | 'aviation' | 'infrastructure';
  isOfficial: boolean;
  isBreaking?: boolean;
  timeAgo: string;
  source: string;
  sourceUrl: string;
  impactOnPeople: string;
  impactOnIndustry: string;
  stats?: string;
  tags: string[];
  fullPackage?: ContentPackage27;
}

export interface ContentPackage27 {
  mainTitle: string; // 1
  catchyTitle: string; // 2
  summary: string; // 3
  importantDetails: string[]; // 4
  importanceReason: string; // 5
  impactOnPeople: string; // 6
  impactOnOilIndustry: string; // 7
  importanceScore: number; // 8
  mediaAppealScore: number; // 9
  viralProbability: number; // 10
  targetAudience: string; // 11
  bestPublishTime: string; // 12
  seoTitle: string; // 13
  metaDescription: string; // 14
  seoKeywords: string[]; // 15
  websiteFullText: string; // 16
  telegramText: string; // 17
  instagramText: string; // 18
  linkedinText: string; // 19
  twitterText: string; // 20
  suggestedHeroImage: string; // 21
  suggestedInfographic: string; // 22
  suggestedShortVideo: string; // 23
  persianHashtags: string[]; // 24
  englishHashtags: string[]; // 25
  primarySourceLink: string; // 26
  otherSourcesLinks: string[]; // 27
}

export interface RewriteResult {
  superTitle?: string;
  title: string;
  lead: string;
  body: string;
  socialSummary: string;
  hashtags: string[];
}

export interface OfficialAlert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  actionRequired: string;
}

export interface PRCampaignSuggestion {
  id: string;
  title: string;
  theme: string;
  objective: string;
  targetChannels: string[];
  suggestedTag: string;
  expectedOutcome: string;
}

export interface VideoSuggestion {
  id: string;
  title: string;
  duration: string;
  type: 'motion_graphic' | 'documentary' | 'interview' | 'educational_reel';
  hook: string;
  summaryScript: string;
}

export interface DbArticle {
  id: string;
  title: string;
  originalTitle?: string;
  url: string;
  canonicalUrl: string;
  sourceId: string;
  regionId?: string;
  author?: string;
  publishedAt: string;
  discoveredAt: string;
  content: string;
  summary: string;
  imageUrl?: string;
  language: string;
  hash: string;
  status: string;
  isSeed: boolean;
  eventId?: string;
  source?: {
    id: string;
    name: string;
    category: string;
    reliability: number;
  };
  region?: {
    id: string;
    name: string;
    code: string;
  };
  analysis?: {
    importanceScore: number;
    mediaValueScore: number;
    publicInterestScore: number;
    crisisScore: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    topics: string;
    entities: string;
    keywords: string;
    summary: string;
    isRumorPotential?: boolean;
  };
  event?: {
    id: string;
    title: string;
    importanceScore: number;
  };
}

export interface DbSource {
  id: string;
  regionId?: string;
  name: string;
  url?: string;
  rssUrl?: string;
  type: string;
  enabled: boolean;
  priority: number;
  category: string;
  status: 'healthy' | 'slow' | 'warning' | 'error' | 'disabled';
  lastFetchedAt?: string;
  lastSuccessAt?: string;
  lastErrorAt?: string;
  articleCount: number;
  reliability: number;
  httpStatus?: number;
  responseTimeMs?: number;
  lastErrorMessage?: string;
  _count?: {
    articles: number;
  };
}

export interface DbStats {
  totalArticles: number;
  realArticles: number;
  seedArticles: number;
  articlesLast24h: number;
  activeSources: number;
  healthySources: number;
  totalRegions: number;
  activeEvents: number;
  totalRumors: number;
  urgentRumors: number;
  sentiments: {
    positive: number;
    neutral: number;
    negative: number;
  };
  scheduler: {
    isActive: boolean;
    isRunning: boolean;
    intervalMinutes: number;
    lastRunTime?: string;
  };
}

