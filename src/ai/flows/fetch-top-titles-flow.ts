'use server';
/**
 * @fileOverview An AI flow to extract top anime/manga titles from a homepage URL.
 *
 * - fetchTopTitles - A function that takes a URL and returns a list of top titles.
 * - FetchTopTitlesInput - The input type for the fetchTopTitles function.
 * - FetchTopTitlesOutput - The return type for the fetchTopTitles function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FetchTopTitlesInputSchema = z.object({
  url: z.string().url().describe('The URL of the page listing top titles.'),
  type: z.enum(['Anime', 'Manga']).describe('The type of media to look for.'),
});
export type FetchTopTitlesInput = z.infer<typeof FetchTopTitlesInputSchema>;

const TopTitleSchema = z.object({
    title: z.string().describe('The full title of the anime or manga.'),
    imageUrl: z.string().url().describe("The direct URL to the title's cover image."),
});

const FetchTopTitlesOutputSchema = z.array(TopTitleSchema).length(5).describe('A list of the top 5 titles found on the page.');
export type FetchTopTitlesOutput = z.infer<typeof FetchTopTitlesOutputSchema>;

export async function fetchTopTitles(
  input: FetchTopTitlesInput
): Promise<FetchTopTitlesOutput> {
  return fetchTopTitlesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fetchTopTitlesPrompt',
  input: { schema: FetchTopTitlesInputSchema },
  output: { schema: FetchTopTitlesOutputSchema },
  prompt: `You are a web scraping expert specializing in anime and manga websites. Your task is to visit the provided URL and identify the top 5 most popular or trending titles of the specified type.

You must extract the following details for each of the top 5 titles:
1.  **Title**: The official title of the series.
2.  **Image URL**: The direct, absolute URL for the cover image.

Visit the URL provided, find the section for top/trending/popular titles, and return the information for the top 5 in the specified JSON array format.

URL: {{{url}}}
Type: {{{type}}}`,
});

const fetchTopTitlesFlow = ai.defineFlow(
  {
    name: 'fetchTopTitlesFlow',
    inputSchema: FetchTopTitlesInputSchema,
    outputSchema: FetchTopTitlesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to extract top titles from the URL.');
    }
    return output;
  }
);
