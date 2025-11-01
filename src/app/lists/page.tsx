
'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { AnimeCard } from '@/components/anime-card';
import type { Title } from '@/lib/data';
import { PaginationControls } from '@/components/pagination-controls';

const ITEMS_PER_PAGE = 10;

const ListTabContent = ({ titles, emptyMessage, page, totalPages, onPageChange }: { titles: Title[] | null; emptyMessage: string; page: number; totalPages: number; onPageChange: (page: number) => void; }) => {
  if (!titles) {
    return <p className="text-muted-foreground col-span-full">Loading...</p>;
  }

  if (titles.length === 0) {
    return <p className="text-muted-foreground col-span-full">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {titles.map((item) => (
          <AnimeCard key={item.id} item={item} />
        ))}
      </div>
      {totalPages > 1 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};


export default function ListsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [currentPages, setCurrentPages] = useState({
    watching: 1,
    reading: 1,
    planned: 1,
    completed: 1,
  });

  const titlesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return collection(firestore, 'users', user.uid, 'titles');
  }, [firestore, user?.uid]);

  const { data: allTitles } = useCollection<Title>(titlesQuery);

  const watching = useMemo(
    () => allTitles?.filter((t) => t.status === 'Watching') || [],
    [allTitles]
  );
  const reading = useMemo(
    () => allTitles?.filter((t) => t.status === 'Reading') || [],
    [allTitles]
  );
  const planned = useMemo(
    () => allTitles?.filter((t) => t.status === 'Planned') || [],
    [allTitles]
  );
  const completed = useMemo(
    () => allTitles?.filter((t) => t.status === 'Completed') || [],
    [allTitles]
  );

  const handlePageChange = (tab: keyof typeof currentPages, page: number) => {
    setCurrentPages(prev => ({ ...prev, [tab]: page }));
  };

  const paginatedData = useMemo(() => {
    const paginate = (items: Title[], page: number) => {
      const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
      const paginatedItems = items.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
      );
      return { items: paginatedItems, totalPages };
    };
    return {
      watching: paginate(watching, currentPages.watching),
      reading: paginate(reading, currentPages.reading),
      planned: paginate(planned, currentPages.planned),
      completed: paginate(completed, currentPages.completed),
    };
  }, [watching, reading, planned, completed, currentPages]);
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Lists</h2>
      </div>
      <Tabs defaultValue="watching" className="space-y-4" onValueChange={() => {
        // Optional: Reset to page 1 when changing tabs
        // handlePageChange('watching', 1);
        // handlePageChange('reading', 1);
        // handlePageChange('planned', 1);
        // handlePageChange('completed', 1);
      }}>
        <TabsList>
          <TabsTrigger value="watching">Watching</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="watching" className="space-y-4">
          <ListTabContent
            titles={paginatedData.watching.items}
            emptyMessage="You're not watching any anime."
            page={currentPages.watching}
            totalPages={paginatedData.watching.totalPages}
            onPageChange={(page) => handlePageChange('watching', page)}
          />
        </TabsContent>
        <TabsContent value="reading" className="space-y-4">
          <ListTabContent
            titles={paginatedData.reading.items}
            emptyMessage="You're not reading any manga."
            page={currentPages.reading}
            totalPages={paginatedData.reading.totalPages}
            onPageChange={(page) => handlePageChange('reading', page)}
          />
        </TabsContent>
        <TabsContent value="planned" className="space-y-4">
          <ListTabContent
            titles={paginatedData.planned.items}
            emptyMessage="You have no planned titles."
            page={currentPages.planned}
            totalPages={paginatedData.planned.totalPages}
            onPageChange={(page) => handlePageChange('planned', page)}
          />
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <ListTabContent
            titles={paginatedData.completed.items}
            emptyMessage="You have no completed titles."
            page={currentPages.completed}
            totalPages={paginatedData.completed.totalPages}
            onPageChange={(page) => handlePageChange('completed', page)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
