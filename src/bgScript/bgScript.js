import search from './api/search';

const setup = () => {
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'search') {
      search(request.query)
        .then(response => sendResponse([response, null]))
        .catch(error => sendResponse([null, error.message || 'Unknown error']));
      return true;
    }
  });
};

setup();
