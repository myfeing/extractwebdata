let extractData = document.getElementById("extractData");

extractData.addEventListener("click", () => {
  chrome.runtime.sendMessage({action: 'run'});
});
