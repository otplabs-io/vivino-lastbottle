export default function getPrice(query) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "getPrice", query },
      (messageResponse) => {
        const [response, error] = messageResponse;

        if (!response) {
          reject(error);
        }

        resolve(response);
      }
    );
  });
}
