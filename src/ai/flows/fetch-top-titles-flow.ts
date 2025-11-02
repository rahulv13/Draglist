
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

const FetchTopTitlesOutputSchema = z.array(TopTitleSchema).length(5).describe('A list of the top 5 titles found on the page.');
export type FetchTopTitlesOutput = z.infer<typeof FetchTopTitlesOutputSchema>;

const siteScrapers: { [key: string]: (html: string, baseUrl: string) => FetchTopTitlesOutput } = {
  'anikai.to': (html, baseUrl) => {
    const $ = cheerio.load(html);
    const titles: { title: string; imageUrl: string }[] = [];
    $('.swiper-slide-popular').slice(0, 5).each((_, el) => {
        const title = $(el).find('.film-title a').text().trim();
        let imageUrl = $(el).find('.film-poster-img').attr('data-src') || '';
        if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = new URL(imageUrl, baseUrl).href;
        }
        if (title && imageUrl) {
            titles.push({ title, imageUrl });
        }
    });
    return titles as FetchTopTitlesOutput;
  },
  'asuracomic.net': (html, baseUrl) => {
    const $ = cheerio.load(html);
    const titles: { title: string; imageUrl: string }[] = [];
    $('div.bsx').slice(0, 5).each((_, el) => {
      const title = $(el).find('a').attr('title');
      let imageUrl = $(el).find('img').attr('src') || '';
       if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = new URL(imageUrl, baseUrl).href;
        }
      if (title && imageUrl) {
        titles.push({ title, imageUrl });
      }
    });
    return titles as FetchTopTitlesOutput;
  }
};


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
    const url = new URL(input.url);
    const domain = url.hostname.replace('www.', '');

    const scraper = siteScrapers[domain];

    if (!scraper) {
        throw new Error(`No scraper available for domain: ${domain}`);
    }

    const results = scraper(htmlContent, input.url);
    
    // Ensure all imageUrls are absolute
    const absoluteOutput = results.map(item => {
      if (item.imageUrl && !item.imageUrl.startsWith('http')) {
        return {
          ...item,
          imageUrl: new URL(item.imageUrl, `${url.protocol}//${url.hostname}`).href
        };
      }
      return item;
    });

    return absoluteOutput;
  } catch (error: any) {
    console.error(`[fetchTopTitles] Failed to process URL ${input.url}:`, error);
    // Return an empty array on failure so the UI doesn't break
    return [];
  }
}
