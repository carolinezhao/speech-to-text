import "../css/options.css";
import {
  enableMic
} from "./popup/media";

/* microphone status */

let enable_mic = document.getElementById('enable_mic');
let mic_tip = document.getElementById('mic_tip');

function enabledStyle() {
  enable_mic.value = '已启用';
  enable_mic.setAttribute('disabled', 'disabled');
  mic_tip.style.display = 'block';
}

function disabledStyle() {
  enable_mic.value = '已禁用';
  enable_mic.setAttribute('disabled', '');
  mic_tip.style.display = 'block';
}

function checkMic() {
  enableMic()
    .then(stream => {
      enabledStyle();
      chrome.storage.local.set({
        micStatus: true
      })
    })
    .catch(err => {
      disabledStyle();
      chrome.storage.local.set({
        micStatus: false
      })
    });
}

checkMic();

enable_mic.addEventListener('click', checkMic);


/* continuous input */

let continuous = document.getElementById('continuous');

continuous.addEventListener('change', () => {
  if (continuous.checked) {
    chrome.storage.local.set({
      ifContinuous: true
    })
  } else {
    chrome.storage.local.remove("ifContinuous");
  }
});


/* get settings */

chrome.storage.local.get(['micStatus', 'ifContinuous'], data => {
  console.log(data);
  if (data.hasOwnProperty('micStatus')) {
    if (data.micStatus) {
      enabledStyle();
    } else {
      disabledStyle();
    }
  }
  if (data.hasOwnProperty('ifContinuous')) {
    continuous.checked = true;
  }
});