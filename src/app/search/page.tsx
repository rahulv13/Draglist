
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SearchIcon, Plus, Loader2, Wand2 } from 'lucide-react';
import { addTitle, type Title } from '@/lib/data';
import { AnimeCard } from '@/components/anime-card';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { fetchTitleInfo } from '@/ai/flows/fetch-title-info-flow';
import { fetchTopTitles, type FetchTopTitlesOutput } from '@/ai/flows/fetch-top-titles-flow';
import { Label } from '@/components/ui/label';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';

type FormValues = {
  title: string;
  type: 'Anime' | 'Manga' | 'Manhwa';
  status: 'Watching' | 'Reading' | 'Planned' | 'Completed';
  total: number;
  imageUrl: string;
};

// Mock search results until a real search API is implemented
const getSearchResults = (query: string): Title[] => {
  if (!query) return [];
  const queryWords = query.toLowerCase().split(' ');
  return PlaceHolderImages.filter(p => 
    queryWords.every(word => 
      p.description.toLowerCase().includes(word) || 
      p.imageHint.toLowerCase().includes(word)
    )
  ).map(p => ({
      id: p.id,
      title: p.description,
      type: p.description.toLowerCase().includes('manga') ? 'Manga' : 'Anime',
      status: 'Planned', // Mock
      progress: 0,
      total: 12,
      score: 0,
      imageUrl: p.imageUrl,
      imageHint: p.imageHint,
      createdAt: new Date(),
      updatedAt: new Date(),
  }));
};


export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [urlToFetch, setUrlToFetch] = useState('');
  const [topAnime, setTopAnime] = useState<FetchTopTitlesOutput | null>(null);
  const [topManga, setTopManga] = useState<FetchTopTitlesOutput | null>(null);
  const [topManhwa, setTopManhwa] = useState<FetchTopTitlesOutput | null>(null);
  const [isLoadingTop, setIsLoadingTop] = useState(true);

  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    const getTopTitles = async () => {
      setIsLoadingTop(true);
      try {
        const [animeRes, mangaRes, manhwaRes] = await Promise.all([
          fetchTopTitles({ type: 'ANIME' }),
          fetchTopTitles({ type: 'MANGA' }),
          fetchTopTitles({ type: 'MANHWA' }),
        ]);
        setTopAnime(animeRes);
        setTopManga(mangaRes);
        setTopManhwa(manhwaRes);
      } catch (error) {
        console.error("Failed to fetch top titles:", error);
        toast({
            variant: "destructive",
            title: "Error fetching popular titles",
            description: "Could not fetch top anime and manga lists.",
        })
      } finally {
        setIsLoadingTop(false);
      }
    };
    getTopTitles();
  }, [toast]);

  const searchResults = getSearchResults(query);
  
  const form = useForm<FormValues>({
    defaultValues: {
      title: '',
      type: 'Anime',
      status: 'Planned',
      total: 0,
      imageUrl: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to add a title.' });
        return;
    }
    addTitle(firestore, user.uid, {
        ...data,
        total: Number(data.total) || 0
    });
    toast({
        title: "Title Added",
        description: `${data.title} has been added to your lists.`,
    })
    form.reset();
    setOpen(false);
  };

  const handleFetchInfo = async () => {
    if (!urlToFetch) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter a URL to fetch.' });
        return;
    }
    setIsFetching(true);
    try {
        const info = await fetchTitleInfo({ url: urlToFetch });
        form.setValue('title', info.title);
        form.setValue('imageUrl', info.imageUrl);
        form.setValue('total', info.total > 0 ? info.total : 0);
        form.setValue('type', info.type);
        toast({ title: 'Success', description: 'Information fetched successfully!' });
    } catch (error) {
        console.error('Failed to fetch title info:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch information from the URL.' });
    } finally {
        setIsFetching(false);
    }
  }

  const renderTopCarousel = (title: string, items: FetchTopTitlesOutput | null, type: 'Anime' | 'Manga' | 'Manhwa') => {
    return (
      <div>
        <h3 className="text-2xl font-bold tracking-tight mb-4">{title}</h3>
        <Carousel opts={{ align: "start", loop: !isLoadingTop && items && items.length > 0 }}>
          <CarouselContent>
            {isLoadingTop || !items ? (
              Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                   <div className="space-y-2">
                        <Skeleton className="h-[300px] w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </CarouselItem>
              ))
            ) : (
              items.map((item, index) => (
                <CarouselItem key={index} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                  <AnimeCard item={{
                      id: `${type}-${index}`,
                      title: item.title,
                      imageUrl: item.imageUrl,
                      type: type,
                      status: 'Planned',
                      progress: 0,
                      total: item.total || 0,
                      score: 0,
                      imageHint: '',
                      createdAt: new Date(),
                      updatedAt: new Date(),
                  }} />
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Search Titles</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Title
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add a new title</DialogTitle>
              <DialogDescription>
                Enter a URL to auto-fill details, or add them manually.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fetch-url">Fetch from URL</Label>
                    <div className="flex items-center gap-2">
                        <Input id="fetch-url" placeholder="https://myanimelist.net/..." value={urlToFetch} onChange={(e) => setUrlToFetch(e.target.value)} disabled={isFetching}/>
                        <Button onClick={handleFetchInfo} disabled={isFetching} size="icon">
                            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            <span className="sr-only">Fetch Info</span>
                        </Button>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or add manually</span>
                    </div>
                </div>

                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="title"
                    rules={{ required: 'Title is required' }}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Void Specter" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Anime">Anime</SelectItem>
                                    <SelectItem value="Manga">Manga</SelectItem>
                                    <SelectItem value="Manhwa">Manhwa</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="total"
                            rules={{ required: 'Total is required', min: { value: 0, message: 'Must be at least 0' } }}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Total Ep/Ch</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}/>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Watching">Watching</SelectItem>
                                <SelectItem value="Reading">Reading</SelectItem>
                                <SelectItem value="Planned">Planned</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                        />
                    <Button type="submit" className="w-full">Add Title</Button>
                </form>
                </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for anime or manga..."
          className="w-full rounded-lg bg-background pl-10 h-12 text-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {query ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pt-4">
            {searchResults.map((item) => (
              <AnimeCard key={item.id} item={item} />
            ))}
          </div>
          {searchResults.length === 0 && (
            <div className="text-center col-span-full py-16">
              <p className="text-muted-foreground">
                No results found for "{query}".
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-8 pt-4">
          {renderTopCarousel("Top 5 Anime", topAnime, 'Anime')}
          {renderTopCarousel("Top 5 Manga", topManga, 'Manga')}
          {renderTopCarousel("Top 5 Manhwa", topManhwa, 'Manhwa')}
        </div>
      )}
    </div>
  );
}
