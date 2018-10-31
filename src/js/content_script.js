import {
  enableMic
} from "./popup/media";
import {
  initRecognition
} from "./popup/recognition";
import {
  capitalize,
  linebreak
} from "./popup/format";

/* Enable Microphone */

enableMic()
  .then(stream => {
    console.log('Microphone is ready.');
  })
  .catch(err => {
    alert('[来自 Speech To Text 的提示] 如果您想在网页中使用语音输入，请开启麦克风权限：\n方法1：点击地址栏中的摄像机图标，选择允许。\n方法2：到 chrome://settings/content/microphone 设置。');
    console.log(err);
  });


/* Get <input> nodes of the current page */

var targetNode; // 目标文本框
var originColor;

if (document) {
  bindEvent();
}

function createSelector() {
  var inputTypeList = ['text', 'search', 'tel', 'email'];
  var selector = 'textarea, ';
  inputTypeList.forEach((item, index, array) => {
    selector += `input[type=${item}]`;
    if (index !== array.length - 1) {
      selector += ', ';
    }
  });
  // console.log(selector);
  return selector;
}

function bindEvent() {
  var inputNodes = document.querySelectorAll(createSelector());
  // console.log(inputNodes);
  if (inputNodes.length) {
    inputNodes.forEach(item => {
      item.onfocus = event => {
        startRecord(event);
        targetNode = event.target;
      };
    })
  }
}

/* UX */

function highlightStyle(node) {
  originColor = node.style.backgroundColor;
  node.style.backgroundColor = '#DEE8FC';
}

function restoreStyle(node) {
  node.style.backgroundColor = originColor;
}


/* Web Speech API */

var final_transcript = '';
var recognizing = false; // status
var ignore_onend;
var start_timestamp;

var recognition = initRecognition('web');
recognition.onstart = function () {
  recognizing = true;
  highlightStyle(targetNode);
};
recognition.onerror = function (event) {
  // 
};
recognition.onend = function () {
  recognizing = false;
  restoreStyle(targetNode);
  if (ignore_onend) {
    return;
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
  final_transcript = linebreak(capitalize(final_transcript));
  // console.log(interim_transcript);
  // targetNode.value = linebreak(interim_transcript);

  if (recognition.continuous) {
    targetNode.value = final_transcript;
  } else {
    if (targetNode.value.length && final_transcript) {
      targetNode.value += ` ${final_transcript}`;
    } else {
      targetNode.value += final_transcript;
    }
  }
};

function startRecord(event) {
  // console.log(event.target);
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  // recognition.lang = select_dialect.value; // auto
  recognition.start();
  ignore_onend = false;
  // event.target.value = '';
  // interim_span.value = '';
  start_timestamp = event.timeStamp;
}