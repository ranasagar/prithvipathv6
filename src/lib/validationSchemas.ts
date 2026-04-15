import { z } from 'zod';

/**
 * Zod Validation Schemas
 * Centralized schema definitions for all forms
 */

// Contact Form Validation
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: z.string()
    .email('Invalid email address'),
  phone: z.string()
    .regex(/^[0-9\+\-\s\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .optional()
    .or(z.literal('')),
  subject: z.string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must not exceed 200 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must not exceed 5000 characters'),
  category: z.string()
    .min(1, 'Please select a category'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Article/Post Form Validation
export const articleFormSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(300, 'Title must not exceed 300 characters'),
  content: z.string()
    .min(50, 'Content must be at least 50 characters')
    .max(50000, 'Content must not exceed 50000 characters'),
  category: z.string()
    .min(1, 'Please select a category'),
  featured_image: z.string().url('Invalid image URL').optional(),
  excerpt: z.string()
    .max(500, 'Excerpt must not exceed 500 characters')
    .optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export type ArticleFormData = z.infer<typeof articleFormSchema>;

// Event Form Validation
export const eventFormSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must not exceed 5000 characters'),
  date: z.string().datetime('Invalid date format'),
  location: z.string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must not exceed 200 characters'),
  category: z.string()
    .min(1, 'Please select a category'),
  thumbnail: z.string().url('Invalid thumbnail URL').optional(),
  status: z.enum(['draft', 'published', 'completed']).default('draft'),
});

export type EventFormData = z.infer<typeof eventFormSchema>;

// Community Post Validation
export const communityPostSchema = z.object({
  content: z.string()
    .min(5, 'Post must be at least 5 characters')
    .max(2000, 'Post must not exceed 2000 characters'),
  category: z.string()
    .min(1, 'Please select a category'),
  image: z.string().url('Invalid image URL').optional(),
});

export type CommunityPostData = z.infer<typeof communityPostSchema>;

// Search Filter Validation
export const searchFilterSchema = z.object({
  query: z.string().min(1, 'Search query required'),
  category: z.string().optional(),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  }).optional(),
  sortBy: z.enum(['relevance', 'date', 'popularity']).default('relevance'),
});

export type SearchFilterData = z.infer<typeof searchFilterSchema>;
