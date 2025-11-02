
'use server';
/**
 * @fileOverview A flow to fetch top anime/manga titles.
 * It uses the Anilist API for Anime, Manga, and Manhwa.
 */

import { z } from 'genkit';

const FetchTopTitlesInputSchema = z.object({
  type: z.enum(['ANIME', 'MANGA', 'MANHWA']).describe('The type of media to look for.'),
});
export type FetchTopTitlesInput = z.infer<typeof FetchTopTitlesInputSchema>;

const TopTitleSchema = z.object({
  title: z.string().describe('The full title of the anime or manga.'),
  imageUrl: z.string().url().describe("The direct, absolute URL to the title's cover image."),
});

const FetchTopTitlesOutputSchema = z.array(TopTitleSchema);
export type FetchTopTitlesOutput = z.infer<typeof FetchTopTitlesOutputSchema>;


const fetchFromAnilist = async (type: 'ANIME' | 'MANGA', format?: string): Promise<FetchTopTitlesOutput> => {
    const query = `
    query ($type: MediaType, $sort: [MediaSort], $format: MediaFormat) {
      Page(page: 1, perPage: 5) {
        media(type: $type, sort: $sort, format: $format) {
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

  const variables: { type: string, sort: string[], format?: string } = {
    type: type,
    sort: ['TRENDING_DESC', 'POPULARITY_DESC'],
  };

  if (format) {
    variables.format = format;
  }

  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch from Anilist API: ${res.statusText}`);
  }

  const json = await res.json();
  
  if (json.errors) {
    console.error('Anilist API returned errors:', json.errors);
    throw new Error('Anilist API returned errors.');
  }

  const titles = json.data.Page.media.map((media: any) => ({
    title: media.title.english || media.title.romaji,
    imageUrl: media.coverImage.large,
  }));
  
  return titles;
};

export async function fetchTopTitles(
  input: FetchTopTitlesInput
): Promise<FetchTopTitlesOutput> {
  
  try {
    if (input.type === 'MANHWA') {
      console.log(`[DEBUG] Fetching top MANHWA from Anilist API`);
      return await fetchFromAnilist('MANGA', 'MANHWA');
    } else {
      console.log(`[DEBUG] Fetching top ${input.type} from Anilist API`);
      return await fetchFromAnilist(input.type);
    }
  } catch (err) {
    console.error(`Error fetching top titles for ${input.type}:`, err);
    return [];
  }
}
