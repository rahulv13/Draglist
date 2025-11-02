
'use server';
/**
 * @fileOverview A flow to fetch top anime/manga titles from the Anilist API.
 */

import { z } from 'genkit';

const FetchTopTitlesInputSchema = z.object({
  type: z.enum(['ANIME', 'MANGA']).describe('The type of media to look for.'),
});
export type FetchTopTitlesInput = z.infer<typeof FetchTopTitlesInputSchema>;

const TopTitleSchema = z.object({
  title: z.string().describe('The full title of the anime or manga.'),
  imageUrl: z.string().url().describe("The direct, absolute URL to the title's cover image."),
});

const FetchTopTitlesOutputSchema = z.array(TopTitleSchema);
export type FetchTopTitlesOutput = z.infer<typeof FetchTopTitlesOutputSchema>;

export async function fetchTopTitles(
  input: FetchTopTitlesInput
): Promise<FetchTopTitlesOutput> {
  console.log(`[DEBUG] Fetching top ${input.type} from Anilist API`);

  const query = `
    query ($type: MediaType, $sort: [MediaSort]) {
      Page(page: 1, perPage: 5) {
        media(type: $type, sort: $sort) {
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

  const variables = {
    type: input.type,
    sort: ['TRENDING_DESC', 'POPULARITY_DESC'],
  };

  try {
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
    
    console.log(`[DEBUG] Found ${titles.length} ${input.type} titles from Anilist`);

    return titles;

  } catch (err) {
    console.error(`Error fetching top titles from Anilist:`, err);
    return [];
  }
}
