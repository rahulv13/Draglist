'use client';

import { useState, useMemo } from 'react';
import {
  useUser,
  useFirestore,
  useDoc,
  useMemoFirebase,
} from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Title } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReaderPage({
  params,
}: {
  params: { titleId: string };
}) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [currentChapter, setCurrentChapter] = useState(1);

  const titleDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !params.titleId) return null;
    return doc(firestore, 'users', user.uid, 'titles', params.titleId);
  }, [firestore, user?.uid, params.titleId]);

  const { data: title, isLoading } = useDoc<Title>(titleDocRef);

  const chapterOptions = useMemo(() => {
    if (!title || !title.total || title.total <= 0) return [];
    return Array.from({ length: title.total }, (_, i) => i + 1);
  }, [title]);

  const handleChapterChange = (chapter: number) => {
    if (chapter > 0 && chapter <= (title?.total || 0)) {
      setCurrentChapter(chapter);
    }
  };
  
  // Using picsum for placeholder images
  const chapterPages = useMemo(() => {
    const pageCount = Math.floor(Math.random() * 20) + 15; // Random number of pages
    return Array.from({ length: pageCount }, (_, i) => `https://picsum.photos/seed/${params.titleId}-${currentChapter}-${i}/800/1200`);
  }, [params.titleId, currentChapter]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex flex-col items-center space-y-2">
            {Array.from({length: 3}).map((_, i) => (
                <Skeleton key={i} className="h-[1200px] w-[800px]" />
            ))}
        </div>
      </div>
    );
  }

  if (!title) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Title not found</h1>
        <p className="text-muted-foreground">This title could not be found in your list.</p>
        <Button asChild className="mt-4">
            <Link href="/lists"><Home className="mr-2 h-4 w-4" /> Go to My Lists</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
       <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
         <div className="container mx-auto p-4 max-w-4xl">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => handleChapterChange(currentChapter - 1)} disabled={currentChapter <= 1}>
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Prev</span>
            </Button>
            <div className="flex flex-col items-center text-center">
                <h1 className="text-xl font-bold truncate">{title.title}</h1>
                <Select value={currentChapter.toString()} onValueChange={(val) => handleChapterChange(Number(val))}>
                    <SelectTrigger className="w-[180px] h-8 mt-1">
                        <SelectValue placeholder="Select chapter" />
                    </SelectTrigger>
                    <SelectContent>
                        {chapterOptions.map((chapterNum) => (
                        <SelectItem key={chapterNum} value={chapterNum.toString()}>
                            Chapter {chapterNum}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button variant="outline" onClick={() => handleChapterChange(currentChapter + 1)} disabled={currentChapter >= title.total}>
                <span className="hidden sm:inline mr-2">Next</span>
                <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
         </div>
       </header>

      <main className="container mx-auto p-4 max-w-2xl">
        <div className="flex flex-col items-center space-y-2">
            {chapterPages.map((pageUrl, index) => (
                 <Image
                    key={index}
                    src={pageUrl}
                    alt={`Page ${index + 1} of chapter ${currentChapter}`}
                    width={800}
                    height={1200}
                    priority={index < 3} // Prioritize loading first few pages
                    unoptimized
                    className="shadow-md"
                />
            ))}
        </div>
      </main>
    </div>
  );
}
