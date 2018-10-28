/* Check if microphone is enabled */

navigator.webkitGetUserMedia({
    audio: true
}, s => {
    console.log('Microphone is ready. Click on textbox and speak.');
}, err => {
    alert('Please enable Microphone Permission.');
});


/* Get <input> nodes of the current page */

var targetNode; // 目标输入框

if (document) {
    getNodes();
}

function getNodes() {
    var inputNodes = document.querySelectorAll(createSelector());
    // console.log(inputNodes);
    if (inputNodes.length) {
        bindEvent(inputNodes);
    }
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

function bindEvent(array) {
    array.forEach(item => {
        item.onfocus = event => {
            startRecord(event);
            targetNode = event.target;
            targetNode.value = 'speak...' // 语音识别有结果后重写 value
        };
    })
}


/* Web Speech API */

var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;

if ('webkitSpeechRecognition' in window) {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function () {
        recognizing = true;
    };
    recognition.onerror = function (event) {};
    recognition.onend = function () {
        recognizing = false;
        if (ignore_onend) {
            return;
        }
    };
    recognition.onresult = function (event) {
        // console.log(event.target); // SpeechRecognition
        var interim_transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        final_transcript = capitalize(final_transcript);
        // console.log(interim_transcript);
        // targetNode.value = linebreak(interim_transcript); // doesn't work
        targetNode.value = linebreak(final_transcript);
    };
}

function linebreak(s) {
    var two_line = /\n\n/g;
    var one_line = /\n/g;
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

function capitalize(s) {
    var first_char = /\S/;
    return s.replace(first_char, function (m) {
        return m.toUpperCase();
    });
}

function startRecord(event) {
    // console.log(event.target);
    if (recognizing) {
        recognition.stop();
        return;
    }
    final_transcript = '';
    // recognition.lang = select_dialect.value;
    recognition.start();
    ignore_onend = false;
    event.target.value = '';
    // interim_span.value = '';
    start_timestamp = event.timeStamp;
}