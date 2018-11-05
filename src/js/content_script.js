import {
  enableMic
} from "./popup/media";
import {
  initRecognition,
  capitalize,
  linebreak
} from "./popup/recognition";

let inputNodes = document.querySelectorAll(createSelector());
let recognition = initRecognition('web');
let recognizing = false;
let final_transcript = '';
let activeNode;
let originBgColor;
let zhihu = window.location.href.includes('zhihu');

/* Enable Microphone */

enableMic()
  .then(stream => {
    console.log('Microphone is ready.');
  })
  .catch(err => {
    alert('[来自 Speech To Text 的提示] 如果您想在网页中使用语音输入，请开启麦克风权限：\n方法1：点击地址栏中的摄像机图标，选择允许。\n方法2：到 chrome://settings/content/microphone 设置。');
    console.log(err);
  });

/* Init focus events */

if (document) {
  bindEvent(inputNodes);
}

/* Remove events when receive notice from extension */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.stop) {
    console.log('stop');
    removeEvent(inputNodes);
    sendResponse('done');
  }
})

function bindEvent(nodeList) {
  if (nodeList.length) {
    nodeList.forEach(item => item.addEventListener('focus', toggleRecord));
  }
}

function removeEvent(nodeList) {
  if (nodeList.length) {
    nodeList.forEach(item => {
      if (recognizing) {
        recognition.stop();
        toggleBgColor(activeNode, originBgColor);
      }
      item.removeEventListener('focus', toggleRecord);
    });
  }
}

/* Speech recognition handler */

function toggleRecord(focusEvent) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.start();
  // var start_timestamp = focusEvent.timeStamp;
  activeNode = focusEvent.target;
  originBgColor = activeNode.style.backgroundColor;
  // console.log(activeNode);

  recognition.onstart = function () {
    recognizing = true;
    toggleBgColor(activeNode, '#DEE8FC');
  };
  recognition.onerror = function (event) {
    toggleBgColor(activeNode, originBgColor);
  };
  recognition.onend = function () {
    recognizing = false;
    toggleBgColor(activeNode, originBgColor);
  };
  recognition.onresult = function (event) {
    if (recognition.continuous) {
      final_transcript = '';
    }
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    // console.log(interim_transcript);
    output(final_transcript, activeNode);
  };
}

/* Insert results into nodes */

function output(text, targetNode) {
  if (text.length) {
    text = capitalize(text);
    if (targetNode.nodeName === 'DIV') { // 写入页面元素中
      var innerNode = getInnerNode(targetNode);
      console.log(innerNode);
      if (zhihu && innerNode.firstChild.nodeName === 'BR') { // 知乎
        innerNode.innerHTML = `<span data-text="true">${text}</span>`;
      } else {
        innerNode.innerHTML += text;
      }
    } else { // 写入 value 属性
      targetNode.value += linebreak(text);
    }
  }
}

/* Get available nodes of the current page */

function createSelector() {
  let inputTypes = ['text', 'search', 'tel', 'email'];
  let inputArr = inputTypes.map(item => `input[type=${item}]`);
  let textareaArr = ['textarea'];
  let divArr = ['div[contenteditable=true]'];
  let selector = inputArr.concat(textareaArr, divArr).join(',');
  // console.log(selector);
  return selector;
}

/* Get the deepest childNode (except <br>) */

function getInnerNode(node) {
  if (node.lastElementChild !== null && node.lastElementChild.nodeName !== 'BR') {
    return getInnerNode(node.lastElementChild);
  } else {
    return node;
  }
}

function toggleBgColor(node, color) {
  node.style.backgroundColor = color;
}