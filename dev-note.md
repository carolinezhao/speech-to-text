# 开发笔记

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

## 内容脚本

由插件 popup 页面的 button 控制内容脚本的工作状态

通过 `chrome.tabs.query` 拿到当前页的 url 和 status。如果满足以下条件，则禁用 button：
- 协议不是 https
- 加载状态为 "loading"

button 可用，改变脚本状态：
- 运行：通过 `chrome.tabs.executeScript` 执行脚本，为目标元素绑定 focus 事件处理程序。
- 停止：通过 `chrome.tabs.sendMessage` 发送消息给脚本，脚本通过 `chrome.runtime.onMessage.addListener` 接收通知，然后取消绑定的事件。

状态变化带来的改变：
- button 文案和 UI；
- button 绑定的事件；
- storage 中 tabId 的值 (运行为 true，停止为 false，关闭页面删除属性)。