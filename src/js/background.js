import '../img/icon-128.png'
import '../img/icon-32.png'

chrome.runtime.onInstalled.addListener(function () {
  let workInTab = Object.create(null);
  chrome.storage.local.set(workInTab);
  // chrome.storage.local.remove(['micStatus'], data => console.log(data));
});