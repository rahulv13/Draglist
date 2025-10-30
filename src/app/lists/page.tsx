import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { getWatching, getReading, getPlanned, getCompleted } from '@/lib/data';
import { AnimeCard } from '@/components/anime-card';

export default function ListsPage() {
  const watching = getWatching();
  const reading = getReading();
  const planned = getPlanned();
  const completed = getCompleted();

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
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {watching.map((item) => (
              <AnimeCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="reading" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {reading.map((item) => (
              <AnimeCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="planned" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {planned.map((item) => (
                    <AnimeCard key={item.id} item={item} />
                ))}
            </div>
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {completed.map((item) => (
              <AnimeCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
