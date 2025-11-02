
'use server';
/**
 * @fileOverview A flow to extract top anime/manga titles from a homepage URL.
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
    imageUrl: z.string().url().describe("The direct, absolute URL to the title's cover image."),
});

const FetchTopTitlesOutputSchema = z.array(TopTitleSchema).length(5).describe('A list of the top 5 titles found on the page.');
export type FetchTopTitlesOutput = z.infer<typeof FetchTopTitlesOutputSchema>;

const ScraperPromptInputSchema = z.object({
    url: z.string().url(),
    htmlContent: z.string(),
    type: z.enum(['Anime', 'Manga']),
});

const prompt = ai.definePrompt({
    name: 'fetchTopTitlesPrompt',
    input: { schema: ScraperPromptInputSchema },
    output: { schema: FetchTopTitlesOutputSchema },
    prompt: `You are an expert web scraper. Your task is to analyze the provided HTML content and extract a list of the top 5 titles for the specified media type.

URL: {{{url}}}
Type: {{{type}}}

HTML Content:
\`\`\`html
{{{htmlContent}}}
\`\`\`

You must extract the following details for the top 5 titles:
1.  **title**: The official title of the series.
2.  **imageUrl**: The direct, absolute URL for the main cover image or poster. This must be a URL to an image file (e.g., .jpg, .png, .webp), not a link to another web page.

Return the data as an array of 5 objects.`,
});


export async function fetchTopTitles(
  input: FetchTopTitlesInput
): Promise<FetchTopTitlesOutput> {
  try {
    const response = await fetch(input.url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const htmlContent = await response.text();

    const { output } = await prompt({
        url: input.url,
        htmlContent: htmlContent,
        type: input.type,
    });
    
    if (!output) {
      throw new Error('AI model failed to return structured output from the HTML content.');
    }

    // Ensure all imageUrls are absolute
    const absoluteOutput = output.map(item => {
      if (item.imageUrl && !item.imageUrl.startsWith('http')) {
        const urlObject = new URL(input.url);
        return {
          ...item,
          imageUrl: new URL(item.imageUrl, `${urlObject.protocol}//${urlObject.hostname}`).href
        };
      }
      return item;
    });

    return absoluteOutput;
  } catch (error: any) {
    console.error(`[fetchTopTitles] Failed to process URL ${input.url}:`, error);
    throw new Error(`The AI failed to extract top titles from the URL. Reason: ${error.message}`);
  }
}
