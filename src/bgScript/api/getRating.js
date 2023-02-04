import fetch from 'node-fetch';

//Scrape Vivino's search page to find the top matches for the wine being offered on LastBottle
export default async function getRating(query) {
    const response = await fetch(`https://www.vivino.com/search/wines?q=${encodeURIComponent(query)}`);
    const body = await response.text();
    return body;
}
