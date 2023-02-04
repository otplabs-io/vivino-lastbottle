import getRating from "./api/getRating";
import getPrice from "./api/getPrice";


function initializeScript() {
  //Only initialize on homepage of lastbottlewines.com or details page for previous listings
  const shouldInititialize =
    window.location.href == ("https://www.lastbottlewines.com/") || window.location.href.includes("https://www.lastbottlewines.com/product/detail/");
  if (!shouldInititialize) {
    return;
  }
  appendRating();
}

//Update the LastBottle DOM with results from Vivino
async function appendRating() {

  //Get the name of the wine being offered using the class of the tag. There should only be one.
  let sWineName = document.getElementsByClassName('offer-name')[0].innerHTML;
  //To maxmize likelihood of finding a match, remove reference to a specific vintage if one exists.
  if(!isNaN(sWineName.substring(sWineName.length - 4, sWineName.length))){sWineName = sWineName.substring(0, sWineName.length - 4);}
  //Clean up the string by removing any references to the wine being non-vintage
  sWineName = sWineName.replace('NV','').replace('N.V.','');
  //Finally, trim white space from the string
  sWineName = sWineName.trim();

  //If we were unable to get the name of the wine being offered, abort mission
  if (!sWineName) {
    return;
  }

  try {
    //Get rating, review, name, id, image, and link from Vivino
    const bodyHTML = await getRating(sWineName);
    //Parse the HTML and return array of results
    const wines = extractRating(bodyHTML);

    //Get the price value to show in the header. Handle cases where there are no results.
    //For the header, we round the price to the nearest dollar.
    let sPrice = 'N/A';
    if(wines.length>0){
      sPrice = await getPrice(wines[0]['parentID']);
      if(!isNaN(sPrice) && sPrice !== null){
          sPrice = (Math.round(sPrice * 100) / 100).toFixed(0);
      }
    }

    //Inject Vivino price into LastBottle
    let iPriceElements = document.getElementsByClassName('price-holder').length - 1;
    let sPriceDiv = '<div class="price-holder"><div class="strikethrough default"><em style="color:#ed1c24">$</em><span class="amount" style="color:#ed1c24">' + sPrice + '</span></div><p style="color:#ed1c24">Vivino</p></div>';
    document.getElementsByClassName('price-holder')[iPriceElements].innerHTML = sPriceDiv + document.getElementsByClassName('price-holder')[iPriceElements].innerHTML;

    //Update the offer-stats div to include a tab that lists the matches from Vivino
    document.getElementById("myTab").innerHTML += '<li class="nav-item offer-tab" role="menuitem" style="width: 33.3%;"><a class="" id="vivino-tab" data-toggle="tab" href="#vivino" role="tab" aria-controls="vivino" data-uw-rm-brl="false" aria-selected="false">Vivino Results</a></li>';
    //Resize those tabs
    const tabs = document.querySelectorAll('.offer-tab');
    tabs.forEach(tab => {
      tab.style.width = '33.3%';
    });

    //Add vivino tab panel content
    if(!wines){
      document.getElementById("myTabContent").innerHTML += '<div class="tab-pane fade" id="vivino" role="tabpanel" aria-labelledby="vivino"><div class="text-left"><p data-uw-rm-sr="">No matches found on Vivino. <br role="presentation" data-uw-rm-sr=""></p></div></div>';
    } else{
      var sTabHTML;
      sTabHTML = '<div class="tab-pane fade" id="vivino" role="tabpanel" aria-labelledby="vivino"><div class="text-left"><p data-uw-rm-sr="">';
      sTabHTML += '<section class="details-pane"></section>';
      //Declare some variables and then loop through the result set
      var resultName;
      var resultParentID;
      var resultPrice;
      var resultScore = 'No ratings';
      var resultNumOfReviews;
      var resultImage;
      var resultTrimmedImage;
      var resultURL;
      var ratingsDesc;

      //Show a maximum of 5 results. This is a somewhat arbitrary decision but made for a few reasons.
      // 1. To reduce the time to render results on page
      // 2. To be mindful of making too many API calls to Vivino
      // 3. After the first 5 results, the probability of finding a match drops off sharply
      let i = 0;
      while (i < wines.length && i<5){
        //Get values
        resultName = wines[i]['name'];
        resultParentID = wines[i]['parentID'];
        //Make async call go get price
        resultPrice = await getPrice(resultParentID);
        resultScore = wines[i]['score'];
        resultNumOfReviews = wines[i]['numOfReviews'];
        resultTrimmedImage = wines[i]['trimmedImage'];
        resultURL = wines[i]['url'];
        //Apply some formatting
        if(!isNaN(resultPrice)){
          resultPrice = '$ ' +resultPrice;
        }
        if(!isNaN(resultScore) && resultScore !== null){
          ratingsDesc = resultScore + '<strong>&#9733;</strong> (' + resultNumOfReviews + ' ratings)';
        }
        
        //Construct HTML
        sTabHTML += '<section class="details-pane"><h3 data-uw-rm-heading="level" role="heading" aria-level="2">' + resultName + '</h3>';
        sTabHTML += '<img src="' + resultTrimmedImage + '" alt="' + resultName + '" style="height:300px !important;width:auto !important;">';
        sTabHTML += '<ul class="tech-details">';
        sTabHTML += '<li><strong>Average Price</strong>: ' + resultPrice + '</li>';
        sTabHTML += '<li><strong>Average Rating</strong>: ' + ratingsDesc + '</li>';
        sTabHTML += '<li><strong>Additional Details</strong>: <a href="' + resultURL + '" target="_blank">Click here</a></li>';
        sTabHTML += '</ul>';
        sTabHTML += '</section>';

        i++;
      };
      //Close out div and inject HTML
      sTabHTML += '<br role="presentation" data-uw-rm-sr="">';
      sTabHTML += '</p></div></div>';
      document.getElementById("myTabContent").innerHTML += sTabHTML;

    }
    

  } catch (e) {
    console.log(`${sWineName} is not found on Vivino`);
  }
}


//Parse the search results HTML from Vivino and return them as an array.
const extractRating = (html) => {

    //Convert HTML String to Document
    var doc = new DOMParser().parseFromString(html, "text/html");
    
    // Get elements with class "card"
    let elements = doc.getElementsByClassName("card");

    // Store data on wines in an array
    let wines = [];

    // Iterate through the search result cards to get values
    for (let i = 0; i < elements.length; i++) {
      // Prevent errors by looping through the desired elements if they exist.  Allow max 1 result.
      
      // Get the wine name
      const nameElements = elements[i].getElementsByClassName("wine-card__name");
      let name = "";
      for (let j = 0; j < nameElements.length && j<1; j++) {
        name = nameElements[j].textContent.trim();
      }

      // Get the wine rating
      const scoreElements = elements[i].getElementsByClassName("average__number");
      let score = "";
      for (let j = 0; j < scoreElements.length && j<1; j++) {
        score = scoreElements[j].textContent.trim();
      }
      
      // Get the number of ratings
      const numOfReviewsElements = elements[i].getElementsByClassName("average__stars");
      let numOfReviews = "";
      for (let j = 0; j < numOfReviewsElements.length && j<1; j++) {
        numOfReviews = numOfReviewsElements[j].textContent.replace("ratings","").trim();
      }
      
      // Get the wine image
      const imageCSSElements = elements[i].getElementsByClassName("wine-card__image");
      let imageCSS = "", image = "", trimmedImage = "";
      for (let j = 0; j < imageCSSElements.length && j<1; j++) {
        imageCSS = imageCSSElements[j].style.backgroundImage;
        //Get the url from the text
        image = imageCSS.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        //This gets the equivalent image that's used on the product details page. This one is trimmed of white space. 
        trimmedImage = image.replace('300x300','x600');
      }

      // Get the link to the wine's details page
      const hrefElements = elements[i].getElementsByTagName("a");
      let href = "", url="";
      for (let j = 0; j < hrefElements.length && j<1; j++) {
        href = hrefElements[j].getAttribute("href");
        url = 'https://www.vivino.com' + href;
      }

      // Get the wine's ID from the data in the URL
      let id = url.split("/").pop();

      // Get the wine's parent ID
      const parentIDElements = elements[i].getElementsByClassName("default-wine-card");
      let parentID = "";
      for (let j = 0; j < parentIDElements.length; j++) {
        parentID = parentIDElements[j].getAttribute("data-wine");
      }

      //NOTE: The price isn't populated on the page itself.  We have to make a seprate call for that.

      //If there is no wine name in this iteration, go ahead and return what we have in the array from previous iterations
      if (!name) {
        return;
      }
      
      //Push the results from this iteration into the array
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

      //End loop
    }

    return wines;
    
};

//Add an event listener to the page
window.addEventListener("load", initializeScript);


