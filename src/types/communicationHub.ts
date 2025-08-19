// Communication & Collaboration Hub Types
// Advanced messaging, video calls, screen sharing, whiteboarding, knowledge base

export interface CommunicationChannel {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: ChannelType;
  visibility: ChannelVisibility;
  members: ChannelMember[];
  settings: ChannelSettings;
  metadata: ChannelMetadata;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ChannelType = 
  | 'general' 
  | 'project' 
  | 'team' 
  | 'announcement' 
  | 'support' 
  | 'random' 
  | 'direct_message' 
  | 'group_message';

export type ChannelVisibility = 'public' | 'private' | 'restricted';

export interface ChannelMember {
  userId: string;
  role: ChannelRole;
  joinedAt: Date;
  lastRead?: Date;
  notificationSettings: ChannelNotificationSettings;
  permissions: ChannelPermission[];
}

export type ChannelRole = 'owner' | 'admin' | 'moderator' | 'member' | 'guest';

export interface ChannelNotificationSettings {
  mentions: boolean;
  allMessages: boolean;
  keywords: string[];
  schedule: NotificationSchedule;
}

export interface NotificationSchedule {
  enabled: boolean;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  days: string[];    // ['monday', 'tuesday', ...]
  timezone: string;
}

export type ChannelPermission = 
  | 'read_messages' 
  | 'send_messages' 
  | 'send_files' 
  | 'manage_messages' 
  | 'manage_members' 
  | 'manage_channel';

export interface ChannelSettings {
  allowGuests: boolean;
  requireApproval: boolean;
  messageRetention: MessageRetention;
  fileSharing: FileSharingSettings;
  integrations: ChannelIntegration[];
}

export interface MessageRetention {
  enabled: boolean;
  days: number;
  deleteAutomatically: boolean;
}

export interface FileSharingSettings {
  enabled: boolean;
  maxFileSize: number; // in MB
  allowedTypes: string[];
  virusScanning: boolean;
}

export interface ChannelIntegration {
  id: string;
  type: string;
  name: string;
  settings: Record<string, any>;
  isEnabled: boolean;
}

export interface ChannelMetadata {
  messageCount: number;
  memberCount: number;
  lastActivity: Date;
  tags: string[];
  pinnedMessages: string[];
}

// Messages and Conversations
export interface ChatMessage {
  id: string;
  channelId: string;
  parentId?: string; // For threaded replies
  authorId: string;
  content: MessageContent;
  type: MessageType;
  reactions: MessageReaction[];
  mentions: MessageMention[];
  status: MessageStatus;
  editHistory: MessageEdit[];
  metadata: MessageMetadata;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface MessageContent {
  text?: string;
  richText?: RichTextContent;
  attachments: MessageAttachment[];
  embeds: MessageEmbed[];
  poll?: MessagePoll;
}

export interface RichTextContent {
  blocks: RichTextBlock[];
  version: string;
}

export interface RichTextBlock {
  type: 'paragraph' | 'heading' | 'list' | 'quote' | 'code' | 'divider';
  content?: string;
  formatting?: TextFormatting;
  level?: number; // For headings, lists
  items?: string[]; // For lists
}

export interface TextFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  color?: string;
  backgroundColor?: string;
}

export type MessageType = 
  | 'text' 
  | 'file' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'system' 
  | 'bot' 
  | 'poll' 
  | 'call' 
  | 'screen_share';

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: AttachmentType;
  size: number; // in bytes
  mimeType: string;
  thumbnail?: string;
  metadata?: AttachmentMetadata;
}

export type AttachmentType = 'file' | 'image' | 'video' | 'audio' | 'document';

export interface AttachmentMetadata {
  width?: number;
  height?: number;
  duration?: number; // for video/audio in seconds
  pages?: number;    // for documents
}

export interface MessageEmbed {
  type: 'link' | 'quote' | 'media' | 'task' | 'calendar';
  title?: string;
  description?: string;
  url?: string;
  thumbnail?: string;
  fields?: EmbedField[];
  color?: string;
}

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface MessagePoll {
  id: string;
  question: string;
  options: PollOption[];
  settings: PollSettings;
  votes: PollVote[];
  status: 'active' | 'closed';
  closesAt?: Date;
}

export interface PollOption {
  id: string;
  text: string;
  color?: string;
}

export interface PollSettings {
  multipleChoice: boolean;
  anonymous: boolean;
  showResults: 'immediately' | 'after_vote' | 'after_close';
}

export interface PollVote {
  userId: string;
  optionIds: string[];
  votedAt: Date;
}

export interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface MessageMention {
  userId?: string;
  channelId?: string;
  type: 'user' | 'channel' | 'everyone' | 'here';
  startIndex: number;
  endIndex: number;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageEdit {
  content: MessageContent;
  editedBy: string;
  editedAt: Date;
  reason?: string;
}

export interface MessageMetadata {
  clientId?: string;
  source: 'web' | 'mobile' | 'api' | 'bot' | 'integration';
  ip?: string;
  userAgent?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  translation?: MessageTranslation;
}

export interface MessageTranslation {
  originalLanguage: string;
  translations: Record<string, string>; // language code -> translated text
  confidence: Record<string, number>;
}

// Video Calls and Screen Sharing
export interface VideoCall {
  id: string;
  channelId?: string;
  workspaceId: string;
  title?: string;
  type: CallType;
  status: CallStatus;
  participants: CallParticipant[];
  settings: CallSettings;
  recording?: CallRecording;
  schedule?: CallSchedule;
  metadata: CallMetadata;
  startedAt?: Date;
  endedAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export type CallType = 'audio' | 'video' | 'screen_share' | 'conference';
export type CallStatus = 'scheduled' | 'starting' | 'active' | 'ended' | 'cancelled';

export interface CallParticipant {
  userId: string;
  role: CallRole;
  status: ParticipantStatus;
  joinedAt?: Date;
  leftAt?: Date;
  settings: ParticipantSettings;
  stats: ParticipantStats;
}

export type CallRole = 'host' | 'co_host' | 'presenter' | 'participant';
export type ParticipantStatus = 'invited' | 'joining' | 'connected' | 'disconnected' | 'left';

export interface ParticipantSettings {
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharingEnabled: boolean;
  canRecord: boolean;
  canManageParticipants: boolean;
}

export interface ParticipantStats {
  connectionQuality: 'poor' | 'fair' | 'good' | 'excellent';
  audioQuality: number; // 0-100
  videoQuality: number; // 0-100
  latency: number; // milliseconds
  packetLoss: number; // percentage
}

export interface CallSettings {
  maxParticipants: number;
  requirePassword: boolean;
  password?: string;
  allowGuests: boolean;
  recordAutomatically: boolean;
  enableChat: boolean;
  enableScreenSharing: boolean;
  enableVirtualBackground: boolean;
  muteOnJoin: boolean;
  videoOnJoin: boolean;
}

export interface CallRecording {
  id: string;
  status: 'recording' | 'processing' | 'ready' | 'failed';
  url?: string;
  duration?: number; // seconds
  size?: number; // bytes
  startedAt: Date;
  endedAt?: Date;
  startedBy: string;
  settings: RecordingSettings;
}

export interface RecordingSettings {
  includeAudio: boolean;
  includeVideo: boolean;
  includeScreenShare: boolean;
  includeChat: boolean;
  quality: 'low' | 'medium' | 'high';
  format: 'mp4' | 'webm' | 'audio_only';
}

export interface CallSchedule {
  startTime: Date;
  endTime: Date;
  timezone: string;
  recurrence?: RecurrenceRule;
  reminder?: ReminderSettings;
}

export interface RecurrenceRule {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: string[];
  endDate?: Date;
  maxOccurrences?: number;
}

export interface ReminderSettings {
  enabled: boolean;
  minutes: number[];
  methods: ('email' | 'push' | 'sms')[];
}

export interface CallMetadata {
  totalDuration: number; // seconds
  peakParticipants: number;
  averageParticipants: number;
  networkStats: NetworkStats;
  qualityMetrics: QualityMetrics;
}

export interface NetworkStats {
  averageLatency: number;
  averagePacketLoss: number;
  bandwidthUsed: number; // bytes
  connectionIssues: number;
}

export interface QualityMetrics {
  overallRating: number; // 0-100
  audioQuality: number;
  videoQuality: number;
  userSatisfaction?: number; // Based on post-call feedback
}

// Whiteboarding and Collaboration Tools
export interface Whiteboard {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: WhiteboardType;
  canvas: WhiteboardCanvas;
  collaborators: WhiteboardCollaborator[];
  settings: WhiteboardSettings;
  history: WhiteboardAction[];
  metadata: WhiteboardMetadata;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WhiteboardType = 'freeform' | 'kanban' | 'flowchart' | 'mindmap' | 'wireframe';

export interface WhiteboardCanvas {
  width: number;
  height: number;
  backgroundColor: string;
  elements: WhiteboardElement[];
  layers: CanvasLayer[];
  viewport: Viewport;
}

export interface WhiteboardElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  style: ElementStyle;
  content?: ElementContent;
  locked: boolean;
  visible: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ElementType = 
  | 'text' 
  | 'shape' 
  | 'line' 
  | 'arrow' 
  | 'image' 
  | 'sticky_note' 
  | 'connector' 
  | 'group';

export interface Position {
  x: number;
  y: number;
  z?: number; // Layer depth
}

export interface Size {
  width: number;
  height: number;
}

export interface ElementStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  opacity?: number;
  borderRadius?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  shadow?: ShadowStyle;
}

export interface ShadowStyle {
  blur: number;
  offsetX: number;
  offsetY: number;
  color: string;
}

export interface ElementContent {
  text?: string;
  imageUrl?: string;
  links?: ElementLink[];
  metadata?: Record<string, any>;
}

export interface ElementLink {
  type: 'url' | 'task' | 'document' | 'user';
  target: string;
  label?: string;
}

export interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  elementIds: string[];
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
  rotation?: number;
}

export interface WhiteboardCollaborator {
  userId: string;
  role: CollaboratorRole;
  permissions: WhiteboardPermission[];
  cursor?: WhiteboardCursorPosition;
  selection?: string[]; // Selected element IDs
  lastActive: Date;
}

export type CollaboratorRole = 'owner' | 'editor' | 'commenter' | 'viewer';

export type WhiteboardPermission = 
  | 'view' 
  | 'edit' 
  | 'comment' 
  | 'share' 
  | 'export' 
  | 'manage';

export interface WhiteboardCursorPosition {
  x: number;
  y: number;
  color: string;
  label: string;
  lastUpdated: Date;
}

export interface WhiteboardSettings {
  isPublic: boolean;
  allowGuests: boolean;
  requireApproval: boolean;
  enableComments: boolean;
  enableVersionHistory: boolean;
  autoSave: boolean;
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export interface WhiteboardAction {
  id: string;
  type: WhiteboardActionType;
  userId: string;
  elementId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

export type WhiteboardActionType = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'move' 
  | 'resize' 
  | 'style' 
  | 'group' 
  | 'ungroup';

export interface WhiteboardMetadata {
  elementCount: number;
  collaboratorCount: number;
  lastModified: Date;
  version: string;
  tags: string[];
  exportFormats: string[];
}

// Knowledge Base and Documentation
export interface KnowledgeBase {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  structure: KBStructure;
  settings: KBSettings;
  permissions: KBPermission[];
  metadata: KBMetadata;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KBStructure {
  categories: KBCategory[];
  spaces: KBSpace[];
  tags: KBTag[];
}

export interface KBCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  order: number;
  articleCount: number;
}

export interface KBSpace {
  id: string;
  name: string;
  description?: string;
  type: SpaceType;
  visibility: SpaceVisibility;
  members: SpaceMember[];
  settings: SpaceSettings;
}

export type SpaceType = 'team' | 'project' | 'department' | 'public' | 'personal';
export type SpaceVisibility = 'public' | 'workspace' | 'restricted' | 'private';

export interface SpaceMember {
  userId: string;
  role: SpaceRole;
  permissions: SpacePermission[];
  joinedAt: Date;
}

export type SpaceRole = 'admin' | 'editor' | 'contributor' | 'reader';

export type SpacePermission = 
  | 'read' 
  | 'write' 
  | 'comment' 
  | 'share' 
  | 'manage' 
  | 'admin';

export interface SpaceSettings {
  allowComments: boolean;
  allowVersions: boolean;
  requireApproval: boolean;
  notifyOnChanges: boolean;
  defaultTemplate?: string;
}

export interface KBTag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  usageCount: number;
}

export interface KBArticle {
  id: string;
  knowledgeBaseId: string;
  spaceId?: string;
  categoryId?: string;
  title: string;
  content: ArticleContent;
  summary?: string;
  status: ArticleStatus;
  visibility: ArticleVisibility;
  tags: string[];
  attachments: string[];
  metadata: ArticleMetadata;
  versions: ArticleVersion[];
  comments: ArticleComment[];
  reactions: ArticleReaction[];
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ArticleContent {
  body: string;
  format: 'markdown' | 'html' | 'rich_text';
  tableOfContents?: TOCItem[];
  embeds?: ContentEmbed[];
}

export interface TOCItem {
  id: string;
  title: string;
  level: number;
  anchor: string;
  children?: TOCItem[];
}

export interface ContentEmbed {
  type: 'image' | 'video' | 'link' | 'code' | 'table' | 'chart';
  data: Record<string, any>;
  position?: number; // Character position in content
}

export type ArticleStatus = 'draft' | 'review' | 'published' | 'archived';
export type ArticleVisibility = 'public' | 'workspace' | 'space' | 'private';

export interface ArticleMetadata {
  readTime: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastReviewed?: Date;
  reviewedBy?: string;
  viewCount: number;
  helpfulVotes: number;
  unhelpfulVotes: number;
  searchKeywords: string[];
}

export interface ArticleVersion {
  id: string;
  version: string;
  title: string;
  content: ArticleContent;
  summary?: string;
  changes: string[];
  authorId: string;
  createdAt: Date;
  isPublished: boolean;
}

export interface ArticleComment {
  id: string;
  parentId?: string;
  authorId: string;
  content: string;
  status: CommentStatus;
  reactions: ArticleCommentReaction[];
  createdAt: Date;
  updatedAt?: Date;
}

export type CommentStatus = 'published' | 'pending' | 'spam' | 'deleted';

export interface ArticleCommentReaction {
  type: 'like' | 'dislike' | 'helpful' | 'outdated';
  userId: string;
  createdAt: Date;
}

export interface ArticleReaction {
  type: 'helpful' | 'unhelpful' | 'outdated' | 'excellent';
  userId: string;
  createdAt: Date;
}

export interface KBSettings {
  allowPublicAccess: boolean;
  requireRegistration: boolean;
  enableSearch: boolean;
  enableFeedback: boolean;
  enableVersioning: boolean;
  autoPublish: boolean;
  moderateComments: boolean;
  analytics: KBAnalytics;
}

export interface KBAnalytics {
  enabled: boolean;
  trackViews: boolean;
  trackSearches: boolean;
  trackFeedback: boolean;
  retentionDays: number;
}

export interface KBPermission {
  userId?: string;
  role?: string;
  permissions: string[];
  scope: 'global' | 'space' | 'category' | 'article';
  scopeId?: string;
}

export interface KBMetadata {
  articleCount: number;
  categoryCount: number;
  spaceCount: number;
  collaboratorCount: number;
  totalViews: number;
  averageRating: number;
  lastActivity: Date;
}

// Search and Discovery
export interface SearchQuery {
  query: string;
  filters: SearchFilter[];
  scope: SearchScope;
  sortBy: SearchSort;
  pagination: SearchPagination;
}

export interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between' | 'in';
  value: any;
}

export interface SearchScope {
  type: 'all' | 'messages' | 'files' | 'articles' | 'people' | 'channels';
  workspaceId?: string;
  channelIds?: string[];
  spaceIds?: string[];
  dateRange?: DateRange;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface SearchSort {
  field: 'relevance' | 'date' | 'title' | 'author';
  direction: 'asc' | 'desc';
}

export interface SearchPagination {
  page: number;
  limit: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  type: 'message' | 'file' | 'article' | 'person' | 'channel';
  title: string;
  snippet: string;
  url: string;
  score: number;
  metadata: SearchResultMetadata;
  highlights: SearchHighlight[];
}

export interface SearchResultMetadata {
  author?: string;
  authorAvatar?: string;
  channel?: string;
  space?: string;
  createdAt: Date;
  updatedAt?: Date;
  fileType?: string;
  fileSize?: number;
}

export interface SearchHighlight {
  field: string;
  fragments: string[];
}

export interface SearchResults {
  query: SearchQuery;
  total: number;
  results: SearchResult[];
  facets: SearchFacet[];
  suggestions: string[];
  executionTime: number; // milliseconds
}

export interface SearchFacet {
  field: string;
  buckets: FacetBucket[];
}

export interface FacetBucket {
  value: string;
  count: number;
  selected: boolean;
}
