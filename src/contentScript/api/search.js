export default function search(query) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: 'search', query },
      messageResponse => {
        if (!messageResponse) {
          reject(new Error('No response from background script'));
          return;
        }
        const [response, error] = messageResponse;
        if (error) {
          reject(new Error(error));
        } else {
          resolve(response);
        }
      }
    );
  });
}
