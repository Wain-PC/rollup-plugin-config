rollup-plugin-config
==========================
[![Build Status](https://travis-ci.org/Wain-PC/rollup-plugin-config.svg?branch=master)](https://travis-ci.org/Wain-PC/rollup-plugin-config)
[![Coverage Status](https://coveralls.io/repos/github/Wain-PC/rollup-plugin-config/badge.svg?branch=master)](https://coveralls.io/github/Wain-PC/rollup-plugin-config?branch=master)

Rollup plugin designed mainly for use with [node-config](https://github.com/lorenwest/node-config) (though you can pass any object you want).

## Installation

Install the package:

- npm `npm install --save-dev rollup-plugin-config`
- yarn `yarn add --dev rollup-plugin-config`

## Usage

Pass any object with a single root node to the plugin (it can be named anything you want). 

```javascript
import { rollup } from 'rollup'
import configPlugin from 'rollup-plugin-config'

	const configObject = {
		one: 1,
		two: 2,
		three: {
			four: 'four'
		}
	};
	
	rollup({
		entry: 'main.js',
		plugins: [
			configPlugin({CONFIG: configObject}) //Now you can use values like CONFIG.one or CONFIG.three.four in your code
		]
	})

```

Use that node name as a global variable in your script.
```javascript
console.log(CONFIG.one + CONFIG.two)
```

It'll get replaced with an actual value from the object you provided.
```javascript
console.log(1 + 2)
```