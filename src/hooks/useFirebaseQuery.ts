import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

/**
 * Reusable React Query hooks for Firebase data fetching
 * Provides built-in caching, automatic refetching, and error handling
 */

interface UseFirebaseQueryOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

/**
 * Generic Firebase query hook
 * @param queryKey - React Query key
 * @param collectionName - Firestore collection name
 * @param constraints - Firebase query constraints (where, orderBy, etc.)
 * @param options - Query options
 */
export function useFirebaseQuery<T>(
  queryKey: string[],
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: UseFirebaseQueryOptions = {}
): UseQueryResult<T[], Error> {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const q = query(
        collection(db, collectionName),
        ...constraints
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    },
    enabled: options.enabled !== false,
    refetchInterval: options.refetchInterval,
  });
}

/**
 * Fetch all published articles
 */
export function useArticles() {
  return useFirebaseQuery(
    ['articles'],
    'articles',
    [
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
    ]
  );
}

/**
 * Fetch articles by category
 */
export function useArticlesByCategory(category: string) {
  return useFirebaseQuery(
    ['articles', 'category', category],
    'articles',
    [
      where('status', '==', 'published'),
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
    ]
  );
}

/**
 * Fetch single article by ID
 */
export function useArticle(articleId: string) {
  return useFirebaseQuery(
    ['article', articleId],
    'articles',
    [where('id', '==', articleId)],
    { enabled: !!articleId }
  );
}

/**
 * Fetch all published events
 */
export function useEvents() {
  return useFirebaseQuery(
    ['events'],
    'events',
    [
      where('status', '==', 'published'),
      orderBy('date', 'asc'),
    ]
  );
}

/**
 * Fetch featured event
 */
export function useFeaturedEvent() {
  return useFirebaseQuery(
    ['events', 'featured'],
    'events',
    [
      where('isFeatured', '==', true),
      where('status', '==', 'published'),
    ]
  );
}

/**
 * Fetch all categories
 */
export function useCategories() {
  return useFirebaseQuery(
    ['categories'],
    'categories',
    [orderBy('name', 'asc')]
  );
}

/**
 * Fetch community posts
 */
export function useCommunityPosts() {
  return useFirebaseQuery(
    ['communityPosts'],
    'communityPosts',
    [
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
    ]
  );
}

/**
 * Fetch community posts by category
 */
export function useCommunityPostsByCategory(category: string) {
  return useFirebaseQuery(
    ['communityPosts', category],
    'communityPosts',
    [
      where('status', '==', 'active'),
      where('category', '==', category),
      orderBy('upvotes', 'desc'),
    ]
  );
}

/**
 * Fetch trending posts
 */
export function useTrendingPosts() {
  return useFirebaseQuery(
    ['posts', 'trending'],
    'articles',
    [
      where('status', '==', 'published'),
      orderBy('views', 'desc'),
    ]
  );
}

/**
 * Fetch models/profiles
 */
export function useModels() {
  return useFirebaseQuery(
    ['models'],
    'models',
    [where('status', '==', 'active'), orderBy('createdAt', 'desc')]
  );
}

export function useModelsByDistrict(district: string) {
  return useFirebaseQuery(
    ['models', district],
    'models',
    [
      where('status', '==', 'active'),
      where('district', '==', district),
    ]
  );
}
