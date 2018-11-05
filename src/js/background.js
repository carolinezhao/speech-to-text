import '../img/icon-128.png'
import '../img/icon-32.png'

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    workInTab: {}
  });
  // chrome.storage.local.remove(['micStatus'], data => console.log(data));
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  // console.log(tabId);
  chrome.storage.local.get(['workInTab'], data => {
    let workInTab = data.workInTab;
    if (`${tabId}` in workInTab) {
      delete workInTab[tabId];
    }
    // console.log(workInTab);
  });
})