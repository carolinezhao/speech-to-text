export function initRecognition(env) {
  var recognition = new webkitSpeechRecognition();
  recognition.interimResults = true;
  if (env === 'web') {
    recognition.continuous = false; // default
    chrome.storage.local.get(['ifContinuous'], data => {
      if ('ifContinuous' in data) {
        recognition.continuous = true;
      }
      // console.log(recognition);
    });
  }
  if (env === 'extension') {
    recognition.continuous = true;
  }
  return recognition;
}