export function initRecognition(env) {
  var recognition = new webkitSpeechRecognition();
  recognition.interimResults = true;

  chrome.storage.local.get(null, data => {
    // console.log(data);
    if ('ifSetLang' in data) {
      recognition.lang = data.dialect;
    }
    if (env === 'web') {
      recognition.continuous = ('ifContinuous' in data);
    }
    if (env === 'extension') {
      recognition.continuous = true;
    }
  });

  // console.log(recognition);
  return recognition;
}

export function capitalize(s) {
  var first_char = /\S/;
  return s.replace(first_char, function (m) {
    return m.toUpperCase();
  });
}

export function linebreak(s) {
  var two_line = /\n\n/g;
  var one_line = /\n/g;
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}