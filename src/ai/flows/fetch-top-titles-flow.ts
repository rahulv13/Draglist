
'use server';
/**
 * @fileOverview A flow to fetch top anime/manga titles.
 * It uses the Anilist API for Anime and Manga, and scrapes omegascans.org for Manhwa.
 */

import { z } from 'genkit';
import * as cheerio from 'cheerio';

const FetchTopTitlesInputSchema = z.object({
  type: z.enum(['ANIME', 'MANGA', 'MANHWA']).describe('The type of media to look for.'),
});
export type FetchTopTitlesInput = z.infer<typeof FetchTopTitlesInputSchema>;

const TopTitleSchema = z.object({
  title: z.string().describe('The full title of the anime or manga.'),
  imageUrl: z.string().url().describe("The direct, absolute URL to the title's cover image."),
});

const FetchTopTitlesOutputSchema = z.array(TopTitleSchema);
export type FetchTopTitlesOutput = z.infer<typeof FetchTopTitlesOutputSchema>;


const fetchFromAnilist = async (type: 'ANIME' | 'MANGA', format?: string): Promise<FetchTopTitlesOutput> => {
    const query = `
    query ($type: MediaType, $sort: [MediaSort], $format: MediaFormat) {
      Page(page: 1, perPage: 5) {
        media(type: $type, sort: $sort, format: $format) {
          title {
            romaji
            english
          }
          coverImage {
            large
          }
        }
      }
    }
  `;

  const variables: { type: string, sort: string[], format?: string } = {
    type: type,
    sort: ['TRENDING_DESC', 'POPULARITY_DESC'],
  };

  if (format) {
    variables.format = format;
  }

  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch from Anilist API: ${res.statusText}`);
  }

  const json = await res.json();
  
  if (json.errors) {
    console.error('Anilist API returned errors:', json.errors);
    throw new Error('Anilist API returned errors.');
  }

  const titles = json.data.Page.media.map((media: any) => ({
    title: media.title.english || media.title.romaji,
    imageUrl: media.coverImage.large,
  }));
  
  return titles;
};

const fetchFromOmegaScans = async (): Promise<FetchTopTitlesOutput> => {
    const url = 'https://omegascans.org/';
    console.log(`[DEBUG] Fetching from OmegaScans: ${url}`);
    const res = await fetch(url, {
        headers: {
            'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118 Safari/537.36',
        }
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch from OmegaScans: ${res.statusText}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    console.log(`[DEBUG] HTML loaded from OmegaScans. Length: ${html.length}`);

    const titles: FetchTopTitlesOutput = [];
    $('.list-item .list-item-style').each((i, el) => {
        if (i >= 5) return false; // stop after 5

        const a = $(el).find('a').first();
        const title = a.attr('title');
        const img = a.find('img').attr('src');
        
        console.log(`[DEBUG] Scraping item ${i}: title='${title}', img='${img}'`);

        if(title && img){
            titles.push({
                title,
                imageUrl: img
            })
        }
    });

    console.log(`[DEBUG] Found ${titles.length} titles from OmegaScans.`);
    return titles;
}


export async function fetchTopTitles(
  input: FetchTopTitlesInput
): Promise<FetchTopTitlesOutput> {
  
  try {
    if (input.type === 'MANHWA') {
      console.log(`[DEBUG] Fetching top ${input.type} from omegascans.org`);
      const titles = await fetchFromOmegaScans();
      console.log(`[DEBUG] Found ${titles.length} ${input.type} titles`);
      return titles;
    } else {
      console.log(`[DEBUG] Fetching top ${input.type} from Anilist API`);
      const titles = await fetchFromAnilist(input.type);
      console.log(`[DEBUG] Found ${titles.length} ${input.type} titles from Anilist`);
      return titles;
    }
  } catch (err) {
    console.error(`Error fetching top titles for ${input.type}:`, err);
    return [];
  }
}
