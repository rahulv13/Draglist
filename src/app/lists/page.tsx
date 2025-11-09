
'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
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
    readingManga: 1,
    readingManhwa: 1,
    plannedAnime: 1,
    plannedManga: 1,
    plannedManhwa: 1,
    completedAnime: 1,
    completedManga: 1,
    completedManhwa: 1,
  });

  const titlesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'titles'), where('isSecret', '!=', true));
  }, [firestore, user?.uid]);
  
  const watchingQuery = useMemoFirebase(() => {
    if (!titlesQuery) return null;
    return query(titlesQuery, where('status', '==', 'Watching'));
  }, [titlesQuery]);
  const { data: watching } = useCollection<Title>(watchingQuery);
  
  const readingQuery = useMemoFirebase(() => {
    if (!titlesQuery) return null;
    return query(titlesQuery, where('status', '==', 'Reading'));
  }, [titlesQuery]);
  const { data: reading } = useCollection<Title>(readingQuery);
  
  const plannedQuery = useMemoFirebase(() => {
    if (!titlesQuery) return null;
    return query(titlesQuery, where('status', '==', 'Planned'));
  }, [titlesQuery]);
  const { data: planned } = useCollection<Title>(plannedQuery);

  const completedQuery = useMemoFirebase(() => {
    if (!titlesQuery) return null;
    return query(titlesQuery, where('status', '==', 'Completed'));
  }, [titlesQuery]);
  const { data: completed } = useCollection<Title>(completedQuery);


  const readingManga = useMemo(
    () => reading?.filter((t) => t.type === 'Manga') || [],
    [reading]
  );
  const readingManhwa = useMemo(
    () => reading?.filter((t) => t.type === 'Manhwa') || [],
    [reading]
  );
  
  const plannedAnime = useMemo(
    () => planned?.filter((t) => t.type === 'Anime') || [],
    [planned]
  );
  const plannedManga = useMemo(
    () => planned?.filter((t) => t.type === 'Manga') || [],
    [planned]
  );
  const plannedManhwa = useMemo(
    () => planned?.filter((t) => t.type === 'Manhwa') || [],
    [planned]
  );
  
  const completedAnime = useMemo(
    () => completed?.filter((t) => t.type === 'Anime') || [],
    [completed]
  );
  const completedManga = useMemo(
    () => completed?.filter((t) => t.type === 'Manga') || [],
    [completed]
  );
  const completedManhwa = useMemo(
    () => completed?.filter((t) => t.type === 'Manhwa') || [],
    [completed]
  );

  const handlePageChange = (tab: keyof typeof currentPages, page: number) => {
    setCurrentPages(prev => ({ ...prev, [tab]: page }));
  };

  const paginatedData = useMemo(() => {
    const paginate = (items: Title[] | null, page: number) => {
      if (!items) return { items: null, totalPages: 0 };
      const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
      const paginatedItems = items.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
      );
      return { items: paginatedItems, totalPages };
    };
    return {
      watching: paginate(watching, currentPages.watching),
      readingManga: paginate(readingManga, currentPages.readingManga),
      readingManhwa: paginate(readingManhwa, currentPages.readingManhwa),
      plannedAnime: paginate(plannedAnime, currentPages.plannedAnime),
      plannedManga: paginate(plannedManga, currentPages.plannedManga),
      plannedManhwa: paginate(plannedManhwa, currentPages.plannedManhwa),
      completedAnime: paginate(completedAnime, currentPages.completedAnime),
      completedManga: paginate(completedManga, currentPages.completedManga),
      completedManhwa: paginate(completedManhwa, currentPages.completedManhwa),
    };
  }, [watching, readingManga, readingManhwa, plannedAnime, plannedManga, plannedManhwa, completedAnime, completedManga, completedManhwa, currentPages]);
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Lists</h2>
      </div>
      <Tabs defaultValue="anime" className="space-y-4">
        <TabsList>
          <TabsTrigger value="anime">Anime</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="anime" className="space-y-4">
          <ListTabContent
            titles={paginatedData.watching.items}
            emptyMessage="You're not watching any anime."
            page={currentPages.watching}
            totalPages={paginatedData.watching.totalPages}
            onPageChange={(page) => handlePageChange('watching', page)}
          />
        </TabsContent>
        <TabsContent value="reading" className="space-y-4">
           <Tabs defaultValue="manga" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="manga">Manga</TabsTrigger>
                    <TabsTrigger value="manhwa">Manhwa</TabsTrigger>
                </TabsList>
                <TabsContent value="manga" className="space-y-4">
                    <ListTabContent
                        titles={paginatedData.readingManga.items}
                        emptyMessage="You are not reading any manga."
                        page={currentPages.readingManga}
                        totalPages={paginatedData.readingManga.totalPages}
                        onPageChange={(page) => handlePageChange('readingManga', page)}
                    />
                </TabsContent>
                <TabsContent value="manhwa" className="space-y-4">
                    <ListTabContent
                        titles={paginatedData.readingManhwa.items}
                        emptyMessage="You are not reading any manhwa."
                        page={currentPages.readingManhwa}
                        totalPages={paginatedData.readingManhwa.totalPages}
                        onPageChange={(page) => handlePageChange('readingManhwa', page)}
                    />
                </TabsContent>
            </Tabs>
        </TabsContent>
        <TabsContent value="planned" className="space-y-4">
            <Tabs defaultValue="anime" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="anime">Anime</TabsTrigger>
                    <TabsTrigger value="manga">Manga</TabsTrigger>
                    <TabsTrigger value="manhwa">Manhwa</TabsTrigger>
                </TabsList>
                <TabsContent value="anime" className="space-y-4">
                    <ListTabContent
                        titles={paginatedData.plannedAnime.items}
                        emptyMessage="You have no planned anime."
                        page={currentPages.plannedAnime}
                        totalPages={paginatedData.plannedAnime.totalPages}
                        onPageChange={(page) => handlePageChange('plannedAnime', page)}
                    />
                </TabsContent>
                <TabsContent value="manga" className="space-y-4">
                    <ListTabContent
                        titles={paginatedData.plannedManga.items}
                        emptyMessage="You have no planned manga."
                        page={currentPages.plannedManga}
                        totalPages={paginatedData.plannedManga.totalPages}
                        onPageChange={(page) => handlePageChange('plannedManga', page)}
                    />
                </TabsContent>
                <TabsContent value="manhwa" className="space-y-4">
                    <ListTabContent
                        titles={paginatedData.plannedManhwa.items}
                        emptyMessage="You have no planned manhwa."
                        page={currentPages.plannedManhwa}
                        totalPages={paginatedData.plannedManhwa.totalPages}
                        onPageChange={(page) => handlePageChange('plannedManhwa', page)}
                    />
                </TabsContent>
            </Tabs>
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
           <Tabs defaultValue="anime" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="anime">Anime</TabsTrigger>
                    <TabsTrigger value="manga">Manga</TabsTrigger>
                    <TabsTrigger value="manhwa">Manhwa</TabsTrigger>
                </TabsList>
                <TabsContent value="anime" className="space-y-4">
                    <ListTabContent
                        titles={paginatedData.completedAnime.items}
                        emptyMessage="You have no completed anime."
                        page={currentPages.completedAnime}
                        totalPages={paginatedData.completedAnime.totalPages}
                        onPageChange={(page) => handlePageChange('completedAnime', page)}
                    />
                </TabsContent>
                <TabsContent value="manga" className="space-y-4">
                    <ListTabContent
                        titles={paginatedData.completedManga.items}
                        emptyMessage="You have no completed manga."
                        page={currentPages.completedManga}
                        totalPages={paginatedData.completedManga.totalPages}
                        onPageChange={(page) => handlePageChange('completedManga', page)}
                    />
                </TabsContent>
                <TabsContent value="manhwa" className="space-y-4">
                    <ListTabContent
                        titles={paginatedData.completedManhwa.items}
                        emptyMessage="You have no completed manhwa."
                        page={currentPages.completedManhwa}
                        totalPages={paginatedData.completedManhwa.totalPages}
                        onPageChange={(page) => handlePageChange('completedManhwa', page)}
                    />
                </TabsContent>
            </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
