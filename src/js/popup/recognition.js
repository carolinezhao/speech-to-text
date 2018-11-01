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