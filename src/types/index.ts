export type UserRole = "admin" | "editor" | "user";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  bio?: string;
  location?: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  roleRequest?: {
    requestedRole: UserRole;
    status: "pending" | "approved" | "rejected";
    requestedAt: string;
    message?: string;
  };
  createdAt: any;
}

export interface Category {
  id: string;
  nameNepali: string;
  nameEnglish: string;
  slug: string;
  order: number;
  homepageStyle?: "grid" | "featured_list" | "cards" | "alternating" | "magazine" | "masonry" | "overlay";
  postCount?: number;
  isHidden?: boolean;
}

export type ArticleStatus = "draft" | "published";

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  status: ArticleStatus;
  featuredImage: string;
  videoUrl?: string;
  views: number;
  commentCount?: number;
  isBreaking?: boolean;
  isFeatured?: boolean;
  districts?: string[];
  sourceUrls?: string[];
  editHistory?: {
    updatedAt: any;
    updatedBy: string;
    updatedByName: string;
  }[];
  createdAt: any;
  updatedAt: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: any;
  articleId?: string;
}

export type AdPosition = "sidebar" | "homepage_mid" | "article_bottom" | "header";

export interface Ad {
  id?: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: AdPosition;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  category: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  imageUrl?: string;
  linkedArticleId?: string;
  status: "active" | "removed" | "flagged";
  createdAt: any;
  updatedAt: any;
}

export interface CommunityComment {
  id: string;
  postId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  upvotes: number;
  createdAt: any;
}

export interface CommunityVote {
  id: string;
  userId: string;
  targetId: string; // Post or Comment ID
  type: "up" | "down";
  createdAt: any;
}

export interface CommunityReport {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: "post" | "comment";
  reason: string;
  status: "pending" | "resolved";
  createdAt: any;
}

export type ModelCategory = "Fashion" | "Commercial" | "Actor" | "Influencer";
export type ModelGender = "Male" | "Female" | "Other";

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  createdAt: any;
}

export interface Model {
  id: string;
  name: string;
  profileImage: string;
  coverImages?: string[];
  gallery?: GalleryImage[];
  category: ModelCategory;
  gender: ModelGender;
  location: string;
  bio?: string;
  age?: number;
  height?: string;
  weight?: string;
  experienceYears?: number;
  languages?: string[];
  skills?: string[];
  isVerified?: boolean;
  isFeatured?: boolean;
  createdAt: any;
  updatedAt?: any;
}

export interface GalleryReaction {
  id: string;
  modelId: string;
  imageId: string;
  userId: string;
  type: "like" | "heart" | "wow" | "clap";
  createdAt: any;
}

export interface GalleryComment {
  id: string;
  modelId: string;
  imageId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: any;
}

export type InquiryStatus = "new" | "contacted" | "closed";
export type ProjectType = "Photoshoot" | "Music Video" | "Movie" | "Advertisement" | "Other";

export interface ModelInquiry {
  id: string;
  modelId: string;
  modelName: string;
  name: string;
  email: string;
  phone?: string;
  projectType: ProjectType;
  budget?: string;
  message?: string;
  status: InquiryStatus;
  createdAt: any;
}

export type MenuItemType = "category" | "district" | "city" | "custom";

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  type: MenuItemType;
  order: number;
  isActive: boolean;
  parentId?: string;
}
