/**
 * Development Authentication for working around Firebase OAuth domain restrictions
 * This file should ONLY be used in development environments
 */

import { User as FirebaseUser } from 'firebase/auth';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface MockUser extends Omit<FirebaseUser, 'toJSON'> {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime?: number | null;
    lastSignInTime?: number | null;
  };
  providerData: any[];
  phoneNumber: string | null;
  tenantId: string | null;
}

/**
 * Create a mock Firebase user for development
 * Only works when import.meta.env.DEV is true
 */
export async function createMockGoogleUser(email: string, displayName: string): Promise<MockUser> {
  if (!import.meta.env.DEV) {
    throw new Error('Mock auth only available in development');
  }

  const mockUser: MockUser = {
    uid: `dev-${Date.now()}`,
    email,
    displayName,
    photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: Date.now(),
      lastSignInTime: Date.now(),
    },
    providerData: [
      {
        displayName,
        email,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`,
        providerId: 'google.com',
        uid: email,
      },
    ],
    phoneNumber: null,
    tenantId: null,
  };

  // Save to localStorage for persistence
  localStorage.setItem('devMockUser', JSON.stringify(mockUser));

  // Create user document in Firestore
  try {
    await setDoc(doc(db, 'users', mockUser.uid), {
      email: mockUser.email,
      displayName: mockUser.displayName,
      photoURL: mockUser.photoURL,
      role: 'user',
      createdAt: new Date(),
      provider: 'google',
    });
  } catch (error) {
    console.warn('Could not create user document:', error);
  }

  return mockUser;
}

/**
 * Get mock user from localStorage
 */
export function getMockUser(): MockUser | null {
  if (!import.meta.env.DEV) return null;
  const stored = localStorage.getItem('devMockUser');
  return stored ? JSON.parse(stored) : null;
}

/**
 * Clear mock user
 */
export function clearMockUser(): void {
  localStorage.removeItem('devMockUser');
}
