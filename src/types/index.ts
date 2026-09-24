/**
 * Suraksha SafeCity - Core Application Domain Types
 * Unified contract across Frontend & Backend API
 */

export type UserRole = 'USER' | 'ADMIN' | 'RESPONDER' | 'SAFETY_ADMIN';

export interface EmergencyContact {
  id?: string;
  name: string;
  phone: string;
  relationship: string;
  notifyOnSOS: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  bloodGroup?: string;
  address?: string;
  medicalConditions?: string;
  emergencyContacts: EmergencyContact[];
  createdAt: string;
  updatedAt: string;
}

export type SOSStatus = 'COUNTDOWN' | 'ACTIVE' | 'RESOLVED' | 'CANCELLED';

export interface GeoLocationPoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  timestamp?: number;
}

export interface SOSAlert {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  status: SOSStatus;
  location: GeoLocationPoint;
  countdownSeconds: number;
  notifiedContacts: {
    name: string;
    phone: string;
    status: 'SENT' | 'SIMULATED_DEV_MODE' | 'FAILED';
  }[];
  activationSource: 'ONE_TOUCH_BUTTON' | 'SAFETY_TIMER_EXPIRED' | 'VOICE_TRIGGER' | 'SHAKE_GESTURE';
  audioRecordingUrl?: string;
  notes?: string;
  resolvedAt?: string;
  resolutionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportCategory =
  | 'STREET_LIGHTING'
  | 'HARASSMENT_HAZARD'
  | 'POOR_VISIBILITY'
  | 'DESERTED_AREA'
  | 'SUSPICIOUS_ACTIVITY'
  | 'INFRASTRUCTURE_ISSUE'
  | 'OTHER';

export type ReportStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface Report {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  category: ReportCategory;
  description: string;
  imageUrl?: string;
  location: GeoLocationPoint;
  status: ReportStatus;
  adminNotes?: string;
  upvotesCount: number;
  userHasUpvoted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SafeRouteOption {
  id: string;
  name: string;
  type: 'SAFEST_ROUTE' | 'FASTEST_ROUTE' | 'BALANCED_ROUTE';
  distanceKm: number;
  durationMinutes: number;
  safetyScore: number; // 0 - 100
  streetLightCoverage: number; // percentage
  policePatrolCoverage: number; // percentage
  cctvSurveillance: boolean;
  crowdDensityScore: 'HIGH' | 'MODERATE' | 'LOW';
  waypoints: [number, number][];
  warningAlerts?: string[];
  safeHavens: {
    name: string;
    type: 'POLICE_STATION' | 'HOSPITAL' | '24_7_STORE' | 'METRO_STATION';
    distanceMeters: number;
  }[];
}

export interface CommunityPost {
  id: string;
  userId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  title: string;
  content: string;
  category: 'SAFETY_TIP' | 'ALERT' | 'UPDATE' | 'COMMUNITY_WATCH';
  locationName?: string;
  upvotes: number;
  upvotedBy: string[];
  commentsCount: number;
  comments?: CommunityComment[];
  isFlagged?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export type NotificationType =
  | 'SOS_ALERT'
  | 'REPORT_STATUS_CHANGED'
  | 'COMMUNITY_MENTION'
  | 'SAFETY_WARNING'
  | 'SYSTEM_ANNOUNCEMENT';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface UserSettings {
  userId: string;
  sosCountdownDurationSeconds: number;
  sirenAudioEnabled: boolean;
  autoShareLocationOnSOS: boolean;
  smsAlertsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  shakeToSOSGestureEnabled: boolean;
  highContrastTheme: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface DecoyCallConfig {
  callerName: string;
  callerNumber: string;
  callerAvatar?: string;
  delaySeconds: number;
  voiceScriptType: 'PARENT' | 'POLICE' | 'CAB_DRIVER' | 'FRIEND';
}

export interface SafetyRadarMetric {
  overallScore: number; // 0-100
  zoneName: string;
  lightingGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  policeResponseTimeMinutes: number;
  activeCctvCount: number;
  nearbySafeHavensCount: number;
  recentIncidentsCount: number;
  safetyAdvice: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}
