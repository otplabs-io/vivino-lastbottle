import cheerio from "cheerio";
import { axios } from "./axios";


export default async function getPrice(query) {
  let winePrice = "N/A";
  
  //Get the price of the wine based on the ID pulled from the search results
  try{
    const response = await axios.get(
      `https://api.vivino.com/v/9.0.0/buyable_wines?country_code=us&state=Florida&wine=${encodeURIComponent(query)}`,
      { withCredentials: true }
    );

    let responsePrice = response.data.source_data.price;
    if(!isNaN(responsePrice) && responsePrice !== null){
          winePrice = (Math.round(responsePrice * 100) / 100).toFixed(2);
    }
    return winePrice;
  } 
  catch (e) {
    return "N/A";
  }
}
