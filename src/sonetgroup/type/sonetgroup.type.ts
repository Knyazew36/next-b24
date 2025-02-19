export interface ISonetGroup {
  ID: number;
  ACTIVE: 'Y' | 'N';
  SUBJECT_ID: string;
  SUBJECT_DATA: Record<string, any>;
  NAME: string;
  DESCRIPTION?: string;
  KEYWORDS?: string;
  CLOSED: 'Y' | 'N';
  VISIBLE: 'Y' | 'N';
  OPENED: 'Y' | 'N';
  PROJECT: 'Y' | 'N';
  LANDING: 'Y' | 'N';
  DATE_CREATE: string; // ISO format
  DATE_UPDATE?: string; // ISO format
  DATE_ACTIVITY?: string; // ISO format
  IMAGE_ID?: number;
  AVATAR?: string;
  AVATAR_TYPES?: Record<string, any>;
  AVATAR_TYPE?: 'folder' | 'checks' | 'pie' | 'bag' | 'members';
  OWNER_ID: number;
  OWNER_DATA: Record<string, any>;
  NUMBER_OF_MEMBERS: number;
  NUMBER_OF_MODERATORS: number;
  INITIATE_PERMS: 'A' | 'E' | 'K';
  PROJECT_DATE_START?: string; // ISO format
  PROJECT_DATE_FINISH?: string; // ISO format
  SCRUM_OWNER_ID?: number;
  SCRUM_MASTER_ID?: number;
  SCRUM_SPRINT_DURATION?: number; // in seconds
  SCRUM_TASK_RESPONSIBLE?: 'A' | 'M';
  TAGS?: string[];
  ACTIONS?: Record<string, any>;
  USER_DATA?: Record<string, any>;
}
