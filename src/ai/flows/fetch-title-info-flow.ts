
'use server';
/**
 * @fileOverview An AI flow to extract anime/manga information from a URL.
 *
 * - fetchTitleInfo - A function that takes a URL and returns structured data about a title.
 * - FetchTitleInfoInput - The input type for the fetchTitleInfo function.
 * - FetchTitleInfoOutput - The return type for the fetchTitleinfo function.
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
      'The direct, absolute URL for the cover image. Must be a URL to an image file (e.g., .jpg, .png, .webp), not a URL to a web page.'
    ),
  total: z
    .number()
    .describe(
      'The total number of episodes or chapters available on the page.'
    ),
  type: z.enum(['Anime', 'Manga', 'Manhwa']).describe("The media type, one of 'Anime', 'Manga', or 'Manhwa'."),
});
export type FetchTitleInfoOutput = z.infer<typeof FetchTitleInfoOutputSchema>;


const ScraperPromptInputSchema = z.object({
    url: z.string().url(),
    htmlContent: z.string(),
});

const prompt = ai.definePrompt({
  name: 'fetchTitleInfoPrompt',
  input: { schema: ScraperPromptInputSchema },
  output: { schema: FetchTitleInfoOutputSchema },
  prompt: `You are an expert web scraper. Your task is to analyze the provided HTML content and extract the requested information in the specified JSON format. The URL is provided for context.

URL: {{{url}}}

HTML Content:
\`\`\`html
{{{htmlContent}}}
\`\`\`

You must extract the following details:
1.  **title**: The official title of the series. Find this in the main heading (like <h1>) or the page <title> tag.
2.  **imageUrl**: The direct, absolute URL for the main cover image or poster. Look for the most prominent image, often inside a component that looks like a card or poster. A meta tag like <meta property="og:image" ...> is a good fallback. This must be a URL to an image file (e.g., .jpg, .png, .webp), not a link to another web page.
3.  **total**: The total number of episodes (for Anime) or chapters (for Manga/Manhwa).
    -   **CRITICAL**: You must find the list of episodes or chapters in the HTML. The total is the number of the LATEST or HIGHEST episode/chapter available. For example, if you see "Chapter 95", "Chapter 94", etc., the total is 95.
    -   If it is a movie with only one part, return 1.
    -   If you absolutely cannot find an episode or chapter list in the HTML, default to 1.
4.  **type**: Determine if it is 'Anime', 'Manga', or 'Manhwa'.
    - If the content mentions "episodes" or "anime", it is 'Anime'.
    - If the content or URL mentions "manhwa" or "webtoon", or if the site is a known manhwa-focused site (like asurascans, omegascans), it is 'Manhwa'.
    - Otherwise, if it has "chapters", assume it is 'Manga'.`,
});


export async function fetchTitleInfo(
  input: FetchTitleInfoInput
): Promise<FetchTitleInfoOutput> {
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
    });

    if (!output) {
      throw new Error('AI model failed to return structured output from the HTML content.');
    }
    
    // Ensure imageUrl is an absolute URL
    if (output.imageUrl && !output.imageUrl.startsWith('http')) {
      const urlObject = new URL(input.url);
      output.imageUrl = new URL(output.imageUrl, `${urlObject.protocol}//${urlObject.hostname}`).href;
    }

    return output;
  } catch (error: any) {
    console.error(`[fetchTitleInfo] Failed to process URL ${input.url}:`, error);
    throw new Error(`The AI failed to extract information from the URL. Please check if the URL is correct and public. Reason: ${error.message}`);
  }
}
