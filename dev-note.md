# 开发笔记

## popup

检查语音输入功能是否可用
- 不能在插件和网页中使用的情况
  - 浏览器版本过低
- 不能在网页中使用的情况
  - 协议不是 https
  - 加载状态为 "loading"

API：`chrome.tabs.query`

## content script

由插件 popup 页面的 button 控制内容脚本的工作状态
- 运行：执行脚本，为目标元素绑定 focus 事件处理程序，tabId 值为 true
- 停止：发送消息给脚本，脚本接到通知后取消事件绑定，tabId 值为 false

API: 
- `chrome.tabs.executeScript`
- `chrome.tabs.sendMessage`
- `chrome.runtime.onMessage.addListener`

## background

管理内容脚本的状态
- 在 storage 中初始化 workInTab 对象
- 关闭页面时，删除相应的 tabId 属性
- 刷新页面时，且当相应的 tabId 值为 true 时，删除 tabId 属性，重启插件

API: 
- `chrome.runtime.onInstalled.addListener`
- `chrome.runtime.reload`
- `chrome.tabs.onUpdated.addListener`
- `chrome.tabs.onRemoved.addListener`

## storage

- 麦克风权限
- 连续输入设置
- 语言设置
- 内容脚本的工作状态

API：
- `chrome.storage.local.set`
- `chrome.storage.local.get`

## DOM

页面中的可输入元素

```html
<!-- 通过 value 属性插入文本 -->
<input type="" value=""> <!-- type = text, search, email, tel -->
<textarea value="">

<!-- 通过 innerHTML 将文本插入元素节点 -->
<div contenteditable="true"> <!-- 设置此属性时的默认结构 -->
  <div>
    <p>
      <span>
        <br>
      </span>
    </p>
  </div>
</div>
```

div 输入的特殊情况
- 石墨文档：能插入可编辑文本，但光标会跳到最开头。
- 知乎：普通输入状态下会激活 keyboard 事件，直接插入的文本不能激活，因此不能编辑。
- 豆瓣：普通输入过程中会激活很多事件。

todo
- 没有设置 type 属性的 input

## media

请求麦克风权限的 API 在插件脚本中无效，在 options 页和内容脚本中可以使用。
```js
navigator.mediaDevices.getUserMedia({
  audio: true
})
```

## manifest

注册以下字段后，遇到匹配的网址，内容脚本自动运行。
```json
"content_scripts": [
    {
      "matches": ["https://example/*"],
      "js": ["contentScript.js"]
    }
  ]
```