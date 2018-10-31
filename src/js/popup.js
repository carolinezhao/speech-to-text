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
} from "./popup/notification";

/* Execute script for webpage */

let page_button = document.getElementById('page_button');
page_button.onclick = function () {
  chrome.tabs.executeScript(null, {
    file: "contentScript.bundle.js"
  });
  window.close();
}

/* Message */

let msg = message();
let msg_span = document.getElementById('msg_span');

function showMsg(string) {
  msg_span.innerHTML = msg[string];
}

showMsg('start');

/* Start Record */

let start_button = document.getElementById('start_button');
start_button.addEventListener('click', startRecord);

let final_transcript = '';
let recognizing = false;
let ignore_onend;
let start_timestamp;

function upgrade() {
  start_button.style.visibility = 'hidden';
  showMsg('upgrade');
  page_button.setAttribute('disabled', 'disabled');
}

if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  var recognition = initRecognition('extension');
}

function startRecord(event) {
  if (recognizing) {
    recognition.stop();
    showMsg('start');
    return;
  }
  final_transcript = '';
  // recognition.lang = select_dialect.value;
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