import cheerio from "cheerio";
import { axios } from "./axios";

const extractRating = (html, query) => {
  const $ = cheerio.load(html);

  let wines = [];
  $(".card").each((index, element) => {
    const name = $(element)
      .find(".wine-card__name .link-color-alt-grey")
      .text()
      .trim();
    const score = $(element)
      .find(".average__number")
      .text()
      .trim()
      .replace(",", ".");
    const numOfReviews = $(element)
      .find(".average__stars .text-micro")
      .text()
      .trim();
    const imageCSS = $(element)
      .find(".wine-card__image")
      .css("background-image");
    //This gets the image used on the search page. It's a square image with lots of white space.
    const image = imageCSS.replace('url(','').replace(')','');
    //This gets the equivalent image that's used on the product details page. This one is trimmed of white space. 
    const trimmedImage = image.replace('300x300','x600');
    const href = $(element).find("a").attr("href");
    const url = 'https://www.vivino.com' + href;
    const id = url.split("/").pop();
    const parentID = $(element)
      .find(".default-wine-card")
      .attr("data-wine");
    //The price isn't populated in the HTML on page load.  We have to make an additional call to get that.

    if (!name) {
      return;
    }

    wines.push({
      id,
      parentID,
      name,
      score: parseFloat(score),
      numOfReviews: parseFloat(numOfReviews),
      image,
      trimmedImage,
      url,
    });
  });

  return wines;
};

export default async function getRating(query) {
  const response = await axios.get(
    `https://www.vivino.com/search/wines?q=${encodeURIComponent(query)}`,
    { withCredentials: true }
  );

  return extractRating(response.data, query);
}
