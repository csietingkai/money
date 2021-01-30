# Prototype Frontend App

## Coding Style
+ must add semicolon
+ function always use lambda
+ brackets start at end of function/expression
+ always add space after colon
+ all string using single quota

for example:
```js
const someFunction = (argument1: string): number => {
	const var1 = 'abc';
	// do something
	return 0;
}
```

## Import Setting
Import modules must follow the rules:
+ Order imports by node_modules -> components -> apis -> utils -> css/sass -> images, each types of import must add new line
+ import all modules/functions from a file should be in one line

for example:
```js
import * as React from 'react';
import Cookies from 'js-cookie';

import Sidebar from 'component/Sidebar'

import { format, generate } from 'util/UUIDHelper';

import logo from 'images/log.svg';
```
