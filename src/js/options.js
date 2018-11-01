import "../css/common.css";
import "../css/options.css";
import {
  enableMic
} from "./popup/media";
import {
  initLanguage,
  updateCountry
} from "./popup/langs";

/* Microphone */

let enable_mic = document.getElementById('enable_mic');
let mic_tip = document.getElementById('mic_tip');

function enabledStyle() {
  enable_mic.value = '已启用';
  enable_mic.setAttribute('disabled', 'disabled');
  mic_tip.style.display = 'block';
}

function disabledStyle() {
  enable_mic.value = '已禁用';
  enable_mic.setAttribute('disabled', '');
  mic_tip.style.display = 'block';
}

function checkMic() {
  enableMic()
    .then(stream => {
      enabledStyle();
      chrome.storage.local.set({
        micStatus: true
      })
    })
    .catch(err => {
      disabledStyle();
      chrome.storage.local.set({
        micStatus: false
      })
    });
}

/* Input */

let continuous = document.getElementById('continuous');

/* Language */

let set_lang = document.getElementById('set_lang'); // checkbox
let select_language = document.getElementById('select_language');
let select_dialect = document.getElementById('select_dialect');

let dialectIfShow;

let langSets = function (language, dialect, dialectIfShow) {
  return {
    language: language,
    dialect: dialect,
    dialectIfShow: dialectIfShow
  };
}

/* Get settings */

chrome.storage.local.get(null, data => {
  console.log(data);
  if ('micStatus' in data) {
    if (data.micStatus) {
      enabledStyle();
    } else {
      disabledStyle();
    }
  }

  if ('ifContinuous' in data) {
    continuous.checked = true;
  }

  initLanguage(select_language, select_dialect);
  if ('language' in data) {
    if ('ifSetLang' in data) {
      set_lang.checked = true;
    }
    select_language.value = data.language;
    updateCountry(select_language, select_dialect);
    if (!data.dialectIfShow) {
      select_dialect.style.visibility = 'hidden';
    }
    select_dialect.value = data.dialect;
  } else {
    select_language.value = 0; // 无设置，自动显示第一项。
    dialectIfShow = updateCountry(select_language, select_dialect);
    select_dialect.value = 'af-ZA';
  }
});

/* Event */

checkMic(); // 每次都要检查，因为多处可以设置麦克状态，仅检查 storage 不够。
enable_mic.addEventListener('click', checkMic);

continuous.addEventListener('change', () => {
  if (continuous.checked) {
    chrome.storage.local.set({
      ifContinuous: true
    })
  } else {
    chrome.storage.local.remove("ifContinuous");
  }
});

set_lang.addEventListener('change', () => {
  if (set_lang.checked) {
    // console.log(langSets(select_language.value, select_dialect.value, dialectIfShow));
    chrome.storage.local.set({
      ifSetLang: true
    });
    chrome.storage.local.set(langSets(select_language.value, select_dialect.value, dialectIfShow));
  } else {
    chrome.storage.local.remove(['ifSetLang']);
  }
});

select_language.onchange = function () {
  dialectIfShow = updateCountry(select_language, select_dialect);
  if (set_lang.checked) {
    chrome.storage.local.set(langSets(select_language.value, select_dialect.value, dialectIfShow));
  }
}

select_dialect.onchange = function () {
  if (set_lang.checked) {
    chrome.storage.local.set({
      dialect: select_dialect.value, // update
    })
  }
}