'use server';
/**
 * @fileOverview An AI flow to extract anime/manga information from a URL.
 *
 * - fetchTitleInfo - A function that takes a URL and returns structured data about a title.
 * - FetchTitleInfoInput - The input type for the fetchTitleInfo function.
 * - FetchTitleInfoOutput - The return type for the fetchTitleInfo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FetchTitleInfoInputSchema = z.object({
  url: z.string().url().describe('The URL of the anime or manga page.'),
});
export type FetchTitleInfoInput = z.infer<typeof FetchTitleInfoInputSchema>;

const FetchTitleInfoOutputSchema = z.object({
  title: z
    .string()
    .describe('The full title of the anime or manga.'),
  imageUrl: z
    .string()
    .url()
    .describe("The direct URL to the title's cover image."),
  total: z
    .number()
    .describe('The total number of episodes (for anime) or chapters (for manga). If it is ongoing or unknown, return 0.'),
  type: z
    .enum(['Anime', 'Manga'])
    .describe('The type of media.'),
});
export type FetchTitleInfoOutput = z.infer<typeof FetchTitleInfoOutputSchema>;

export async function fetchTitleInfo(
  input: FetchTitleInfoInput
): Promise<FetchTitleInfoOutput> {
  return fetchTitleInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fetchTitleInfoPrompt',
  input: { schema: FetchTitleInfoInputSchema },
  output: { schema: FetchTitleInfoOutputSchema },
  prompt: `You are a web scraping expert specializing in anime and manga websites. Your task is to extract specific information from the provided URL.

You must extract the following details:
1.  **Title**: The official title of the series.
2.  **Image URL**: The direct, absolute URL for the cover image.
3.  **Total**: The total number of episodes or chapters. If the series is ongoing, still airing, or the total count is not clearly stated, you must return 0.
4.  **Type**: Determine if it is an "Anime" or a "Manga".

Visit the URL provided and return the information in the specified JSON format.

URL: {{{url}}}`,
});

const fetchTitleInfoFlow = ai.defineFlow(
  {
    name: 'fetchTitleInfoFlow',
    inputSchema: FetchTitleInfoInputSchema,
    outputSchema: FetchTitleInfoOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to extract title information from the URL.');
    }
    return output;
  }
);
