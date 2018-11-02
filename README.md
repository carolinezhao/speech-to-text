# Speech to Text

## 1. 功能

Chrome 插件，用于将语音实时转换为文本。
- 途径1：在网页中激活文本框后直接输入；
- 途径2：在插件页面中输入，然后复制到目标区域。

### 1.1 设置

- 开启麦克风权限：插件和各个网页的麦克风权限都是独立的，首次使用均需要授权。
- 设置连续输入
    - 在网页中使用时，语音识别默认会在语句停顿处结束。如果需要输入较长文本，请开启连续输入。
    - 在插件中使用时，默认为连续输入。
    - 文本框背景（网页中）或麦克风（插件中）变为蓝色时表示正在录音，再次激活文本框或点击麦克风立即结束录音。
- 设置输入语言
    - 不设置输入语言时，默认使用浏览器和网页设置。

### 1.2 使用说明

- 使用环境：Chrome 版本 25 及以上。能连接 Google。
- 在网页中使用：
    - 仅支持 HTTPS 协议下运行的网页。对于不支持的网页，可以在插件中输入，然后复制到目标区域。
    - 如果刷新网页，需要再次点击“在网页中输入”按钮。为保护用户隐私，网页脚本不是持续运行的。
    - 不支持使用的文本框类型：密码等。
- 转换效果：语音识别需要一点时间，文本显示可能略有延迟。为得到更好的识别效果，请您语速平稳，吐字清晰。

### 1.3 不足及迭代方案

- 尚未设置网页中的提示信息，仅能根据简单的交互识别录音状态 -> 可能需要在 options 页添加麦克风测试。
- 如果网页配色较深或相近，激活录音时的背景变化可能不易识别 -> 改为更明显 & 灵活的交互方式。
- 除了手动刷新页面之外，无法结束内容脚本的运行（仅可以结束录音）。

## 2. 技术选型

语音转文本
- 选择原则：Web，开源，轻量，支持多语言，实时转换，识别效率高等
- 选择结果：Google Web Speech API

基本功能
- 产品形式：Chrome 插件
- 核心功能在内容脚本中，即在浏览器中已加载页面的上下文中执行，操作该网页 DOM。
- 插件页面的结构和内容都比较简单，应尽可能保证插件的简洁。
- 选择结果：原生 JavaScript, HTML, CSS

工程
- Webpack
- ES6 Module

## 3. 开发

- Clone the repository.
- Run `yarn`.
- Run `npm run start`. (Hot reload)
- Load the extension on Chrome following:
    - Access chrome://extensions/
    - Check Developer mode
    - Click on Load unpacked extension
    - Select the build folder

## 4. Reference

- [Chrome Extensions](https://developer.chrome.com/extensions)
- [Web Speech API](https://developers.google.com/web/updates/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API)
- [chrome-extension-webpack-boilerplate](https://github.com/samuelsimoes/chrome-extension-webpack-boilerplate)