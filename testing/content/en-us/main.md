---
title: This is a test page
slug: Markdown/Tool/H2M
tags:
  - Tag2
---
`Markdown` is a nicer format than `HTML`.

# Heading 1

Nothing to say, really.

## Heading 2

Basic formatting such as **bold** and _emphasis_.

Here's a section that simply mentions links like <https://www.peterbe.com> for example.

### Heading 3

A bullet point list:

- One
- Two
- Three

This is a paragraph with a link to [this page](/en-US/docs/Markdown/Tool/H2M).

## Other stuff

This is a paragraph with a link to [another page](/en-US/docs/Web).

### Cards

> **Note:** you should also check out this [other cool page](https://www.queengoob.org)!

> **Note:** Thanks for contributing to MDN!

> **Warning:** the above implementation is partially buggy. It is recommended to use `helloWorld();` instead.

> **Callout:** remember to remove unneeded whitespace.

> **Warning:** Try the following code instead:
>
> ```js
> var img = document.createElementNS("http://www.w3.org/2000/svg", "image");
> img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "move.png");
> ```

### A Definition List

- Key 1
  - : Value 1
- Key 2

  - : Value 2, can be one of:

    - Foo
    - Bar
    - Baz

### Some code blocks

```html
<canvas id="game" width="128" height="128"></canvas>
```

```js
function foo() {
  return undefined + 1;
}
```

```css
div#foo {
  color: pink;
}
```

```
Hello there, world! How are you doing?
```

### Tables

#### Normal table

| Hello     | World     |
| --------- | --------- |
| Goodbye   | Heatwaves |
| Thank you | Space     |

#### Table with rowspan/colspan > 1

<table class="fullwidth-table standard-table">
  <thead>
    <tr>
      <th rowspan="1">Hello</th>
      <th rowspan="1">World</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Heatwaves</td>
    </tr>
    <tr>
      <td colspan="2" scope="row">Thank you, space!</td>
    </tr>
  </tbody>
</table>

#### `.properties` table

<table class="properties">
  <tbody>
    <tr>
      <th scope="row">
        <a href="/zh-CN/docs/HTML/Content_categories">Content categories</a>
      </th>
      <td>
        <a href="/zh-CN/docs/HTML/Content_categories#Flow_content"
          >Flow content</a
        >,
        <a href="/zh-CN/docs/HTML/Content_categories#Phrasing_content"
          >phrasing content</a
        >.
      </td>
    </tr>
    <tr>
      <th scope="row">Permitted content</th>
      <td>Empty</td>
    </tr>
  </tbody>
</table>

#### Table with multiline content

<table class="fullwidth-table standard-table">
  <tbody>
    <tr>
      <th scope="row" style="width: 30%">Type</th>
      <td><code>Array</code></td>
    </tr>
    <tr>
      <th scope="row">Mandatory</th>
      <td>No</td>
    </tr>
    <tr>
      <th scope="row">Example</th>
      <td>
        <pre class="brush: json no-line-numbers">
"content_scripts": [
  {
    "matches": ["*://*.mozilla.org/*"],
    "js": ["borderify.js"]
  }
]</pre
        >
      </td>
    </tr>
  </tbody>
</table>
