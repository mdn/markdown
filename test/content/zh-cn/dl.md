---
title: This is a test page
slug: dl
---
- `<length>`
  - : `{{cssxref("&lt;length&gt;")}}` 值，指定背景图片大小，不能为负值。
- `<percentage>`
  - : `{{cssxref("&lt;percentage&gt;")}}` 值，指定背景图片相对背景区（background positioning area）的百分比。背景区由{{cssxref("background-origin")}}设置，默认为盒模型的内容区与内边距，也可设置为只有内容区，或者还包括边框。如果{{cssxref("background-attachment","attachment")}} 为`fixed`，背景区为浏览器可视区（即视口），不包括滚动条。不能为负值。
- `auto`
  - : 以背景图片的比例缩放背景图片。
- `cover`
  - : 缩放背景图片以完全覆盖背景区，可能背景图片部分看不见。和 `contain` 值相反，`cover` 值尽可能大的缩放背景图像并保持图像的宽高比例（图像不会被压扁）。该背景图以它的全部宽或者高覆盖所在容器。当容器和背景图大小不同时，背景图的 左/右 或者 上/下 部分会被裁剪。
- `contain`
  - : 缩放背景图片以完全装入背景区，可能背景区部分空白。`contain` 尽可能的缩放背景并保持图像的宽高比例（图像不会被压缩）。该背景图会填充所在的容器。当背景图和容器的大小的不同时，容器的空白区域（上/下或者左/右）会显示由 background-color 设置的背景颜色。

<!---->

- {{domxref("MouseEvent.altKey")}} {{readonlyinline}}
  - : 当鼠标事件触发的时，如果 alt 键被按下，返回 true;
- {{domxref("MouseEvent.button")}} {{readonlyinline}}
  - : 当鼠标事件触发的时，如果鼠标按钮被按下（如果有的话），将会返回一个数值。
- {{domxref("MouseEvent.buttons")}} {{readonlyinline}}
  - : 当鼠标事件触发的时，如果多个鼠标按钮被按下（如果有的话），将会返回一个或者多个代表鼠标按钮的数字。
