import "../css/common.css";
import "../css/popup.css";
import "../img/active.png";
import "../img/start.png";
import "../img/inactive.png";
import {
  initRecognition,
  capitalize,
  linebreak
} from "./popup/recognition";
import {
  message
} from "./popup/message";

let msgSpan = document.getElementById('msgSpan');
let micBtn = document.getElementById('micBtn');
let finalSpan = document.getElementById('finalSpan');
let interimSpan = document.getElementById('interimSpan');

let pageBtn = document.getElementById('pageBtn');
let tabId;
let workInTab;

let recognition = initRecognition('extension');
let final_transcript = '';
let recognizing = false;
// let ignore_onend;
// let start_timestamp;

/* Check if API is available */

if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  getTabId();
  initSettings();
  micBtn.addEventListener('click', toggleRecord);
}

function upgrade() {
  micBtn.style.visibility = 'hidden';
  showMsg('upgrade');
  pageBtn.setAttribute('disabled', 'disabled');
}

function showMsg(string) {
  msgSpan.innerHTML = message[string];
}

/* Initial settings */

function getTabId() {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    tabId = tabs[0].id;
  })
}

function initSettings() {
  chrome.storage.local.get(['micStatus', 'workInTab'], data => {
    console.log(data);
    // check microphone
    if ('micStatus' in data) {
      if (data.micStatus) {
        showMsg('start');
      } else {
        showMsg('blocked');
      }
    } else {
      showMsg('enableMic');
    }
    // check content script status
    workInTab = data.workInTab;
    if (`${tabId}` in workInTab) {
      if (workInTab[tabId]) {
        showStopBtn(pageBtn);
      } else {
        showStartBtn(pageBtn);
      }
    } else {
      showStartBtn(pageBtn);
    }
  })
}

function showStartBtn(btn) {
  btn.value = "开始在网页中输入";
  btn.classList.remove('stop-btn');
  btn.addEventListener('click', runContentScript);
}

function showStopBtn(btn) {
  btn.value = "停止在网页中输入";
  btn.classList.add('stop-btn');
  btn.addEventListener('click', stopWorkInTab);
}

/* Injects script into the current page */

function runContentScript() {
  chrome.tabs.executeScript(null, { // tabId, default current
    file: "contentScript.bundle.js"
  });
  changeStatus(true);
  window.close();
  // showStopBtn(pageBtn);
}

function stopWorkInTab() {
  // from extension to content script
  chrome.tabs.sendMessage(tabId, {
    stop: true
  }, (response) => {
    if (response === 'done') {
      changeStatus(false);
      showStartBtn(pageBtn);
    }
  });
}

function changeStatus(boolean) {
  workInTab[tabId] = boolean;
  chrome.storage.local.set({
    workInTab: workInTab
  });
}

/* Web Speech API */

function toggleRecord(clickEvent) {
  if (recognizing) {
    recognition.stop();
    showMsg('start');
    return;
  }
  final_transcript = '';
  recognition.start();
  finalSpan.innerHTML = '';
  interimSpan.innerHTML = '';
  micBtn.src = 'active.png';
  let ignore_onend = false;
  let start_timestamp = clickEvent.timeStamp;

  recognition.onstart = function () {
    recognizing = true;
    showMsg('speak');
    micBtn.src = 'start.png';
  };
  recognition.onerror = function (event) {
    micBtn.src = 'inactive.png';
    if (event.error == 'no-speech') {
      showMsg('noSpeech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      showMsg('noMicrophone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        showMsg('blocked');
      } else {
        showMsg('denied');
      }
      ignore_onend = true;
    }
  };
  recognition.onend = function () {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    micBtn.src = 'inactive.png';
    showMsg('copy');
    if (!final_transcript) {
      showMsg('start');
      return;
    }
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(finalSpan);
      window.getSelection().addRange(range);
    }
  };
  recognition.onresult = function (event) {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    finalSpan.innerHTML = linebreak(capitalize(final_transcript));
    interimSpan.innerHTML = linebreak(interim_transcript);
  };
}

/* Empty results */

document.getElementById('clearBtn').onclick = function () {
  final_transcript = '';
  finalSpan.innerHTML = '';
  interimSpan.innerHTML = '';
  if (!recognizing) {
    showMsg('start');
  }
}

/* To options page */

document.getElementById('toOptions').onclick = function () {
  chrome.tabs.create({
    url: chrome.extension.getURL("options.html"),
    selected: true
  })
}