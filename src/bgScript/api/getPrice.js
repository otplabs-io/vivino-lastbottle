import fetch from 'node-fetch';

//Get the price data from Vivino's API. Use a parent ID to aggregate price across vintages.
export default async function getPrice(query) {
  //Set a default value for the wine price in case none is found.
  let winePrice = "N/A";
  
  //Get the price of the wine based on the ID pulled from the search results.
  try{
    const response = await fetch(`https://api.vivino.com/v/9.0.0/buyable_wines?country_code=us&state=Florida&wine=${encodeURIComponent(query)}`);
    const data = await response.json();

    let responsePrice = data.source_data.price;
    if(!isNaN(responsePrice) && responsePrice !== null){
          winePrice = (Math.round(responsePrice * 100) / 100).toFixed(2);
    }
    return winePrice;
    
  } 
  catch (e) {
    //In this case, data.source_data.price did not exist in the response data. That means there is no pricing data available for this wine.
    return winePrice;
  }
}
