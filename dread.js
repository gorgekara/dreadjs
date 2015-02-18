'use strict';

/**
 * 	@description
 *	Create the initial dread module
 */
var dread = window.dread || (window.dread = {});


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
            callback(obj[key]);
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
function elementInViewport (el) {
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

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            arr.push(key);
        }
    }

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
};