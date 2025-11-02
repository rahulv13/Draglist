
'use server';
/**
 * @fileOverview A flow to extract top anime/manga titles from a homepage URL.
 *
 * - fetchTopTitles - A function that takes a URL and returns a list of top titles.
 * - FetchTopTitlesInput - The input type for the fetchTopTitles function.
 * - FetchTopTitlesOutput - The return type for the fetchTopTitles function.
 */

import { z } from 'genkit';

const FetchTopTitlesInputSchema = z.object({
  url: z.string().url().describe('The URL of the page listing top titles.'),
  type: z.enum(['Anime', 'Manga']).describe('The type of media to look for.'),
});
export type FetchTopTitlesInput = z.infer<typeof FetchTopTitlesInputSchema>;

const TopTitleSchema = z.object({
    title: z.string().describe('The full title of the anime or manga.'),
    imageUrl: z.string().url().describe("The direct, absolute URL to the title's cover image."),
});

const FetchTopTitlesOutputSchema = z.array(TopTitleSchema).describe('A list of the top titles found on the page.');
export type FetchTopTitlesOutput = z.infer<typeof FetchTopTitlesOutputSchema>;

export async function fetchTopTitles(
  input: FetchTopTitlesInput
): Promise<FetchTopTitlesOutput> {
  console.log(`[DEBUG] Fetching top ${input.type} from ${input.url}`);
  try {
    const proxyUrl = `https://r.jina.ai/${input.url}`;
    const res = await fetch(proxyUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118 Safari/537.36',
      },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch from proxy: ${res.statusText}`);
    }

    const text = await res.text();
    const titles: FetchTopTitlesOutput = [];

    const titleMatches = [...text.matchAll(/Title:\s*(.+)/gi)];
    const imageMatches = [...text.matchAll(/Image URL:\s*(https?:\/\/[^ \]\n]+)/gi)];

    const numTitles = Math.min(titleMatches.length, imageMatches.length);

    for (let i = 0; i < numTitles; i++) {
        const title = titleMatches[i][1].trim();
        const imageUrl = imageMatches[i][1].trim();
        
        if (title && imageUrl) {
            titles.push({
                title: title,
                imageUrl: imageUrl,
            });
        }
    }
    
    console.log(`[DEBUG] Found ${titles.length} ${input.type} titles`);

    return titles.slice(0, 5);

  } catch (err) {
    console.error(`Error fetching top titles from ${input.url}:`, err);
    return [];
  }
}
