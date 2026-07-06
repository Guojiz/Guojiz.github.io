# Word Snap

Word Snap 是一个静态单页单词配对练习网页，适合快速复习英文单词和中文释义。它可以直接部署到 GitHub Pages，单词、设置、抽取历史和练习进度都会保存在浏览器本地。

- 在线体验：[https://guojiz.github.io/word-match/vocabulary-match.html](https://guojiz.github.io/word-match/vocabulary-match.html)
- 源码目录：[https://github.com/Guojiz/Guojiz.github.io/tree/main/word-match](https://github.com/Guojiz/Guojiz.github.io/tree/main/word-match)
- 更新日志：[CHANGELOG.md](./CHANGELOG.md)

## 功能特点

- 10 格流式配对面板：左侧 5 个中文，右侧 5 个英文。
- 支持键盘快捷键 `1` 到 `0`。
- 点击后即时判断配对，不需要额外提交按钮。
- 配对正确后会闪烁、消失，并从词队列中补入新词。
- 配对错误会震动提示，并自动恢复。
- 自适应复习：错词、慢词、不稳定词、到期复习词会更早出现。
- 参考 InkCanvas 点名思路的自适应抽取：最近出现过的词会降权，练得少的词会升权，出现过多的词会降权。
- 每个词都会记录抽取次数、最近抽取关卡和当前抽取概率。
- 支持单个添加和批量添加单词。
- 默认词和自定义词都可以删除或清空。
- 词库为空时会提示先添加单词。
- 支持自定义练习选项：每关时间、补词批量、补词延迟、最近历史窗口、防重复强度、选中时暂停补词、掌握后循环复习。
- 支持 PWA 基础能力：manifest、图标、service worker、移动端添加到主屏幕。

## 自适应抽取逻辑

这次的抽取逻辑借鉴了课堂随机点名的思路：它看起来仍然是随机的，但不会一直抽到同一个对象，也会照顾那些练得比较少的词。

每个词会保存这些变量：

- `draws`：这个词被抽到面板上的次数。
- `lastDrawRound`：这个词最近一次出现在哪一关。
- `drawProbability`：当前队列构建时使用的抽取权重。

构建新队列时，Word Snap 会：

- 优先考虑到期复习、薄弱、反应慢、做错过的词；
- 降低最近历史中频繁出现的词；
- 提高抽取次数低于平均值的词；
- 降低抽取次数高于平均值的词；
- 在全部词稳定后继续循环复习，避免出现空队列；
- 用户已经选中卡片时暂停补词，避免新词刷新打断当前选择。

## 使用方式

本地打开：

```text
index.html
```

线上使用：

打开 [在线体验地址](https://guojiz.github.io/word-match/vocabulary-match.html)。

iPhone 或 iPad 用户可以用 Safari 打开在线地址，点击分享按钮，选择“添加到主屏幕”，之后就能像 App 一样启动。

## 批量导入格式

在词库的“批量录入”里，每行一个词：

```text
apple,苹果
banana,香蕉
UNESCO = 联合国教科文组织
```

逗号和等号都支持。
