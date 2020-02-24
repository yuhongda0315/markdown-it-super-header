**A plugin for vuepress markdown parser, add heading attr id or class**

##### install

```js
npm install markdown-it-super-header --save-dev
```

##### Use

```js
var md = require('markdown-it')()
var superHeader = require('markdown-it-super-header');
md.use(superHeader);
```

##### Example

```js
var str = '### Hello World {#intro}'
var md = require('markdown-it')();
var superHeader = require('markdown-it-super-header');
md.use(superHeader);
md.render()
// => <h3 id="intro">Hello World</h3>
```