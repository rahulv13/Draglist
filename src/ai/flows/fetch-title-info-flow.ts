
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
  title: z.string().describe('The official title of the anime or manga.'),
  imageUrl: z
    .string()
    .url()
    .describe(
      "The direct, absolute URL for the cover image. Must be a URL to an image file (e.g., .jpg, .png, .webp), not a URL to a web page."
    ),
  total: z
    .number()
    .describe(
      'The total number of episodes or chapters available on the page.'
    ),
  type: z.enum(['Anime', 'Manga']).describe("The media type, either 'Anime' or 'Manga'."),
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
  prompt: `You are an expert web scraper. Your task is to visit the provided URL, render the page as a user would see it (including content loaded by JavaScript), and extract the requested information in the specified JSON format.

URL: {{{url}}}

You must extract the following details:
1.  **title**: The official title of the series. Find this in the main heading (like <h1>) or the page title.
2.  **imageUrl**: The direct, absolute URL for the cover image. This must be a URL to an image file (e.g., .jpg, .png, .webp), not a link to another web page.
3.  **total**: The total number of episodes (for Anime) or chapters (for Manga) available.
    -   **CRITICAL**: You must find the list of episodes or chapters on the page. The total is the number of the LATEST or HIGHEST episode/chapter available. For example, if you see "Chapter 95", "Chapter 94", etc., the total is 95.
    -   If it is a movie with only one part, return 1.
    -   If you absolutely cannot find an episode or chapter list, default to 1.
4.  **type**: Determine if it is 'Anime' or 'Manga'. If the page content mentions "chapters", it is 'Manga'. Otherwise, it is 'Anime'.`,
});

const fetchTitleInfoFlow = ai.defineFlow(
  {
    name: 'fetchTitleInfoFlow',
    inputSchema: FetchTitleInfoInputSchema,
    outputSchema: FetchTitleInfoOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error('AI model failed to return structured output.');
      }
       // Ensure imageUrl is an absolute URL
       if (output.imageUrl && !output.imageUrl.startsWith('http')) {
        const urlObject = new URL(input.url);
        output.imageUrl = new URL(output.imageUrl, `${urlObject.protocol}//${urlObject.hostname}`).href;
      }

      return output;

    } catch (error: any) {
        console.error(`[fetchTitleInfoFlow] Failed to process URL ${input.url}:`, error);
        throw new Error(`The AI failed to extract information from the URL. Please check if the URL is correct and public. Reason: ${error.message}`);
    }
  }
);

    