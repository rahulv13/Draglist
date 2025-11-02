
'use server';
/**
 * @fileOverview A flow to extract top anime/manga titles from a homepage URL.
 *
 * - fetchTopTitles - A function that takes a URL and returns a list of top titles.
 * - FetchTopTitlesInput - The input type for the fetchTopTitles function.
 * - FetchTopTitlesOutput - The return type for the fetchTopTitles function.
 */

import { z } from 'genkit';
import * as cheerio from 'cheerio';

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
  // This function is disabled for now to prevent server instability and long load times.
  // Returning an empty array to ensure the app remains functional.
  return [];
}
