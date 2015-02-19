(function (window, document, undefined) {
	'use strict';

	var d = window.d || (window.d = {}),
		info = {
			version: '0.1',
			codename: 'joyfull-dread'
		},
		isIE = /*@cc_on!@*/false, // TODO: Test if this works properly in all IE versions
		cookie;


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
	 * Default values can be set to variables like so: {{key="1"}}
	 * If the variable isn't replaced then it will fallback to its default value
	 */
	function bind(str, data) {
		if (!str || str === '' || typeof data !== 'object') { return; }

		loop(data, function (item, key) {
			str = str.replace('{' + key + '}', item);

			var re = new RegExp('{{' + key + '=.*?}}');

			if (re.test(str)) {
				str = str.replace(re, item);
			}
		});

		var matched = str.match(/{{(.*?)}}/g);

		if (matched !== null && matched.length) {
			forEach(matched, function (match) {
				var singleMatch = match.replace(/[{{||}}]/g, '').split('='),
					key = singleMatch[0],
					value = singleMatch[1].replace(/"/g, '');

				str = str.replace(match, value);
			});
		}

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
			windowParams = bind('resizable,toolbar=0,location=0,scrollbars=1,menubar=0,width={1},height={2},top={3},left={4}', data),
			newWindow = window.open(link, title, windowParams);
	}

	/**
	 * Manages cookies
	 *
	 * @description
	 * Object literal containing three actions which apply to cookies - create, get and delete
	 */
	cookie = {

		/**
		 * Creates new cookie
		 * @param name string
		 * @param value string 
		 * @param days number
		 * @param path string
		 *
		 * Example: cookie.create({ name: 'CookieName', value: 'Value', expires: 365, path: '/' })
		 */
		create: function (name, value, days, path) {
			var newCookie = '{name}={value}; expires={expires}; path={{path="/"}}',
				date,
				option = {
					name: name,
					value: value,
					days: days,
					path: path || '/'
				};

			if (days) {
				date = new Date();
				date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
				option.expires = date.toGMTString();
			}

			document.cookie = bind(newCookie, option);
		},

		/**
		 * Gets new cookie
		 * @param name string
		 *
		 * Example: cookie.get('cookieName');
		 */
		get: function (name) {
			var nameEQ = name + "=",
				ca = document.cookie.split(';'),
				i,
				c;

			i = ca.length;

			while (i--) {
				c = ca[i];

				while (c.charAt(0) === ' ') {
					c = c.substring(1, c.length);
				}

				if (c.indexOf(nameEQ) === 0) {
					return c.substring(nameEQ.length, c.length);
				}
			}

			return null;
		},

		/**
		 * Deletes existing cookie
		 * @param name string
		 *
		 * Example: cookie.delete('cookieName');
		 */
		delete: function (name) {
			cookie.create(name, '', -1);
		}
	};

	/**
	 * Makes ajax call
	 * @param options object
	 * @param callback function
	 *
	 * Example:
		d.ajax({
			method: 'POST',
			url: 'http://api.randomuser.me',
			async: true,
			data: {
				user: 'George',
				password: '1231231'
			},
			success: function (data) {
				console.log(data);
			},
			error: function (data) {
				console.log(data);
			},
			done: function (data) {
				console.log(data);
			}
		});
	 */
	function ajax(options) {
		var xmlhttp = new XMLHttpRequest(),
			dataSent = '';
			console.log(this);
		if (!options || typeof options !== 'object') { return; }

		xmlhttp.onreadystatechange = function () {

			if (xmlhttp.readyState === 4 ) {

				if (xmlhttp.status === 200 && typeof options.success === 'function') {
					options.success(xmlhttp);
				} else if (xmlhttp.status == 400 && typeof options.error === 'function') {
					options.error(xmlhttp);
				} else if (typeof options.done === 'function') {
					options.done(xmlhttp);
				}
			}

		};

		xmlhttp.open(options.method || 'GET', options.url, options.async || true);
		xmlhttp.setRequestHeader('Content-type', options.contentType || 'text/plain;charset=UTF-8');

		if (options.data) {
			loop(options.data, function (value, key) {
				dataSent += dataSent ? '&' : '';
				dataSent += bind('{key}={value}', { key: key, value: value });
			});

			xmlhttp.send(dataSent);
		} else {
			xmlhttp.send();
		}
		
	}

	/**
	 * Creates models and attaches URL to them
	 * @param url string
	 *
	 * Example:
		var User = new d.Model('http://api.randomuser.me/');
	 */
	function Model(url) {
		this.url = url;
	}

		/**
		 * Gets model data
		 * @param options object
		 * @param fnSuccess callback function - success
		 * @param fnError callback function - error
		 *
		 * Example:

		 	// Enables customization of data sent (url params, data and method)
		 	options = { 
				urlParams: '?page=1', data: {: { id: 1 }, method: 'GET' 
			}
			User.get(options, function (data) { console.log(data); });
			
			// Makes request without url params and data with default method GET
			User.get(function (data) { console.log(data); });
		 */
		Model.prototype.get = function (options, fnSuccess, fnError) {
			if (!options) { return; }

			if (typeof options === 'function') {
				var temp = fnSuccess;
				fnSuccess = options;
				fnError = temp;
			}

			ajax({
				url: this.url + (options.urlParams || ''),
				method: options.method || 'GET',
				data: options.data || {},
				success: fnSuccess,
				error: fnError
			});

			return;
		};

		/**
		 * Posts model data
		 * @param options object
		 * @param fnSuccess callback function - success
		 * @param fnError callback function - error
		 *
		 * Example:

		 	// Enables customization of data sent (url params, data and method)
		 	options = { 
				urlParams: '?page=1', query: { id: 1 }, method: 'GET' 
			}
			User.get(options, function (data) { console.log(data); });
			
			// Makes request without url params and data with default method GET
			User.get(function (data) { console.log(data); });
		 */
		Model.prototype.post = function (options, fnSuccess, fnError) {
			if (!options) { return; }

			if (typeof options === 'function') {
				var temp = fnSuccess;
				fnSuccess = options;
				fnError = temp;
			}

			ajax({
				url: this.url + (options.urlParams || ''),
				method: options.method || 'POST',
				data: options.data || {},
				success: fnSuccess,
				error: fnError
			});

			return;
		};

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
			'bind': bind,
			'pop': pop,
			'cookie': cookie,
			'Model': Model,
			'ajax': ajax
		});
	}

	publishAPI(d);

}(window, document));