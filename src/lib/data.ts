import { PlaceHolderImages } from './placeholder-images';

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
};

let allTitles: Title[] = [
  {
    id: '1',
    title: 'Void Specter',
    type: 'Anime',
    status: 'Watching',
    progress: 10,
    total: 24,
    score: 8,
    imageUrl: PlaceHolderImages[0].imageUrl,
    imageHint: PlaceHolderImages[0].imageHint,
  },
  {
    id: '2',
    title: 'Café Starlight',
    type: 'Manga',
    status: 'Reading',
    progress: 45,
    total: 120,
    score: 9,
    imageUrl: PlaceHolderImages[1].imageUrl,
    imageHint: PlaceHolderImages[1].imageHint,
  },
  {
    id: '3',
    title: 'Arcane Drifters',
    type: 'Anime',
    status: 'Watching',
    progress: 5,
    total: 12,
    score: 7,
    imageUrl: PlaceHolderImages[2].imageUrl,
    imageHint: PlaceHolderImages[2].imageHint,
  },
  {
    id: '4',
    title: 'Cybernetic Echo',
    type: 'Anime',
    status: 'Completed',
    progress: 12,
    total: 12,
    score: 9,
    imageUrl: PlaceHolderImages[3].imageUrl,
    imageHint: PlaceHolderImages[3].imageHint,
  },
  {
    id: '5',
    title: 'First Bloom',
    type: 'Manga',
    status: 'Planned',
    progress: 0,
    total: 85,
    score: 0,
    imageUrl: PlaceHolderImages[4].imageUrl,
    imageHint: PlaceHolderImages[4].imageHint,
  },
  {
    id: '6',
    title: 'Crimson Labyrinth',
    type: 'Anime',
    status: 'Watching',
    progress: 2,
    total: 13,
    score: 8,
    imageUrl: PlaceHolderImages[5].imageUrl,
    imageHint: PlaceHolderImages[5].imageHint,
  },
  {
    id: '7',
    title: 'Final Spike',
    type: 'Anime',
    status: 'Planned',
    progress: 0,
    total: 25,
    score: 0,
    imageUrl: PlaceHolderImages[6].imageUrl,
    imageHint: PlaceHolderImages[6].imageHint,
  },
  {
    id: '8',
    title: 'Edo Blades',
    type: 'Manga',
    status: 'Reading',
    progress: 112,
    total: 250,
    score: 9,
    imageUrl: PlaceHolderImages[7].imageUrl,
    imageHint: PlaceHolderImages[7].imageHint,
  },
  {
    id: '9',
    title: 'Class Clown Chronicle',
    type: 'Anime',
    status: 'Completed',
    progress: 24,
    total: 24,
    score: 7,
    imageUrl: PlaceHolderImages[8].imageUrl,
    imageHint: PlaceHolderImages[8].imageHint,
  },
  {
    id: '10',
    title: 'Reborn as a Slime King',
    type: 'Manga',
    status: 'Reading',
    progress: 20,
    total: 150,
    score: 8,
    imageUrl: PlaceHolderImages[9].imageUrl,
    imageHint: PlaceHolderImages[9].imageHint,
  },
  {
    id: '11',
    title: 'The Silent Witness',
    type: 'Anime',
    status: 'Completed',
    progress: 12,
    total: 12,
    score: 10,
    imageUrl: PlaceHolderImages[10].imageUrl,
    imageHint: PlaceHolderImages[10].imageHint,
  },
  {
    id: '12',
    title: 'Mind Game',
    type: 'Manga',
    status: 'Completed',
    progress: 98,
    total: 98,
    score: 9,
    imageUrl: PlaceHolderImages[11].imageUrl,
    imageHint: PlaceHolderImages[11].imageHint,
  },
];

export const addTitle = (newTitleData: Omit<Title, 'id' | 'progress' | 'score' | 'imageUrl' | 'imageHint'>) => {
    const newId = (allTitles.length + 1).toString();
    const newTitle: Title = {
        id: newId,
        progress: 0,
        score: 0,
        imageUrl: `https://picsum.photos/seed/${newId}/400/600`,
        imageHint: newTitleData.title.split(' ').slice(0,2).join(' ').toLowerCase(),
        ...newTitleData,
    };
    allTitles.unshift(newTitle);
};

export const updateTitle = (id: string, updatedData: Partial<Omit<Title, 'id' | 'imageUrl' | 'imageHint'>>) => {
  allTitles = allTitles.map(title => 
    title.id === id ? { ...title, ...updatedData } : title
  );
};

export const deleteTitle = (id: string) => {
  allTitles = allTitles.filter(title => title.id !== id);
};


export const getWatching = () =>
  allTitles.filter(
    (t) => t.status === 'Watching' && t.type === 'Anime'
  );
export const getReading = () =>
  allTitles.filter((t) => t.status === 'Reading' && t.type === 'Manga');
export const getPlanned = () => allTitles.filter((t) => t.status === 'Planned');
export const getCompleted = () =>
  allTitles.filter((t) => t.status === 'Completed');
export const getPopular = () => allTitles.slice(0, 8);
export const getSearchResults = (query: string) => {
  if (!query) return [];
  return allTitles.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );
};

export const getStats = () => {
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
  const avgScore = (
    allTitles
      .filter((t) => t.score > 0)
      .reduce((sum, t) => sum + t.score, 0) /
    allTitles.filter((t) => t.score > 0).length
  ).toFixed(2);

  return [
    { label: 'Anime Watched', value: animeWatched, change: '+2' },
    { label: 'Manga Read', value: mangaRead, change: '+1' },
    { label: 'Episodes Watched', value: episodesWatched, change: '+120' },
    { label: 'In Progress', value: inProgress, change: '-1' },
    { label: 'Total Entries', value: totalEntries, change: '+3' },
    { label: 'Avg. Score', value: avgScore, change: '+0.1' },
  ];
};

export const getRecentActivity = () => [
  { name: 'Jan', anime: 30, manga: 20 },
  { name: 'Feb', anime: 45, manga: 35 },
  { name: 'Mar', anime: 28, manga: 18 },
  { name: 'Apr', anime: 52, manga: 42 },
  { name: 'May', anime: 60, manga: 50 },
  { name: 'Jun', anime: 35, manga: 25 },
];

export const getStatusDistribution = () => {
    const watching = allTitles.filter(t => t.status === 'Watching').length;
    const reading = allTitles.filter(t => t.status === 'Reading').length;
    const planned = allTitles.filter(t => t.status === 'Planned').length;
    const completed = allTitles.filter(t => t.status === 'Completed').length;
    return [
        { name: 'Watching', value: watching, fill: 'var(--color-watching)' },
        { name: 'Reading', value: reading, fill: 'var(--color-reading)' },
        { name: 'Planned', value: planned, fill: 'var(--color-planned)' },
        { name: 'Completed', value: completed, fill: 'var(--color-completed)' },
    ]
}
