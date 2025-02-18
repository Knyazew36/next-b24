export interface IWorkGroup {
  ID: string;
  SITE_ID: string;
  NAME: string;
  DESCRIPTION: string;
  DATE_CREATE: string;
  DATE_UPDATE: string;
  ACTIVE: 'Y' | 'N';
  VISIBLE: 'Y' | 'N';
  OPENED: 'Y' | 'N';
  CLOSED: 'Y' | 'N';
  SUBJECT_ID: string;
  OWNER_ID: string;
  KEYWORDS: string;
  NUMBER_OF_MEMBERS: string;
  DATE_ACTIVITY: string;
  SUBJECT_NAME: string;
  IMAGE: string;
  IS_EXTRANET: 'Y' | 'N';
}
