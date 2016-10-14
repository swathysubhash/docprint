# docprint

# Introduction
Renders [API Blueprint](http://apiblueprint.org/) files to static HTML files. API Blueprint is a Markdown-based documentation format which can be used for writing API documentations.

## Features

* Attributes of resources rendered separately
* Nested Attributes
* Can add custom header and custom css file
* Supports code snippets of six different languages
* Waypoint support
* Markdown support
* Clean UI

## Example

Example can be seen in the build folder. Output for [Polls](https://raw.githubusercontent.com/swathysubhash/docprint/master/build/apib/polls.apib) api blueprint file is rendered [here](http://htmlpreview.github.io/?https://raw.githubusercontent.com/swathysubhash/docprint/blob/master/build/docs/curl/index.html).

# Installation & Usage
We can use docprint as an executable as well as node js library. 
Seven documentation files will be created in different folders for different languages. 

## Executable
Install docprint via NPM. You need nodejs for install.

```bash
npm install -g docprint
```

```bash
docprint -p './build/apib/polls.apib' -d './build/docs' -h './build/files/header.html' -c './build/files/custom.css'
```

## Node js Library
You can also use docprint as a library. First, install and save it as a dependency:

```bash
npm install --save docprint
```

Then, convert some API Blueprint to HTML:

```javascript
var docprint = require('docprint');

var filepath = './build/apib/polls.apib';
var destination = './build/docs';
var header = './build/files/header.html';
var css = './build/files/custom.css';

docprint({
	filepath: filepath,
	destination: destination,
	header: header,
	css: css
})
```

# Language selection
During language selection in the documentation, it will replace the 'language keyword' from url with the new language selected. You should mount the static files in the application in a similar way so that changing url should work for different languages.

For eg: http://api.xyz.com/docs/curl/index.html  --- for curl
while selecting php, url will change to
http://api.xyz.com/docs/php/index.html  --- by replacing curl with php


### Reference

#### docprint (options)
Renders the documentation. Options object can contain : 

| Option      | Type   | Description                            |
| ----------- | ------ | -------------------------------------- |
| filepath    | string | location of api blueprint file         |
| destination | string | destination of documentation generated |
| header      | string | location of file containing html header|
| css         | string | location of file containing custom css |
| headerhtml  | string | header html string - (optional)        |





