import '../img/icon-128.png'
import '../img/icon-32.png'

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.remove(['micStatus', 'ifContinuous'], function (data) {
    console.log(data);
  });
});