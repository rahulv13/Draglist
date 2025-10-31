
'use client';

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';

export type Title = {
  id: string;
  title: string;
  type: 'Anime' | 'Manga';
  status: 'Watching' | 'Reading' | 'Planned' | 'Completed';
  progress: number;
  total: number;
  score: number;
  imageUrl: string;
  imageHint: string;
  createdAt: any; // serverTimestamp
  updatedAt: any; // serverTimestamp
};

export const addTitle = (
  firestore: Firestore,
  userId: string,
  newTitleData: Omit<Title, 'id' | 'progress' | 'score' | 'imageHint' | 'createdAt' | 'updatedAt'>
) => {
  if (!userId) {
    throw new Error('User must be logged in to add a title.');
  }
  const titlesCollection = collection(firestore, 'users', userId, 'titles');
  const newId = doc(titlesCollection).id;

  const data = {
    ...newTitleData,
    progress: 0,
    score: 0,
    imageUrl:
      newTitleData.imageUrl || `https://picsum.photos/seed/${newId}/400/600`,
    imageHint: newTitleData.title.split(' ').slice(0, 2).join(' ').toLowerCase(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  addDocumentNonBlocking(titlesCollection, data);
};

export const updateTitle = (
  firestore: Firestore,
  userId: string,
  titleId: string,
  updatedData: Partial<Omit<Title, 'id' | 'createdAt'>>
) => {
  if (!userId) {
    throw new Error('User must be logged in to update a title.');
  }
  const titleDoc = doc(firestore, 'users', userId, 'titles', titleId);
  updateDocumentNonBlocking(titleDoc, {
    ...updatedData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTitle = (
  firestore: Firestore,
  userId: string,
  titleId: string
) => {
  if (!userId) {
    throw new Error('User must be logged in to delete a title.');
  }
  const titleDoc = doc(firestore, 'users', userId, 'titles', titleId);
  deleteDocumentNonBlocking(titleDoc);
};
