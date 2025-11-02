
'use server';
/**
 * @fileOverview A hybrid scraper to extract anime/manga information from a URL.
 *
 * - fetchTitleInfo - A function that takes a URL and returns structured data about a title.
 * - FetchTitleInfoInput - The input type for the fetchTitleInfo function.
 * - FetchTitleInfoOutput - The return type for the fetchTitleInfo function.
 */

import { z } from 'genkit';
import * as cheerio from 'cheerio';

const FetchTitleInfoInputSchema = z.object({
  url: z.string().url().describe('The URL of the anime or manga page.'),
});
export type FetchTitleInfoInput = z.infer<typeof FetchTitleInfoInputSchema>;

const FetchTitleInfoOutputSchema = z.object({
  title: z.string(),
  imageUrl: z.string().url(),
  total: z.number(),
  type: z.enum(['Anime', 'Manga']),
});
export type FetchTitleInfoOutput = z.infer<typeof FetchTitleInfoOutputSchema>;

export async function fetchTitleInfo(
  input: FetchTitleInfoInput
): Promise<FetchTitleInfoOutput> {
  try {
    const response = await fetch(input.url, {
      headers: {
        // Use a common user-agent to avoid being blocked
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // --- Try scraping title ---
    let title =
      $('meta[property="og:title"]').attr('content') ||
      $('h1').first().text().trim() ||
      $('title').first().text().trim() ||
      'Unknown Title';

    // --- Try scraping cover image ---
    let imageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('img[src*="cover"], img[src*="poster"]').first().attr('src') ||
      $('img').first().attr('src') ||
      '';
    
    // Ensure imageUrl is absolute
    if (imageUrl && !imageUrl.startsWith('http')) {
        const urlObject = new URL(input.url);
        imageUrl = `${urlObject.protocol}//${urlObject.hostname}${imageUrl}`;
    }


    // --- Try scraping episodes or chapters ---
    const textContent = $('body').text();

    const episodeMatches =
      textContent.match(/(?:Episode|Ep\.|Chapter|Ch\.)\s?(\d+)/gi) || [];
    const numbers = episodeMatches
      .map((m) => parseInt(m.replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n));

    const total = numbers.length ? Math.max(...numbers) : 1;

    // --- Determine type ---
    const type =
      input.url.includes('manga') ||
      textContent.toLowerCase().includes('chapter')
        ? 'Manga'
        : 'Anime';

    // Basic validation
    if (!imageUrl) {
        throw new Error('Could not find an image URL.');
    }

    return { title, imageUrl, total, type };
  } catch (error: any) {
    console.error('Error fetching title info:', error);
    // Re-throw a simpler error to the client
    throw new Error(`Failed to scrape title info from the provided URL. Reason: ${error.message}`);
  }
}
