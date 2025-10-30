'use client';

import { useState } from 'react';
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
import { SearchIcon, Plus } from 'lucide-react';
import { getPopular, getSearchResults, addTitle, Title } from '@/lib/data';
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

type FormValues = {
  title: string;
  type: 'Anime' | 'Manga';
  status: 'Watching' | 'Reading' | 'Planned' | 'Completed';
  total: number;
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  // A simple way to force a re-render
  const [listVersion, setListVersion] = useState(0);

  const popular = getPopular();
  const searchResults = getSearchResults(query);

  const itemsToShow = query ? searchResults : popular;
  
  const form = useForm<FormValues>({
    defaultValues: {
      title: '',
      type: 'Anime',
      status: 'Planned',
      total: 12,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    addTitle({
        ...data,
        total: Number(data.total)
    });
    toast({
        title: "Title Added",
        description: `${data.title} has been added to your lists.`,
    })
    form.reset();
    setOpen(false);
    setListVersion(v => v + 1); // Trigger re-render
  };

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new title</DialogTitle>
              <DialogDescription>
                Enter the details for the new anime or manga.
              </DialogDescription>
            </DialogHeader>
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Anime">Anime</SelectItem>
                          <SelectItem value="Manga">Manga</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

                <FormField
                  control={form.control}
                  name="total"
                  rules={{ required: 'Total is required', min: { value: 1, message: 'Must be at least 1' } }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Episodes/Chapters</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Add Title</Button>
              </form>
            </Form>
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
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pt-4">
        {itemsToShow.map((item) => (
          <AnimeCard key={`${item.id}-${listVersion}`} item={item} />
        ))}
      </div>
      {query && itemsToShow.length === 0 && (
        <div className="text-center col-span-full py-16">
          <p className="text-muted-foreground">
            No results found for "{query}".
          </p>
        </div>
      )}
    </div>
  );
}
