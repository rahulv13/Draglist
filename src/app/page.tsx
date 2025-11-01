
'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Title } from '@/lib/data';
import {
  Activity,
  BookOpen,
  Clapperboard,
  Film,
  List,
  Target,
} from 'lucide-react';
import DashboardCharts from '@/components/dashboard-charts';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  
  const titlesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return collection(firestore, 'users', user.uid, 'titles');
  }, [firestore, user?.uid]);

  const { data: allTitles, isLoading } = useCollection<Title>(titlesQuery);

  const stats = useMemo(() => {
    if (!allTitles) {
      return [
        { label: 'Anime Watched', value: 0, change: '+0' },
        { label: 'Manga Read', value: 0, change: '+0' },
        { label: 'Episodes Watched', value: 0, change: '+0' },
        { label: 'In Progress', value: 0, change: '+0' },
        { label: 'Total Entries', value: 0, change: '+0' },
        { label: 'Avg. Score', value: '0.00', change: '+0.0' },
      ];
    }
    const animeWatched = allTitles.filter(
      (t) => t.type === 'Anime' && t.status === 'Completed'
    ).length;
    const mangaRead = allTitles.filter(
      (t) => t.type === 'Manga' && t.status === 'Completed'
    ).length;
    const episodesWatched = allTitles
      .filter((t) => t.type === 'Anime')
      .reduce((sum, t) => sum + t.progress, 0);
    const inProgress = allTitles.filter(
      (t) => t.status === 'Watching' || t.status === 'Reading'
    ).length;
    const totalEntries = allTitles.length;
    const scoredTitles = allTitles.filter((t) => t.score > 0);
    const avgScore =
      scoredTitles.length > 0
        ? (
            scoredTitles.reduce((sum, t) => sum + t.score, 0) /
            scoredTitles.length
          ).toFixed(2)
        : '0.00';

    return [
      { label: 'Anime Watched', value: animeWatched, change: '+0' },
      { label: 'Manga Read', value: mangaRead, change: '+0' },
      { label: 'Episodes Watched', value: episodesWatched, change: '+0' },
      { label: 'In Progress', value: inProgress, change: '+0' },
      { label: 'Total Entries', value: totalEntries, change: '+0' },
      { label: 'Avg. Score', value: avgScore, change: '+0.0' },
    ];
  }, [allTitles]);

  const statusDistribution = useMemo(() => {
    if (!allTitles) return [];
    const watching = allTitles.filter((t) => t.status === 'Watching').length;
    const reading = allTitles.filter((t) => t.status === 'Reading').length;
    const planned = allTitles.filter((t) => t.status === 'Planned').length;
    const completed = allTitles.filter((t) => t.status === 'Completed').length;
    return [
      { name: 'Watching', value: watching, fill: 'var(--color-watching)' },
      { name: 'Reading', value: reading, fill: 'var(--color-reading)' },
      { name: 'Planned', value: planned, fill: 'var(--color-planned)' },
      { name: 'Completed', value: completed, fill: 'var(--color-completed)' },
    ];
  }, [allTitles]);

  // Using mock data until real activity tracking is implemented
  const recentActivity = [
    { name: 'Jan', anime: 0, manga: 0 },
    { name: 'Feb', anime: 0, manga: 0 },
    { name: 'Mar', anime: 0, manga: 0 },
    { name: 'Apr', anime: 0, manga: 0 },
    { name: 'May', anime: 0, manga: 0 },
    { name: 'Jun', anime: 0, manga: 0 },
  ];

  const iconMap: { [key: string]: React.ReactNode } = {
    'Anime Watched': <Film className="h-6 w-6 text-muted-foreground" />,
    'Manga Read': <BookOpen className="h-6 w-6 text-muted-foreground" />,
    'Episodes Watched': <Clapperboard className="h-6 w-6 text-muted-foreground" />,
    'In Progress': <Activity className="h-6 w-6 text-muted-foreground" />,
    'Total Entries': <List className="h-6 w-6 text-muted-foreground" />,
    'Avg. Score': <Target className="h-6 w-6 text-muted-foreground" />,
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              {iconMap[stat.label]}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} vs last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardCharts
              activityData={recentActivity}
              distributionData={statusDistribution}
            />
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>List Distribution</CardTitle>
            <CardDescription>
              Your collection by status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardCharts
              activityData={recentActivity}
              distributionData={statusDistribution}
              chartType="pie"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
