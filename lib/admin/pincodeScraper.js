import * as cheerio from 'cheerio';

export async function scrapePincodesForState(externalStateId) {
     if (!externalStateId) {
          throw new Error("External State ID is required for scraping");
     }

     const url = `http://www.postalpincode.in/Search-By-Location?StateId=${externalStateId}`;

     try {
          const response = await fetch(url);
          if (!response.ok) {
               throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
          }
          const html = await response.text();
          const $ = cheerio.load(html);

          const pincodes = [];

          // Select all options inside the PIN code dropdown
          $("#ContentPlaceHolder1_ddlPINCode option").each((_, el) => {
               const value = $(el).attr("value");

               // Skip "0" (Select PIN Code)
               if (value && value !== "0") {
                    pincodes.push(value);
               }
          });

          return pincodes;

     } catch (error) {
          console.error(`[Scraper] Error scraping state ${externalStateId}:`, error);
          throw error;
     }
}
