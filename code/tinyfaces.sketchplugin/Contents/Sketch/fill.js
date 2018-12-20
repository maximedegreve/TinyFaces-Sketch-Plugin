var that = this;
function __skpm_run (key, context) {
  that.context = context;

var exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/fill.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/fill.js":
/*!*********************!*\
  !*** ./src/fill.js ***!
  \*********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var sketch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! sketch */ "sketch");
/* harmony import */ var sketch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(sketch__WEBPACK_IMPORTED_MODULE_0__);
 // documentation: https://developer.sketchapp.com/reference/api/

/* harmony default export */ __webpack_exports__["default"] = (function () {
  var doc = sketch__WEBPACK_IMPORTED_MODULE_0___default.a.getSelectedDocument();
  var selection = doc.selectedLayers;

  if (selection.length == 0) {
    sketch__WEBPACK_IMPORTED_MODULE_0___default.a.UI.message("Something went wrong while contacting tinyfac.es. Try again later?");
    return;
  }

  var minQuality = 0;

  if (identifier == "fillhigh") {
    minQuality = 6;
  }

  var gender = "";

  if (identifier == "fillmale") {
    gender = "male";
  }

  if (identifier == "fillfemale") {
    gender = "female";
  }

  var data = getRandomData(gender, minQuality);

  if (data.length == 0) {
    sketch__WEBPACK_IMPORTED_MODULE_0___default.a.UI.message("Something went wrong getting data from tinyfac.es. Try again later?");
    return;
  }

  var imagesArray = [];
  var namesArray = [];
  data.forEach(function (item) {
    var imageURL = item.avatars[2].url;
    imagesArray.push(imageURL);
    var name = item.first_name + " " + item.last_name;
    namesArray.push(name);
  });

  if (hasDifferentSymbols(selection)) {
    sketch__WEBPACK_IMPORTED_MODULE_0___default.a.alert("You can't have different types of symbols selected when using this.", "Make sure you only have one type of symbol and try again.");
    return;
  }

  var firstSymbolMaster = getFirstSymbolMaster(selection);
  var layerOverride;

  if (firstSymbolMaster) {
    var layer = askForLayerToReplaceInSymbol(firstSymbolMaster, context);
    layerOverride = layer;
  }

  selection.forEach(function (layer) {
    fillLayer(layer, imagesArray, namesArray, context, layerOverride);
  });
});

function askForLayerToReplaceInSymbol(master, context) {
  var layersInMaster = master.children();
  var filtered = filterLayersToOverrideable(layersInMaster);
  var names = [];

  for (var i = 0; i < filtered.length; i++) {
    var name = filtered[i].name();
    names.push(name);
  }

  var inputs = names;
  var gotInput = context.api().getSelectionFromUser("What layer would you like to fill with random data?", inputs, 0);
  var chosenIndex = gotInput[1];
  var targetLayer = filtered[chosenIndex];
  return targetLayer;
}

function getFirstSymbolMaster(layers) {
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].className() == "MSSymbolInstance") {
      var master = layers[i].symbolMaster();
      return master;
    }
  }

  return false;
}

function requestWithURL(url) {
  var request = NSURLRequest.requestWithURL(NSURL.URLWithString(url));
  return NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);
}

function getRandomData(gender, min_quality) {
  var genderQuery = "";

  if (gender == "male") {
    genderQuery = "&gender=male";
  } else if (gender == "female") {
    genderQuery = "&gender=female";
  }

  var queryString = "https://tinyfac.es/api/users/?min_quality=" + min_quality + genderQuery;

  try {
    var response = requestWithURL(queryString);

    if (response) {
      return response;
    } else {
      throw "⚠️ TinyFaces can't be contacted. Check your internet...";
    }
  } catch (e) {
    log(e);
    UI.message(e);
    return;
  }
}

function getFirstAndRemoveFromArray(array) {
  var value = array.splice(0, 1)[0];
  return value;
}

function hasDifferentSymbols(layers) {
  var seenUUIDs = [];

  for (var i = 0; i < layers.length; i++) {
    if (layers[i].className() == "MSSymbolInstance") {
      var uuid = layers[i].symbolMaster().objectID();

      if (seenUUIDs.indexOf(uuid) === -1) {
        seenUUIDs.push(uuid);
      }
    }
  }

  if (seenUUIDs.length > 1) {
    return true;
  }

  return false;
}

function filterLayersToOverrideable(layers) {
  var possible = [];
  layers.forEach(function (layer) {
    if (layer.className() == "MSTextLayer") {
      possible.push(layer);
    } else if (layer.className() == "MSShapeGroup") {
      var fills = layer.style().fills();

      if (fills[0].image()) {
        possible.push(layer);
      }
    }
  });
  return possible;
}

function fillLayer(layer, imagesArray, namesArray, context, layerOverride) {
  if (layer.className() == "MSTextLayer") {
    var name = getFirstAndRemoveFromArray(namesArray);
    layer.stringValue = name;
  } else if (layer.className() == "MSSymbolInstance") {
    if (layerOverride) {
      // update the mutable dictionary
      if (layerOverride.className() == "MSShapeGroup") {
        var imageURLString = getFirstAndRemoveFromArray(imagesArray);
        var imageData = generateImageData(imageURLString); // Get existing overrides or make one if none exists

        var newOverrides = layer.overrides();

        if (newOverrides == null) {
          newOverrides = {};
        } // Create mutable copy


        var mutableOverrides = NSMutableDictionary.dictionaryWithDictionary(newOverrides);
        mutableOverrides.setObject_forKey(NSMutableDictionary.dictionaryWithDictionary(newOverrides.objectForKey(0)), 0); // Change item in the overrides

        mutableOverrides.setObject_forKey(imageData, layerOverride.objectID()); // Change overrides

        layer.overrides = mutableOverrides;
      } else if (layerOverride.className() == "MSTextLayer") {
        var name = getFirstAndRemoveFromArray(namesArray); // Get existing overrides or make one if none exists

        var newOverrides = layer.overrides();

        if (newOverrides == null) {
          newOverrides = {};
        } // Create mutable copy


        var mutableOverrides = NSMutableDictionary.dictionaryWithDictionary(newOverrides);
        mutableOverrides.setObject_forKey(NSMutableDictionary.dictionaryWithDictionary(newOverrides.objectForKey(0)), 0); // Change item in the overrides

        mutableOverrides.setObject_forKey(name, layerOverride.objectID()); // Change overrides

        layer.overrides = mutableOverrides;
      }
    }
  } else if (layer.className() == "MSShapeGroup") {
    var imageURLString = getFirstAndRemoveFromArray(imagesArray);
    var fill = layer.style().fills().firstObject();
    fill.setFillType(4);
    fill.setImage(generateImageData(imageURLString));
    fill.setPatternFillType(1);
  } else if (layer.className() == "MSLayerGroup") {
    layer.layers().forEach(function (layer) {
      fillLayer(layer, imagesArray, namesArray, context);
    });
  }
}

/***/ }),

/***/ "sketch":
/*!*************************!*\
  !*** external "sketch" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sketch");

/***/ })

/******/ });
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['onRun'] = __skpm_run.bind(this, 'default')

//# sourceMappingURL=fill.js.map