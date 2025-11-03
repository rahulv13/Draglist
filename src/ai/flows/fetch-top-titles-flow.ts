
'use server';
/**
 * @fileOverview Fetches top anime, manga, and manhwa titles from AniList API.
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
  type: z.enum(['Anime', 'Manga', 'Manhwa']).describe('The type of media.'),
});

const FetchTopTitlesOutputSchema = z.array(TopTitleSchema);
export type FetchTopTitlesOutput = z.infer<typeof FetchTopTitlesOutputSchema>;

const fetchFromAnilist = async (
  type: 'ANIME' | 'MANGA',
  format?: 'MANGA' | 'NOVEL' | 'ONE_SHOT' | 'MANHWA'
): Promise<FetchTopTitlesOutput> => {
  const query = `
    query ($type: MediaType, $sort: [MediaSort], $format_in: [MediaFormat]) {
      Page(page: 1, perPage: 5) {
        media(
          type: $type,
          sort: $sort,
          format_in: $format_in,
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

  if (format) variables.format_in = [format];

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
    let total = m.episodes || m.chapters;
    // If episodes/chapters is null (ongoing anime), try to get the next airing episode
    if (total === null && m.nextAiringEpisode) {
      total = m.nextAiringEpisode.episode - 1;
    }

    const detectedType =
      type === 'ANIME'
        ? 'Anime'
        : format === 'MANHWA'
        ? 'Manhwa'
        : 'Manga';
    
    return {
      title: m.title.english || m.title.romaji,
      imageUrl: m.coverImage.large,
      total: total > 0 ? total : 0, // Default to 0 if null or less
      type: detectedType,
    };
  });
};

export async function fetchTopTitles(
  input: FetchTopTitlesInput
): Promise<FetchTopTitlesOutput> {
  try {
    switch (input.type) {
      case 'ANIME':
        return await fetchFromAnilist('ANIME');
      case 'MANGA':
        return await fetchFromAnilist('MANGA', 'MANGA');
      case 'MANHWA':
        return await fetchFromAnilist('MANGA', 'MANHWA');
      default:
        return [];
    }
  } catch (err) {
    console.error(`Error fetching top ${input.type}:`, err);
    return [];
  }
}
