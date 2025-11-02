
'use server';
/**
 * @fileOverview A flow to fetch top anime/manga/manhwa titles.
 * Uses the Anilist GraphQL API for clean and consistent results.
 */

import { z } from 'genkit';

const FetchTopTitlesInputSchema = z.object({
  type: z.enum(['ANIME', 'MANGA', 'MANHWA']).describe('The type of media to fetch.'),
});
export type FetchTopTitlesInput = z.infer<typeof FetchTopTitlesInputSchema>;

const TopTitleSchema = z.object({
  title: z.string().describe('The full title of the anime, manga, or manhwa.'),
  imageUrl: z.string().url().describe("The direct, absolute URL to the title's cover image."),
});

const FetchTopTitlesOutputSchema = z.array(TopTitleSchema);
export type FetchTopTitlesOutput = z.infer<typeof FetchTopTitlesOutputSchema>;

/**
 * Fetch data from the Anilist GraphQL API.
 */
const fetchFromAnilist = async (
  type: 'ANIME' | 'MANGA',
  format?: string
): Promise<FetchTopTitlesOutput> => {
  const query = `
    query ($type: MediaType, $sort: [MediaSort], $format: MediaFormat) {
      Page(page: 1, perPage: 5) {
        media(type: $type, sort: $sort, format: $format, status_not_in: [NOT_YET_RELEASED]) {
          title {
            romaji
            english
          }
          coverImage {
            large
          }
        }
      }
    }
  `;

  const variables: Record<string, any> = {
    type,
    sort: ['TRENDING_DESC', 'POPULARITY_DESC'],
  };

  if (format) variables.format = format;

  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Anilist API request failed: ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors) {
    console.error('Anilist API returned errors:', json.errors);
    throw new Error('Anilist API returned errors.');
  }

  return json.data.Page.media.map((media: any) => ({
    title: media.title.english || media.title.romaji,
    imageUrl: media.coverImage.large,
  }));
};

/**
 * Main entry point: fetch top titles for ANIME, MANGA, or MANHWA.
 */
export async function fetchTopTitles(
  input: FetchTopTitlesInput
): Promise<FetchTopTitlesOutput> {
  try {
    switch (input.type) {
      case 'MANHWA':
        console.log('[DEBUG] Fetching top MANHWA titles from Anilist...');
        return await fetchFromAnilist('MANGA', 'MANHWA');
      case 'MANGA':
        console.log('[DEBUG] Fetching top MANGA titles from Anilist...');
        return await fetchFromAnilist('MANGA');
      case 'ANIME':
      default:
        console.log('[DEBUG] Fetching top ANIME titles from Anilist...');
        return await fetchFromAnilist('ANIME');
    }
  } catch (err) {
    console.error(`Error fetching ${input.type} titles:`, err);
    return [];
  }
}
