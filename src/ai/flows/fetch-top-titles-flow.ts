
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


const scrapeAnikai = ($: cheerio.CheerioAPI): FetchTopTitlesOutput => {
    const titles: FetchTopTitlesOutput = [];
    $('.hl-list .hl-item').slice(0, 5).each((i, el) => {
        const title = $(el).find('.hl-title').text().trim();
        let imageUrl = $(el).find('.hl-cover img').attr('src') || '';
        if (imageUrl) {
            titles.push({ title, imageUrl });
        }
    });
    return titles;
};

const scrapeAsura = ($: cheerio.CheerioAPI): FetchTopTitlesOutput => {
    const titles: FetchTopTitlesOutput = [];
    $('.listupd .bs').slice(0, 5).each((i, el) => {
        const title = $(el).find('.tt').text().trim();
        let imageUrl = $(el).find('img').attr('src') || '';
        if (imageUrl) {
            titles.push({ title, imageUrl });
        }
    });
    return titles;
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
    const $ = cheerio.load(htmlContent);

    let output: FetchTopTitlesOutput;

    if (input.url.includes('anikai.to')) {
        output = scrapeAnikai($);
    } else if (input.url.includes('asuracomic.net')) {
        output = scrapeAsura($);
    } else {
        // Generic fallback (less reliable)
        output = [];
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
    // Return an empty array on failure to prevent the page from crashing.
    return [];
  }
}
