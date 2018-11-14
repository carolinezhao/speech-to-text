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

## options

更改设置后，直接在 storage 中保存。

## storage

- 麦克风权限
  - 可通过地址栏图标和浏览器设置更改权限，插件页和每个网页都需要检查权限。
- 连续输入和输入语言
  - 在 options 页设置，都是语音识别对象的属性，在创建对象时读取设置。
- 内容脚本的工作状态
  - 当同时在多个页面中使用插件时，通过 tabId 的属性值判断当前页面可进行的操作。
  - 安装插件时初始化 workInTab 对象；
  - 在页面中运行内容脚本，将该页面的 tabId (一串数字) 作为属性添加到 workInTab 中，值为 true；
  - 当停止内容脚本的工作，该属性值为 false；
  - 关闭页面时，删除该页面的状态记录；
  - 刷新页面时，内容脚本不再工作，但插件不会同步刷新，因此需要重启插件。

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

## bug

对象中的属性值不是变量，只读取一次。如果需要更新对象的属性值，可以通过函数返回对象。

脚本中引用本地文件 (参考 popup 中的图片引用)
- `import` 按照原始文件的相对路径 (不可缺少)
- 使用时按照 build 目录中的相对路径
- 也可以通过 `chrome.extension.getURL` 得到在插件中的绝对路径

todo：刷新页面时，如果 tabId 为 true 则重启插件，在打包后的插件中不生效。