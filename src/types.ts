import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string;
  photoURL: string | null;
  streakCount: number;
  lastActivityDate: Timestamp | null;
  badges: string[];
  favorites: string[];
  contacts: string[];
}

export type HealthStatus = 'healthy' | 'needs_attention';

export interface CheckIn {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  timestamp: Timestamp;
  status: HealthStatus;
  read: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Contact {
  name: string;
  email: string;
  photoURL?: string;
}

export enum BadgeMilestone {
  STREAK_3 = '3-Day Vitality',
  STREAK_7 = '7-Day Vitality',
  STREAK_30 = '30-Day Vitality',
  STREAK_100 = '100-Day Vitality',
}
