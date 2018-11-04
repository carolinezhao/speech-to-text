import "../css/common.css";
import "../css/popup.css";
import "../img/active.png";
import "../img/start.png";
import "../img/inactive.png";
import {
  initRecognition
} from "./popup/recognition";
import {
  capitalize,
  linebreak
} from "./popup/format";
import {
  message
} from "./popup/message";

let page_button = document.getElementById('page_button');
let msg_span = document.getElementById('msg_span');
let msg = message();
let tabId;
let workInTab;

/* Message */

function showMsg(string) {
  msg_span.innerHTML = msg[string];
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
      // 插件页不能直接请求媒体权限，需要到 options 页设置。
      showMsg('enableMic');
    }
    // check content script status
    workInTab = data.workInTab;
    console.log(workInTab);
    if (`${tabId}` in workInTab) {
      if (workInTab[tabId]) {
        stopBtn(page_button);
      } else {
        startBtn(page_button);
      }
    } else {
      startBtn(page_button);
    }
  })
}

function startBtn(btn) {
  btn.value = "在网页中输入";
  btn.classList.remove('stop-btn');
  btn.addEventListener('click', runContentScript);
}

function stopBtn(btn) {
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
  // stopBtn(page_button);
}

function stopWorkInTab() {
  // extension 向内容脚本发消息
  chrome.tabs.sendMessage(tabId, {
    stop: true
  }, (response) => {
    if (response === 'done') {
      changeStatus(false);
      startBtn(page_button);
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

let start_button = document.getElementById('start_button');
start_button.addEventListener('click', startRecord);

let final_transcript = '';
let recognizing = false;
let ignore_onend;
let start_timestamp;
let final_span = document.getElementById('final_span');
let interim_span = document.getElementById('interim_span');

function upgrade() {
  start_button.style.visibility = 'hidden';
  showMsg('upgrade');
  page_button.setAttribute('disabled', 'disabled');
}

if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  getTabId();
  initSettings();
  var recognition = initRecognition('extension');
  recognition.onstart = function () {
    recognizing = true;
    showMsg('speak');
    start_button.src = 'start.png';
  };
  recognition.onerror = function (event) {
    if (event.error == 'no-speech') {
      start_button.src = 'inactive.png';
      showMsg('noSpeech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      start_button.src = 'inactive.png';
      showMsg('noMicrophone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        showMsg('blocked');
        start_button.src = 'inactive.png';
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
    start_button.src = 'inactive.png';
    showMsg('copy');
    if (!final_transcript) {
      showMsg('start');
      return;
    }
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(final_span);
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
    final_transcript = capitalize(final_transcript);
    final_span.innerHTML = linebreak(final_transcript);
    interim_span.innerHTML = linebreak(interim_transcript);
  };
}

function startRecord(event) {
  if (recognizing) {
    recognition.stop();
    showMsg('start');
    return;
  }
  final_transcript = '';
  recognition.start();
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  start_button.src = 'active.png';
  start_timestamp = event.timeStamp;
}

document.getElementById('clear_button').onclick = function () {
  final_transcript = '';
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
}

/* To options page */

document.getElementById('to_options').onclick = function () {
  chrome.tabs.create({
    url: chrome.extension.getURL("options.html"),
    selected: true
  })
}