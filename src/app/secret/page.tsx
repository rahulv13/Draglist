
'use client';

import { useMemo, useState } from 'react';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Title } from '@/lib/data';
import { AnimeCard } from '@/components/anime-card';
import { KeyRound } from 'lucide-react';
import { PaginationControls } from '@/components/pagination-controls';

const ITEMS_PER_PAGE = 10;

export default function SecretPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState(1);

  const secretTitlesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'users', user.uid, 'titles'),
      where('isSecret', '==', true)
    );
  }, [firestore, user?.uid]);

  const { data: secretTitles, isLoading } = useCollection<Title>(secretTitlesQuery);

  const totalPages = useMemo(() => {
    if (!secretTitles) return 0;
    return Math.ceil(secretTitles.length / ITEMS_PER_PAGE);
  }, [secretTitles]);

  const paginatedTitles = useMemo(() => {
    if (!secretTitles) return [];
    return secretTitles.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [secretTitles, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-4">
        <KeyRound className="h-10 w-10 text-primary" />
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Secret Stash</h2>
          <p className="text-muted-foreground">
            Your private collection of anime and manga.
          </p>
        </div>
      </div>

      {isLoading || !secretTitles ? (
        <p className="text-muted-foreground">Loading your secret list...</p>
      ) : secretTitles && secretTitles.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pt-4">
            {paginatedTitles.map((item) => (
              <AnimeCard key={item.id} item={item} />
            ))}
          </div>
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8 py-24">
            <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">Your stash is empty</h3>
                <p className="text-sm text-muted-foreground">
                    Mark a title as secret to add it here.
                </p>
            </div>
        </div>
      )}
    </div>
  );
}
