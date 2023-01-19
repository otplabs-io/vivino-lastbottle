import debounce from "lodash/debounce";
import get from "lodash/get";
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
    //Get rating from Vivino
    const wines = await getRating(sWineName);

    //Get the price value to show in the header. Handle cases where there are no results.
    let sPrice = 'N/A';
    if(wines.length>0){
      sPrice = await getPrice(wines[0]['parentID']);
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

      //Show a maximum of 5 results
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
    console.error(`${sWineName} is not found on Vivino`);
    //console.log(e);
  }
}

window.addEventListener("load", initializeScript);


