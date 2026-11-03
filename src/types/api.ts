// Contracts mirrored from the Spring Boot API DTOs (com.jovensbuzz.*.dto).

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
  timestamp?: string;
}

export interface Paged<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ServiceItem {
  id?: number;
  title: string;
  slug: string;
  description: string;
  icon?: string | null;
  displayOrder: number;
  published: boolean;
}

export interface FaqItem {
  id?: number;
  question: string;
  answer: string;
  displayOrder: number;
  published: boolean;
}

export type SiteContent = Record<string, string>;

export interface SiteContentEntry {
  id?: number;
  contentKey: string;
  contentValue: string;
  contentType: "TEXT" | "LONG_TEXT" | "URL" | "EMAIL" | "PHONE";
  label: string;
  group: string;
  maxLength: number;
  required: boolean;
  updatedBy?: string | null;
  updatedAt?: string | null;
}

export const ENQUIRY_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED", "SPAM"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export type SyncStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "RETRYING" | "NOT_QUEUED" | "UNKNOWN";

export interface EnquirySummary {
  id: number;
  publicReference: string;
  fullName: string;
  email: string;
  phone?: string | null;
  phoneCountry?: string | null;
  companyName?: string | null;
  serviceInterest: string;
  budget?: string | null;
  message?: string | null;
  status: EnquiryStatus;
  source: string;
  createdAt: string;
  syncStatus: SyncStatus;
  assignedAdminId?: number | null;
  assignedAdminName?: string | null;
}

export interface EnquiryNote {
  id: number;
  adminUsername?: string | null;
  adminDisplayName?: string | null;
  note: string;
  createdAt: string;
}

export interface StatusHistoryEntry {
  id: number;
  changedBy: string;
  previousStatus?: string | null;
  newStatus: string;
  changedAt: string;
}

export interface EnquiryDetail extends EnquirySummary {
  privacyConsent: boolean;
  privacyPolicyVersion?: string | null;
  updatedAt: string;
  syncAttemptCount: number;
  syncLastError?: string | null;
  syncNextRetryAt?: string | null;
  syncUpdatedAt?: string | null;
  notes: EnquiryNote[];
  statusHistory: StatusHistoryEntry[];
}

export interface DashboardSummary {
  totalEnquiries: number;
  newEnquiries: number;
  contactedEnquiries: number;
  qualifiedLeads: number;
  convertedLeads: number;
  closedEnquiries: number;
  spamEnquiries: number;
  enquiriesToday: number;
  enquiriesThisMonth: number;
  conversionRate: number;
  syncFailed: number;
  syncPending: number;
  recentEnquiries: EnquirySummary[];
}

export interface TrendPoint {
  label: string;
  date: string;
  count: number;
}

export interface ServiceDistribution {
  service: string;
  count: number;
  percentage: number;
}

export interface StatusDistribution {
  status: EnquiryStatus;
  count: number;
  percentage: number;
}

export interface AdminProfile {
  id: number;
  username: string;
  displayName: string;
  email: string;
  role: string;
  createdAt?: string;
  lastLoginAt?: string | null;
  passwordChangedAt?: string | null;
  /** OWNER or MANAGER */
  adminRole: AdminRoleName;
  /** Effective permissions (an owner holds all of them) */
  permissions: AdminPermission[];
  /** IANA zone used to display every date for this user, e.g. Asia/Kolkata */
  timezone: string;
}

export type AdminRoleName = "OWNER" | "MANAGER";

export type AdminPermission =
  | "ENQUIRIES_VIEW"
  | "ENQUIRIES_MANAGE"
  | "ENQUIRIES_IMPORT"
  | "ENQUIRIES_EXPORT"
  | "ENQUIRIES_DELETE"
  | "ANALYTICS_VIEW"
  | "CONTENT_MANAGE"
  | "SETTINGS_VIEW"
  | "AUDIT_VIEW"
  | "USERS_MANAGE";

/** An account in User Management (never includes password data). */
export interface ManagedAdminUser {
  id: number;
  username: string;
  displayName: string;
  email: string;
  role: AdminRoleName;
  permissions: AdminPermission[];
  timezone: string;
  enabled: boolean;
  locked: boolean;
  /** When the password was last set (never the password itself) */
  passwordChangedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimeZoneOption {
  id: string;
  label: string;
}

export interface UserManagementOptions {
  roles: AdminRoleName[];
  permissions: { id: AdminPermission; label: string }[];
  managerDefaults: AdminPermission[];
  timezones: TimeZoneOption[];
}

export interface ImportRowValues {
  rowNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  status: string;
  submittedAt: string;
}

export interface ImportRowResult {
  rowNumber: number;
  values: ImportRowValues;
  state: "VALID" | "INVALID" | "DUPLICATE";
  errors: string[];
  duplicateOf?: string | null;
}

export interface ImportPreview {
  filename: string;
  timezone: string;
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  rows: ImportRowResult[];
}

export interface ImportSummary {
  imported: number;
  skipped: number;
  addedToGoogleSheets: boolean;
  timezone: string;
  references: string[];
}

export interface DeletedEnquiry {
  id: number;
  publicReference: string;
  fullName: string;
  email: string;
  serviceInterest: string;
  status: string;
  createdAt: string;
  deletedAt: string;
  deletedBy?: string | null;
}

export interface AdminSummary {
  id: number;
  username: string;
  displayName: string;
}

export interface LoginResult {
  token: string;
  username: string;
  displayName: string;
  email: string;
  role: string;
  expiresAt: string;
}

export interface IntegrationStatus {
  configured: boolean;
  spreadsheetIdSet: boolean;
  spreadsheetIdHint?: string | null;
  worksheetName: string;
  credentialsFileReadable: boolean;
  serviceAccountEmail?: string | null;
  pending: number;
  processing: number;
  retrying: number;
  failed: number;
  succeeded: number;
}

export interface AuditLogEntry {
  id: number;
  adminUsername: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  safeMetadata?: string | null;
  createdAt: string;
}

export interface EnquiryReceipt {
  publicReference: string;
  submittedAt: string;
  duplicate: boolean;
}

export type EmailNotificationStatus = "PENDING" | "PROCESSING" | "SENT" | "FAILED";

export interface EmailNotification {
  id: number;
  notificationType: "ADMIN_ENQUIRY_NOTIFICATION" | "CLIENT_ENQUIRY_CONFIRMATION";
  recipientEmail?: string | null;
  subject: string;
  status: EmailNotificationStatus;
  attemptCount: number;
  lastError?: string | null;
  nextRetryAt?: string | null;
  sentAt?: string | null;
  updatedAt?: string | null;
}

export interface EmailNotificationOverview {
  smtpConfigured: boolean;
  adminRecipientConfigured: boolean;
  notifications: EmailNotification[];
}

export interface EmailIntegrationStatus {
  smtpConfigured: boolean;
  smtpEnabled: boolean;
  disabledReason?: string | null;
  smtpHost?: string | null;
  smtpPort?: number;
  smtpUsername?: string | null;
  smtpPasswordSet: boolean;
  fromEmail?: string | null;
  fromName?: string | null;
  adminNotificationEmail?: string | null;
  clientSupportEmail?: string | null;
  responseTime: string;
  pending: number;
  sent: number;
  failed: number;
}
