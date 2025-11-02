
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
  try {
    const res = await fetch(input.url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118 Safari/537.36',
      },
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    const titles: FetchTopTitlesOutput = [];

    // Scrape logic for anikai.to (Anime)
    if (input.url.includes('anikai.to')) {
        $('.film_list-wrap .film-poster').each((_, el) => {
            const link = $(el).find('a');
            const title = link.attr('title');
            const imageUrl = $(el).find('img.film-poster-img').attr('data-src');

            if (title && imageUrl) {
                const absoluteUrl = imageUrl.startsWith('http') ? imageUrl : new URL(imageUrl, input.url).href;
                if (titles.length < 5) {
                    titles.push({ title, imageUrl: absoluteUrl });
                }
            }
        });
    }

    // Scrape logic for asuracomic.net (Manga)
    if (input.url.includes('asuracomic.net')) {
        $('.listupd .bs').each((_, el) => {
             const link = $(el).find('a');
             const title = link.attr('title');
             const imageUrl = $(el).find('img').attr('src');

             if (title && imageUrl) {
                const absoluteUrl = imageUrl.startsWith('http') ? imageUrl : new URL(imageUrl, input.url).href;
                if (titles.length < 5) {
                    titles.push({ title, imageUrl: absoluteUrl });
                }
             }
        });
    }

    return titles;
  } catch (err) {
    console.error(`Error fetching top titles from ${input.url}:`, err);
    return [];
  }
}
