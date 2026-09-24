import bcrypt from 'bcryptjs';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: 'USER' | 'ADMIN' | 'RESPONDER';
  avatarUrl?: string;
  bloodGroup?: string;
  address?: string;
  medicalConditions?: string;
  emergencyContacts: {
    id: string;
    name: string;
    phone: string;
    relationship: string;
    notifyOnSOS: boolean;
  }[];
  refreshToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredSOSAlert {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  status: 'COUNTDOWN' | 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address: string;
  };
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

export interface StoredReport {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  category: string;
  description: string;
  imageUrl?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  adminNotes?: string;
  upvotesCount: number;
  upvotedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredCommunityPost {
  id: string;
  userId: string;
  authorName: string;
  authorRole: 'USER' | 'ADMIN' | 'RESPONDER';
  title: string;
  content: string;
  category: 'SAFETY_TIP' | 'ALERT' | 'UPDATE' | 'COMMUNITY_WATCH';
  locationName?: string;
  upvotes: number;
  upvotedBy: string[];
  comments: {
    id: string;
    postId: string;
    userId: string;
    authorName: string;
    content: string;
    createdAt: string;
  }[];
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoredNotification {
  id: string;
  userId: string;
  type: 'SOS_ALERT' | 'REPORT_STATUS_CHANGED' | 'COMMUNITY_MENTION' | 'SAFETY_WARNING' | 'SYSTEM_ANNOUNCEMENT';
  title: string;
  message: string;
  linkUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface StoredSettings {
  userId: string;
  sosCountdownDurationSeconds: number;
  sirenAudioEnabled: boolean;
  autoShareLocationOnSOS: boolean;
  smsAlertsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  shakeToSOSGestureEnabled: boolean;
  voiceSOSEnabled?: boolean;
  voiceSOSKeyword?: string;
  voiceSOSSensitivity?: 'HIGH' | 'BALANCED' | 'LOW';
  voiceSOSPocketMode?: boolean;
  voiceSOSLanguage?: string;
  highContrastTheme: boolean;
  theme: 'light' | 'dark' | 'system';
}

class InMemDbStore {
  public users: StoredUser[] = [];
  public sosAlerts: StoredSOSAlert[] = [];
  public reports: StoredReport[] = [];
  public communityPosts: StoredCommunityPost[] = [];
  public notifications: StoredNotification[] = [];
  public settings: Map<string, StoredSettings> = new Map();
  public activityLogs: any[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const adminPassHash = bcrypt.hashSync('admin123', salt);
    const citizenPassHash = bcrypt.hashSync('citizen123', salt);

    const adminUser: StoredUser = {
      id: 'usr_admin_001',
      name: 'Dr. Anita Sharma (Safety Administrator)',
      email: 'admin@suraksha.gov.in',
      passwordHash: adminPassHash,
      phone: '+91 98765 43210',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      bloodGroup: 'O+',
      address: 'Central Command & Control Centre, New Delhi',
      medicalConditions: 'None',
      emergencyContacts: [
        {
          id: 'ec_adm_1',
          name: 'Delhi Police Control Room',
          phone: '112',
          relationship: 'Emergency Authority',
          notifyOnSOS: true,
        },
      ],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const citizenUser: StoredUser = {
      id: 'usr_citizen_001',
      name: 'Priya Verma',
      email: 'citizen@suraksha.in',
      passwordHash: citizenPassHash,
      phone: '+91 91234 56789',
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bloodGroup: 'B+',
      address: 'Sector 18, Block C, Noida, UP',
      medicalConditions: 'Asthma (Inhaler required)',
      emergencyContacts: [
        {
          id: 'ec_cit_1',
          name: 'Rajesh Verma (Father)',
          phone: '+91 98111 22334',
          relationship: 'Parent',
          notifyOnSOS: true,
        },
        {
          id: 'ec_cit_2',
          name: 'Sunita Verma (Mother)',
          phone: '+91 98222 33445',
          relationship: 'Parent',
          notifyOnSOS: true,
        },
        {
          id: 'ec_cit_3',
          name: 'National Emergency Helpline',
          phone: '112',
          relationship: 'Official Response',
          notifyOnSOS: true,
        },
      ],
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(adminUser, citizenUser);

    this.settings.set(citizenUser.id, {
      userId: citizenUser.id,
      sosCountdownDurationSeconds: 5,
      sirenAudioEnabled: true,
      autoShareLocationOnSOS: true,
      smsAlertsEnabled: true,
      pushNotificationsEnabled: true,
      shakeToSOSGestureEnabled: true,
      highContrastTheme: false,
      theme: 'system',
    });

    this.reports.push(
      {
        id: 'rep_001',
        userId: citizenUser.id,
        authorName: citizenUser.name,
        title: 'Non-functional Streetlights on Ring Road Service Lane',
        category: 'STREET_LIGHTING',
        description: 'Complete blackout between Metro Pillar 142 and 158. Dark stretch of 600m has caused safety hazards for late-evening pedestrians.',
        imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
        location: {
          latitude: 28.5355,
          longitude: 77.391,
          address: 'Outer Ring Road, Near Pillar 148, New Delhi',
        },
        status: 'IN_PROGRESS',
        adminNotes: 'Assigned to Municipal Corporation Electrical Division. Work order #MC-9921 generated.',
        upvotesCount: 14,
        upvotedBy: [citizenUser.id],
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'rep_002',
        userId: 'usr_other_02',
        authorName: 'Rohan Mehra',
        title: 'Broken CCTV Camera at Bus Terminal Exit',
        category: 'INFRASTRUCTURE_ISSUE',
        description: 'CCTV dome casing shattered and offline since Monday. High footfall transit gate with no active surveillance.',
        imageUrl: '',
        location: {
          latitude: 28.6139,
          longitude: 77.209,
          address: 'Interstate Bus Terminal, Platform Gate 3, Delhi',
        },
        status: 'SUBMITTED',
        adminNotes: 'Inspection scheduled for tomorrow morning.',
        upvotesCount: 8,
        upvotedBy: [],
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: 'rep_003',
        userId: 'usr_other_03',
        authorName: 'Meera Sen',
        title: 'Deserted Underpass with Loitering Groups',
        category: 'DESERTED_AREA',
        description: 'Pedestrian subway connecting commercial complex to metro station is unlit after 8 PM with frequent harassment incidents reported.',
        imageUrl: '',
        location: {
          latitude: 28.5708,
          longitude: 77.326,
          address: 'Subway #4, Botanical Garden Interchange',
        },
        status: 'UNDER_REVIEW',
        adminNotes: 'Police Beat Marshall patrol frequency increased between 8 PM - 11 PM.',
        upvotesCount: 29,
        upvotedBy: [citizenUser.id],
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      }
    );

    this.communityPosts.push(
      {
        id: 'post_001',
        userId: adminUser.id,
        authorName: 'Delhi Police Citizen Safety Wing',
        authorRole: 'ADMIN',
        title: 'New Pink Booth Operational at Hauz Khas Metro Station',
        content: 'All-women staffed police kiosk is now active 24/7 with direct distress response, first-aid support, and safe cab transit guidance.',
        category: 'UPDATE',
        locationName: 'Hauz Khas Metro Station, Gate 2',
        upvotes: 42,
        upvotedBy: [citizenUser.id],
        comments: [
          {
            id: 'cmt_001',
            postId: 'post_001',
            userId: citizenUser.id,
            authorName: 'Priya Verma',
            content: 'Great initiative! Used it yesterday night while returning from work. The officers were very vigilant.',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        isFlagged: false,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 'post_002',
        userId: citizenUser.id,
        authorName: 'Priya Verma',
        authorRole: 'USER',
        title: 'Safe Walking Route Tip: Use the Commercial Avenue instead of Service Road',
        content: 'If walking back towards Sector 18 after 9 PM, take the main Commercial Avenue. The shops remain open till 10:30 PM with active security guards and bright high-mast lights.',
        category: 'SAFETY_TIP',
        locationName: 'Sector 18 Market Corridor',
        upvotes: 19,
        upvotedBy: [],
        comments: [],
        isFlagged: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      }
    );

    this.notifications.push(
      {
        id: 'notif_001',
        userId: citizenUser.id,
        type: 'SYSTEM_ANNOUNCEMENT',
        title: 'Welcome to Suraksha SafeCity',
        message: 'Your emergency contacts have been linked. One-touch SOS and safety timer features are armed and ready.',
        linkUrl: '/profile',
        read: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'notif_002',
        userId: citizenUser.id,
        type: 'REPORT_STATUS_CHANGED',
        title: 'Report Update #MC-9921',
        message: 'Your report on "Non-functional Streetlights" is now marked IN_PROGRESS by the Municipal Authority.',
        linkUrl: '/reports',
        read: false,
        createdAt: new Date(Date.now() - 43200000).toISOString(),
      }
    );
  }
}

export const dbStore = new InMemDbStore();
