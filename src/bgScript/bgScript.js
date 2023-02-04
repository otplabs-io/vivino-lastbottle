import getRating from "./api/getRating";
import getPrice from "./api/getPrice";

const setup = async () => {
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.type === "getRating") {
      getRating(request.query)
        .then((response) => sendResponse([response, null]))
        .catch((error) => {
          sendResponse([null, error]);
        });
    }
    if (request.type === "getPrice") {
      getPrice(request.query)
        .then((response) => sendResponse([response, null]))
        .catch((error) => {
          sendResponse([null, error]);
        });
    }

    return true;
  });
};

setup();
