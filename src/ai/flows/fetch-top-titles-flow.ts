'use server';
/**
 * @fileOverview A flow to extract top anime/manga titles from Anikai homepage.
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

const FetchTopTitlesOutputSchema = z.array(TopTitleSchema);
export type FetchTopTitlesOutput = z.infer<typeof FetchTopTitlesOutputSchema>;

export async function fetchTopTitles(
  input: FetchTopTitlesInput
): Promise<FetchTopTitlesOutput> {
  console.log(`[DEBUG] Fetching top ${input.type} from ${input.url}`);

  try {
    // Use Jina proxy to render JS content
    const proxyUrl = `https://r.jina.ai/${input.url}`;
    const res = await fetch(proxyUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118 Safari/537.36',
      },
    });

    if (!res.ok) throw new Error(`Failed to fetch from proxy: ${res.statusText}`);

    const html = await res.text();

    // Parse text with cheerio
    const $ = cheerio.load(html);

    const titles: FetchTopTitlesOutput = [];

    // This logic is specific to anikai.to's structure
    if (input.url.includes('anikai.to')) {
        $('img').each((i, el) => {
            if (titles.length >= 5) return false; 
    
            const imageUrl = $(el).attr('src');
            const altText = $(el).attr('alt') || '';
    
            if (imageUrl && altText && altText.trim() !== "") {
                titles.push({
                title: altText.trim(),
                imageUrl: imageUrl.startsWith('http')
                    ? imageUrl
                    : new URL(imageUrl, 'https://anikai.to').href,
                });
            }
        });
    }
    // This logic is specific to asuracomic.net's structure
    else if (input.url.includes('asuracomic.net')) {
        $('.listupd .bsx a').each((i, el) => {
            if (titles.length >= 5) return false;

            const title = $(el).attr('title');
            const imageUrl = $(el).find('img').attr('src');

            if (title && imageUrl) {
                 titles.push({
                    title: title.trim(),
                    imageUrl: imageUrl.startsWith('http') ? imageUrl : new URL(imageUrl, 'https://asuracomic.net').href,
                });
            }
        });
    }

    console.log(`[DEBUG] Found ${titles.length} ${input.type} titles from ${input.url}`);

    return titles.slice(0, 5);
  } catch (err) {
    console.error(`Error fetching top titles from ${input.url}:`, err);
    return [];
  }
}
