
'use client';

import { useMemo } from 'react';
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

const ListTabContent = ({ titles, emptyMessage }: { titles: Title[] | null; emptyMessage: string }) => {
  if (!titles) {
    return <p className="text-muted-foreground col-span-full">Loading...</p>;
  }

  if (titles.length === 0) {
    return <p className="text-muted-foreground col-span-full">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {titles.map((item) => (
        <AnimeCard key={item.id} item={item} />
      ))}
    </div>
  );
};


export default function ListsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

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
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Lists</h2>
      </div>
      <Tabs defaultValue="watching" className="space-y-4">
        <TabsList>
          <TabsTrigger value="watching">Watching</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="watching" className="space-y-4">
          <ListTabContent titles={watching} emptyMessage="You're not watching any anime." />
        </TabsContent>
        <TabsContent value="reading" className="space-y-4">
          <ListTabContent titles={reading} emptyMessage="You're not reading any manga." />
        </TabsContent>
        <TabsContent value="planned" className="space-y-4">
          <ListTabContent titles={planned} emptyMessage="You have no planned titles." />
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <ListTabContent titles={completed} emptyMessage="You have no completed titles." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
