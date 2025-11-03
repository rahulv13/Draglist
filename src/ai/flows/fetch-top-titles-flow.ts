
'use server';
/**
 * @fileOverview Fetches top anime, manga, and manhwa titles.
 * Uses Anilist API for Anime and MangaDex API for Manga/Manhwa.
 */

import { z } from 'genkit';

const FetchTopTitlesInputSchema = z.object({
  type: z.enum(['ANIME', 'MANGA', 'MANHWA']).describe('The type of media to look for.'),
});
export type FetchTopTitlesInput = z.infer<typeof FetchTopTitlesInputSchema>;

const TopTitleSchema = z.object({
  title: z.string().describe('The full title of the anime or manga.'),
  imageUrl: z.string().url().describe("The direct, absolute URL to the title's cover image."),
  total: z.number().nullable().describe('Total number of episodes or chapters.'),
});

const FetchTopTitlesOutputSchema = z.array(TopTitleSchema);
export type FetchTopTitlesOutput = z.infer<typeof FetchTopTitlesOutputSchema>;

const fetchFromAnilist = async (
  type: 'ANIME' | 'MANGA',
  countryOfOrigin?: 'JP' | 'KR' | 'CN'
): Promise<FetchTopTitlesOutput> => {
  const query = `
    query ($type: MediaType, $sort: [MediaSort], $countryOfOrigin: CountryCode) {
      Page(page: 1, perPage: 5) {
        media(
          type: $type,
          sort: $sort,
          countryOfOrigin: $countryOfOrigin,
          status_not_in: [NOT_YET_RELEASED]
        ) {
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          episodes
          chapters
          nextAiringEpisode {
            episode
          }
        }
      }
    }
  `;

  const variables: Record<string, any> = {
    type,
    sort: ['TRENDING_DESC', 'POPULARITY_DESC'],
  };

  if (countryOfOrigin) variables.countryOfOrigin = countryOfOrigin;

  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`Anilist fetch failed: ${res.statusText}`);

  const json = await res.json();
  const data = json.data?.Page?.media ?? [];

  return data.map((m: any) => {
    let total = m.chapters || m.episodes; 
    if (total === null && m.nextAiringEpisode) {
      total = m.nextAiringEpisode.episode - 1;
    }
    return {
        title: m.title.english || m.title.romaji,
        imageUrl: m.coverImage.large,
        total: total > 0 ? total : 0, 
    }
  });
};

const fetchFromMangaDex = async (
    contentRating: 'safe' | 'suggestive' = 'safe'
  ): Promise<FetchTopTitlesOutput> => {
    try {
      const url = new URL('https://api.mangadex.org/manga');
      url.searchParams.set('limit', '5');
      url.searchParams.set('order[followedCount]', 'desc');
      url.searchParams.append('contentRating[]', contentRating);
      url.searchParams.append('includes[]', 'cover_art');
  
      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`MangaDex API request failed: ${res.statusText}`);
      }
  
      const json = await res.json();
      const mangaList = json.data || [];
  
      return mangaList.map((manga: any) => {
        const coverArt = manga.relationships.find((r: any) => r.type === 'cover_art');
        const fileName = coverArt?.attributes?.fileName;
        const imageUrl = fileName
          ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}`
          : 'https://placehold.co/400x600/27272a/71717a?text=No+Cover';
        
        const lastChapter = manga.attributes.lastChapter ? parseFloat(manga.attributes.lastChapter) : 0;
        
        return {
          title: manga.attributes.title.en || manga.attributes.title[Object.keys(manga.attributes.title)[0]],
          imageUrl: imageUrl,
          total: !isNaN(lastChapter) ? lastChapter : 0,
        };
      });
    } catch (error) {
      console.error('Failed to fetch from MangaDex:', error);
      return [];
    }
};

export async function fetchTopTitles(
  input: FetchTopTitlesInput
): Promise<FetchTopTitlesOutput> {
  try {
    switch (input.type) {
      case 'ANIME':
        return await fetchFromAnilist('ANIME', 'JP');
      case 'MANGA':
        // Using MangaDex for better chapter data
        return await fetchFromMangaDex();
      case 'MANHWA':
        // MangaDex is also great for Manhwa (often tagged as manga)
        return await fetchFromMangaDex();
      default:
        return [];
    }
  } catch (err) {
    console.error(`Error fetching top ${input.type}:`, err);
    return [];
  }
}
