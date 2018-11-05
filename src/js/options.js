import "../css/common.css";
import "../css/options.css";
import {
  enableMic
} from "./popup/media";
import {
  initLanguage,
  updateCountry
} from "./popup/langs";

let micBtn = document.getElementById('micBtn');
let micTip = document.getElementById('micTip');

let continuousCheck = document.getElementById('continuous');

let langCheck = document.getElementById('lang');
let langSelect = document.getElementById('langSelect');
let dialectSelect = document.getElementById('dialectSelect');
let dialectIfShow;
let langSets = function (language, dialect, dialectIfShow) {
  return {
    language: language,
    dialect: dialect,
    dialectIfShow: dialectIfShow
  };
}

initSettings();

/* Microphone */

checkMic(); // 浏览器多处可设置麦克状态，因此每次都要检查。
micBtn.addEventListener('click', checkMic);

/* Input */

continuousCheck.addEventListener('change', () => {
  if (continuousCheck.checked) {
    chrome.storage.local.set({
      ifContinuous: true
    })
  } else {
    chrome.storage.local.remove("ifContinuous");
  }
});

/* Language */

langCheck.addEventListener('change', () => {
  if (langCheck.checked) {
    // console.log(langSets(langSelect.value, dialectSelect.value, dialectIfShow));
    chrome.storage.local.set({
      ifSetLang: true
    });
    chrome.storage.local.set(langSets(langSelect.value, dialectSelect.value, dialectIfShow));
  } else {
    chrome.storage.local.remove(['ifSetLang']);
  }
});

langSelect.onchange = function () {
  dialectIfShow = updateCountry(langSelect, dialectSelect);
  if (langCheck.checked) {
    chrome.storage.local.set(langSets(langSelect.value, dialectSelect.value, dialectIfShow));
  }
}

dialectSelect.onchange = function () {
  if (langCheck.checked) {
    chrome.storage.local.set({
      dialect: dialectSelect.value, // update
    })
  }
}

/* Get settings */

function initSettings() {
  chrome.storage.local.get(null, data => {
    console.log(data);
    if ('micStatus' in data) {
      if (data.micStatus) {
        enabledStyle(micBtn, micTip);
      } else {
        disabledStyle(micBtn, micTip);
      }
    }

    if ('ifContinuous' in data) {
      continuousCheck.checked = true;
    }

    initLanguage(langSelect, dialectSelect);
    if ('language' in data) {
      if ('ifSetLang' in data) {
        langCheck.checked = true;
      }
      langSelect.value = data.language;
      updateCountry(langSelect, dialectSelect);
      if (!data.dialectIfShow) {
        dialectSelect.style.visibility = 'hidden';
      }
      dialectSelect.value = data.dialect;
    } else {
      langSelect.value = 0; // 无设置，自动显示第一项。
      dialectIfShow = updateCountry(langSelect, dialectSelect);
      dialectSelect.value = 'af-ZA';
    }
  });
}

/* Microphone */

function checkMic() {
  enableMic()
    .then(stream => {
      enabledStyle(micBtn, micTip);
      chrome.storage.local.set({
        micStatus: true
      })
    })
    .catch(err => {
      disabledStyle(micBtn, micTip);
      chrome.storage.local.set({
        micStatus: false
      })
    });
}

function enabledStyle(btn, text) {
  btn.value = '已启用';
  btn.classList.remove('stop-btn');
  btn.setAttribute('disabled', 'disabled');
  text.style.display = 'block';
}

function disabledStyle(btn, text) {
  btn.value = '已禁用';
  btn.classList.add('stop-btn');
  btn.setAttribute('disabled', '');
  text.style.display = 'block';
}