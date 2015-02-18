(function (window, document, undefined) {
	'use strict';

	var d = window.d || (window.d = {}),
		info = {
			version: '0.1',
			codename: 'joyfull-dread'
		},
		isIE = /*@cc_on!@*/false; // TODO: Test if this works properly in all IE versions


	/**
	 * Checks and iterates through array and returns callback with each item
	 * @param array containing items ex.: ['item1', 'item2', 'item3']
	 * @param callback function that returns each item
	 */
	function forEach(array, callback) {
		if (typeof array[0] === 'undefined' ||
			!array.length ||
			!callback) { return; }

		var i = 0;

		for (i = 0; i < array.length; i += 1) {
			callback(array[i]);
		}
	}

	/**
	 * Loops through object elements and returns a callback with object item
	 * @param obj object containing items ex.: { item1: 'item1-value', item2: 'item2-value' }
	 * @param callback function that returns each item
	 */
	function loop(obj, callback) {
		var key;

		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				callback(obj[key], key);
			}
		}
	}

	/**
	 * Gets url parameters from given string or from current URL
	 * @param param string containing the key for which value is retreived
	 * @param dummyPath string path which will be searched for the param value
	 */
	function getUrlParameter(param, dummyPath) {
		var sPageURL = dummyPath || window.location.search.substring(1),
			sURLVariables = sPageURL.split(/[&||?]/),
			res;

		forEach(sURLVariables, function (paramName) {
			var sParameterName = (paramName || '').split('=');
			
			if (sParameterName[0] === param) {
				res = sParameterName[1];
			}
		});

		return res;
	}

	/**
	 * Checks if element is in viewport
	 * @param el element which is checked if its in the viewport
	 */
	function elementInViewport(el) {
		var el = el[0] || el,
			top = el.offsetTop,
			left = el.offsetLeft,
			width = el.offsetWidth,
			height = el.offsetHeight;

		while (el.offsetParent) {
			el = el.offsetParent;
			top += el.offsetTop;
			left += el.offsetLeft;
		}

		return (
			top < (window.pageYOffset + window.innerHeight) &&
			left < (window.pageXOffset + window.innerWidth) &&
			(top + height) > window.pageYOffset &&
			(left + width) > window.pageXOffset
		);
	}

	/**
	 * Gets event from element offset
	 * @param evt object event object which is returned from click, mouseover etc.
	 */
	function getEventPosition(evt) {
		if (evt.offsetX !== undefined) {
			return { x: evt.offsetX, y: evt.offsetY };
		}

		var el = evt.target,
			offset = { x: 0, y: 0 };

		while (el.offsetParent) {
			offset.x += el.offsetLeft;
			offset.y += el.offsetTop;
			el = el.offsetParent;
		}

		offset.x = evt.pageX - offset.x;
		offset.y = evt.pageY - offset.y;

		return offset;
	}

	/**
	 * Gets element offset
	 * @param obj object from element
	 */
	function getElementPosition(obj) {
		var obj = obj[0] || obj,
			curleft = 0,
			curtop = 0;

		if (obj.offsetParent) {
			do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
			} while (obj = obj.offsetParent);
		}

		return [curleft,curtop];
	}

	/**
	 * Reverses object and returns reversed key/values in callback
	 * @param obj object which is beigh reversed
	 * @param callback function ex.: function (key){ console.log('KEY:', key, 'VALUE:', this[key]); })
	 */
	function reverseObj(obj, callback) {
		var arr = [],
			key,
			i;

		loop(obj, function (value, key) {
			arr.push(key);
		});

		for (i = arr.length - 1; i >= 0; i -= 1) {
			callback.call(obj, arr[i]);
		}
	}

	/**
	 * Gets object size (might be usefull sometimes)
	 * @param obj object
	 */
	function objectSize(obj) {
		if (typeof obj !== 'object') { return; }

		var size = 0,
			key;

		loop(obj, function () {
			size += 1;
		});

		return size;
	}

	/**
	 * Checks if element object has the class
	 * @param obj object
	 * @param c string
	 */
	function hasClass(obj, c) {
		var obj = obj[0] || obj;

		return new RegExp('(\\s|^)' + c + '(\\s|$)').test(obj.className);
	}

	/**
	 * Adds class to element
	 * @param obj object
	 * @param c string
	 */
	function addClass(obj, c) {
		var obj = obj[0] || obj;

		if (!hasClass(obj, c)) {
			obj.className += ' ' + c;
		}
	}

	/**
	 * Removes class from element
	 * @param obj object
	 * @param c string
	 */
	function removeClass(obj, c) {
		var obj = obj[0] || obj;

		if (hasClass(obj, c)) {
			obj.className = obj.className.replace(new RegExp('(\\s|^)' + c + '(\\s|$)'), ' ').replace(/\s+/g, ' ').replace(/^\s|\s$/, '');
		}
	}

	/**
	 * Extends object (dest) and appends properties from source
	 * @param dest object
	 * @param source object
	 */
	function extend(dest, source) {

		loop(source, function (value, key) {
			
			if (dest.hasOwnProperty(key) && typeof dest[key] === 'object' && typeof value === 'object') {
				extend(dest[key], value);
			} else {
				dest[key] = value;
			}

		});

		return dest;
	}

	/**
	 * Gets current user location (if user doesn't disable the option)
	 * @param callback function which returns the positon coordinates
	 */
	function getLocation(callback) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				callback(position);
			});
		} else {
			alert("Geolocation is not supported by this browser.");
		}
	}

	/**
	 * Enables use of default parameter values
	 * @param callback function in which the parameters are returned as an object
	 * 
	 * @description
	 * d.fn('a=1', 'b="foo", 'c="bar"', function (params) { console.log(params); })
	 */
	function fn(callback) {
		if (!arguments.length) { return; }

		var callbackFn,
			params = {},
			bools = {
				'true': true, 
				'True': true, 
				'false': false,
				'False': false
			};

		function handleArgument(argument) {
			if (typeof argument === 'function') {
				callbackFn = argument;

			} else {
				var argumentArr = (argument || '').split('='),
					key = argumentArr[0],
					value = argumentArr[1];

				switch (true) {
					case typeof bools[value] !== 'undefined': value = bools[value];
						break;

					case argument.indexOf('"') !== -1: value = value.replace(/"/g, '');
						break;

					default: value = parseInt(value);
						break;
				}

				params[key] = value;
			}
		}

		forEach(arguments, handleArgument);

		if (typeof callbackFn !== 'undefined') {
			callbackFn(params);
		}
	}

	/**
	 * Binds data to string
	 * @param str string in which data which will be replaced is marked placed within '{}' brackets
	 * @param data object which keys are directly mapped in the string 
	 *
	 * @description
	 * data: { key: value }
	 * str:  'Example string with {key}' -> Example string with value
	 */
	function bindData(str, data) {
		if (!str || str === '' || typeof data !== 'object') { return; }

		loop(data, function (item, key) {
			str = str.replace('{' + key + '}', item);
		});

		return str;
	}

	/**
	 * Opens up new popup window
	 * @param link string
	 * @param title string 
	 * @param width number
	 * @param height number
	 *
	 * @description
	 * data: { key: value }
	 * str:  'Example string with {key}' -> Example string with value
	 */
	function pop(link, title, width, height) {
		var w = width || 600,
			h = height || 400,
			data = { 
				1: w, 
				2: h, 
				3: ((screen.height-h) / 2), 
				4: ((screen.width-w) / 2)
			},
			windowParams = bindData('resizable,toolbar=0,location=0,scrollbars=1,menubar=0,width={1},height={2},top={3},left={4}', data),
			newWindow = window.open(link, title, windowParams);
	}

	function publishAPI(d) {
		extend(d, {
			'info': info,
			'isIE': isIE,
			'forEach': forEach,
			'loop': loop,
			'getUrlParameter': getUrlParameter,
			'elementInViewport': elementInViewport,
			'getEventPosition': getEventPosition,
			'getElementPosition': getElementPosition,
			'reverseObj': reverseObj,
			'objectSize': objectSize,
			'extend': extend,
			'getLocation': getLocation,
			'fn': fn,
			'hasClass': hasClass,
			'addClass': addClass,
			'removeClass': removeClass,
			'bindData': bindData,
			'popWindow': popWindow
		});
	}

	publishAPI(d);

}(window, document));