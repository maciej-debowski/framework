/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./packages/core/app.ts":
/*!******************************!*\
  !*** ./packages/core/app.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {



/**
 *
 * @package @Framework/core
 */
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.App = void 0;
var App = /** @class */function () {
  function App(elementID, component) {
    this.rootComponent = component;
    this.elementID = elementID;
    this.onInit();
  }
  App.prototype.onInit = function () {
    this.giveFID(document.querySelector(this.elementID), this.elementID);
    this.rootComponent.check();
    this.rootComponent.mountTo(this.elementID);
  };
  App.prototype.giveFID = function (element, id) {
    element.setAttribute("f-id", id);
  };
  return App;
}();
exports.App = App;

/***/ }),

/***/ "./packages/core/attr.ts":
/*!*******************************!*\
  !*** ./packages/core/attr.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {



/**
 *
 * @package @Framework/core
 */
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Attribute = void 0;
var Attribute = /** @class */function () {
  function Attribute(name, value) {
    this.name = name;
    this.value = value;
  }
  return Attribute;
}();
exports.Attribute = Attribute;

/***/ }),

/***/ "./packages/core/component.ts":
/*!************************************!*\
  !*** ./packages/core/component.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



/**
 *
 * @package @Framework/core
 */
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Component = void 0;
var node_1 = __webpack_require__(/*! ./node */ "./packages/core/node.ts");
var ref_1 = __webpack_require__(/*! ./ref */ "./packages/core/ref.ts");
var Component = /** @class */function () {
  function Component() {
    this.id = Math.round(Math.random() * 1e9).toString(36);
    this.$childrenComponents = [];
  }
  Component.prototype.onBuildStart = function () {
    return "";
  };
  Component.prototype.data = function () {};
  Component.prototype.onMounted = function () {};
  Component.prototype.use = function (name, component) {
    this.$childrenComponents.push({
      name: name,
      component: component
    });
  };
  Component.prototype.check = function () {
    // Checking if data is valid
  };
  Component.prototype.mountTo = function (elementId) {
    this.parentElementId = elementId;
    this.parentElement = document.querySelector("[f-id=\"".concat(elementId, "\"]"));
    this.parentElement.innerHTML = "<Component-fMount f-id=\"".concat(this.id, "\"></Component-fMount>");
    this.$data = this.data();
    this.nodeTree = (0, node_1.createNodeTree)(this.onBuildStart());
    this.render();
  };
  Component.prototype.setData = function (name, value) {
    this.$data[name] = value;
  };
  Component.prototype.render = function () {
    var sessionId = Math.round(Math.random() * 1e9);
    eval("window.framework_reload=".concat(sessionId, ";"));
    var mount = this.parentElement.querySelector("[f-id=\"".concat(this.id, "\"]"));
    mount.innerHTML = "";
    this.methods.app = this;
    this.nodeTree.renderNode(mount, this.$data, this.methods, this);
    this.onMounted();
    if (eval("window.framework_reload") == sessionId) eval("window.framework_reload=false");
  };
  Component.prototype.createRef = function (name) {
    return new ref_1.Reference(this, name);
  };
  return Component;
}();
exports.Component = Component;

/***/ }),

/***/ "./packages/core/listener.ts":
/*!***********************************!*\
  !*** ./packages/core/listener.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {



/**
 *
 * @package @Framework/core
 */
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Listener = void 0;
var Listener = /** @class */function () {
  function Listener(eventName, callback) {
    this.eventName = eventName.split("[event.")[1].split("]")[0];
    this.callback = callback.replace(/\@/g, 'methods.');
  }
  return Listener;
}();
exports.Listener = Listener;

/***/ }),

/***/ "./packages/core/node.ts":
/*!*******************************!*\
  !*** ./packages/core/node.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



/**
 *
 * @package @Framework/core
 */
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createNodeTree = exports.FNode = void 0;
var vdom_1 = __webpack_require__(/*! ./vdom */ "./packages/core/vdom.ts");
var listener_1 = __webpack_require__(/*! ./listener */ "./packages/core/listener.ts");
var attr_1 = __webpack_require__(/*! ./attr */ "./packages/core/attr.ts");
var ref_1 = __webpack_require__(/*! ./ref */ "./packages/core/ref.ts");
var RELOAD_MIN_SPEED = 0; // miliseconds
var FNode = /** @class */function () {
  /**
   *
   * @param elementHTML
   * @param isText Node is type === 3 (TEXT NODE)
   * @param parent
   */
  function FNode(elementHTML, isText, parent) {
    var _this = this;
    var _a;
    this.parent = parent;
    this.isText = isText;
    this.elementHTML = elementHTML;
    this.element = (0, vdom_1.stringToElement)(elementHTML);
    this.children = [];
    this.attributes = [];
    this.focused = false;
    if (isText) this.text = elementHTML;
    var children = ((_a = this.element) === null || _a === void 0 ? void 0 : _a.childNodes) ? Array.from(this.element.childNodes) : [];
    if (children.length > 0) {
      for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
        var child = children_1[_i];
        if (child) this.children.push(new FNode(child.nodeType === 3 ? child.nodeValue : child.outerHTML, child.nodeType === 3, this));
      }
    }
    // Attributies
    if (!(this.element instanceof Text)) this.element.getAttributeNames().forEach(function (name) {
      _this.attributes.push(new attr_1.Attribute(name, _this.element.getAttribute(name)));
    });
  }
  FNode.prototype.evaluateDataToString = function (text, data) {
    var dataRE = /\{\{((?:.|\n)+?)\}\}/g;
    var matches = text.match(dataRE);
    if (!matches) return text;
    matches.forEach(function (match) {
      var $inside = match.split("{{")[1].split("}}")[0].replace(/\$/g, 'data.');
      var $value = eval($inside);
      text = text.replace(match, $value);
    });
    return text;
  };
  FNode.prototype.getListeners = function (element) {
    var listeners = [];
    var listenerRE = /\[event\.[\w]+\]/g;
    this.attributes.forEach(function (attr) {
      if (attr.name.match(listenerRE)) {
        listeners.push(new listener_1.Listener(attr.name, attr.value));
      }
    });
    return listeners;
  };
  FNode.prototype.setReferences = function (id, element, self) {
    var attrRE = /\[ref\.value\]/g;
    this.attributes.forEach(function (attr) {
      if (attr.name.match(attrRE)) {
        var ref_2 = new ref_1.Reference(self, attr.value);
        setTimeout(function () {
          var _element = document.querySelector("[f-id=\"".concat(id, "\"]"));
          _element.value = self.$data[attr.value];
          _element.addEventListener("input", function () {
            ref_2.set(_element.value);
          });
        }, RELOAD_MIN_SPEED);
      }
    });
  };
  FNode.prototype.bindAttributes = function (id, methods, self) {
    var _this = this;
    setTimeout(function () {
      _this.attributes.forEach(function (attr) {
        var isBinding = attr.name.startsWith("f-");
        if (isBinding) {
          var real = attr.name.split("f-")[1];
          var value = attr.value.replace('@', 'methods.');
          var realValue = eval("".concat(value))(self);
          document.querySelector("[f-id=\"".concat(id, "\"]")).setAttribute(real, realValue);
        }
      });
    }, RELOAD_MIN_SPEED);
  };
  FNode.prototype.refreshState = function (id) {
    // TODO: checked selected
    if (this.focused) {
      setTimeout(function () {
        eval("document.querySelector('[f-id=\"".concat(id, "\"]').focus()"));
      }, RELOAD_MIN_SPEED);
    }
  };
  FNode.prototype.renderAsComponent = function (id, self) {
    var _this = this;
    var _class = self.$childrenComponents.find(function (component) {
      return component.name.toLowerCase() == _this.element.tagName.toLowerCase();
    });
    if (!_class) return;
    var component = _class.component;
    var instance = new component();
    instance.check();
    instance.mountTo(id);
  };
  FNode.prototype.renderNode = function (mountTo, data, methods, self) {
    var _this = this;
    if (!this.element) return;
    if (this.isText) {
      mountTo.innerHTML += this.evaluateDataToString(this.text, data);
    } else {
      var element_1 = document.createElement(this.element.tagName);
      mountTo.append(element_1);
      var id_1 = 'ev-' + Math.round(Math.random() * 1e18).toString(36);
      element_1.setAttribute('f-id', id_1);
      // Attributes
      this.attributes.forEach(function (attr) {
        if (attr.name.indexOf('[') != -1) return;
        element_1.setAttribute(attr.name, attr.value);
      });
      // Events
      var eventListeners = this.getListeners(element_1);
      eventListeners.forEach(function (listener) {
        setTimeout(function () {
          var _element = document.querySelector("[f-id=\"".concat(id_1, "\"]"));
          _element.addEventListener(listener.eventName, function () {
            eval("(() => ".concat(listener.callback, "())();"));
          });
        }, RELOAD_MIN_SPEED);
      });
      if (this.attributes.find(function (attr) {
        return attr.name === 'render';
      })) {
        this.renderAsComponent(id_1, self);
        return;
      }
      // References
      this.setReferences(id_1, element_1, self);
      // Refresh state
      this.refreshState(id_1);
      // Binding Attributes
      this.bindAttributes(id_1, methods, self);
      // State Listeners
      setTimeout(function () {
        var _element = document.querySelector("[f-id=\"".concat(id_1, "\"]"));
        _element.addEventListener("focus", function () {
          _this.focused = true;
        });
        _element.addEventListener("blur", function () {
          if (eval("window.framework_reload")) return;
          _this.focused = false;
        });
        _element.addEventListener("input", function () {
          if (eval("window.framework_reload")) return;
          _this.value = _element instanceof HTMLInputElement ? _element.value : '';
        });
      }, RELOAD_MIN_SPEED);
      // Children rendering
      this.children.forEach(function (child) {
        child.renderNode(element_1, data, methods, self);
      });
    }
  };
  return FNode;
}();
exports.FNode = FNode;
function createNodeTree(htmlString) {
  return new FNode(htmlString, false, null);
}
exports.createNodeTree = createNodeTree;

/***/ }),

/***/ "./packages/core/ref.ts":
/*!******************************!*\
  !*** ./packages/core/ref.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {



/**
 *
 * @package @Framework/core
 */
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Reference = void 0;
var Reference = /** @class */function () {
  function Reference(self, name) {
    this.self = self;
    this.name = name;
  }
  Reference.prototype.get = function () {
    return this.self.$data[this.name];
  };
  Reference.prototype.set = function (value) {
    var old = this.get();
    this.self.setData(this.name, value);
    if (old !== value) this.self.render(); // Re-Rendering Component if data are changed
  };

  return Reference;
}();
exports.Reference = Reference;

/***/ }),

/***/ "./packages/core/vdom.ts":
/*!*******************************!*\
  !*** ./packages/core/vdom.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {



/**
 *
 * @package @Framework/core
 */
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.stringToElement = void 0;
function stringToElement(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString;
  return div.childNodes[0];
}
exports.stringToElement = stringToElement;

/***/ }),

/***/ "./packages/packages.ts":
/*!******************************!*\
  !*** ./packages/packages.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Reference = exports.Component = exports.App = void 0;
var app_1 = __webpack_require__(/*! ./core/app */ "./packages/core/app.ts");
Object.defineProperty(exports, "App", ({
  enumerable: true,
  get: function get() {
    return app_1.App;
  }
}));
var component_1 = __webpack_require__(/*! ./core/component */ "./packages/core/component.ts");
Object.defineProperty(exports, "Component", ({
  enumerable: true,
  get: function get() {
    return component_1.Component;
  }
}));
var ref_1 = __webpack_require__(/*! ./core/ref */ "./packages/core/ref.ts");
Object.defineProperty(exports, "Reference", ({
  enumerable: true,
  get: function get() {
    return ref_1.Reference;
  }
}));

/***/ }),

/***/ "./tests/src/components/App.ts":
/*!*************************************!*\
  !*** ./tests/src/components/App.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {



var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };
    return _extendStatics(d, b);
  };
  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    _extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
var cokeframework_1 = __webpack_require__(/*! cokeframework */ "./packages/packages.ts");
var ButtonRate_1 = __webpack_require__(/*! ./ButtonRate */ "./tests/src/components/ButtonRate.ts");
var App = /** @class */function (_super) {
  __extends(App, _super);
  function App() {
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this.methods = {
      promptName: function promptName() {
        this.app.nameRef.set(prompt("Your name:"));
      },
      getClass: function getClass(app) {
        return app.nameRef.get().length % 2 == 0 ? "italic" : "";
      }
    };
    return _this;
  }
  App.prototype.onBuildStart = function () {
    this.use('ButtonRate', ButtonRate_1["default"]);
    return "<div id=\"app-root\">\n            <h1>\n                Hello, <span f-class=\"@getClass\">{{ $name }}</span>!\n            </h1>\n\n            <input placeholder=\"Name\" [Ref.Value]=\"name\">\n            <button [Event.click]=\"@promptName\">Prompt your name</button>\n\n            <br>\n\n            <h1>Data: {{$data}}</h1>\n\n            <br>\n\n            <ButtonRate render></ButtonRate>\n        </div>";
  };
  App.prototype.styles = function () {
    return "";
  };
  App.prototype.data = function () {
    return {
      name: "world",
      data: "".concat(new Date().getHours(), ":").concat(new Date().getMinutes(), ":").concat(new Date().getSeconds())
    };
  };
  App.prototype.onMounted = function () {
    this.nameRef = this.createRef("name");
  };
  return App;
}(cokeframework_1.Component);
exports["default"] = App;

/***/ }),

/***/ "./tests/src/components/ButtonRate.ts":
/*!********************************************!*\
  !*** ./tests/src/components/ButtonRate.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {



var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };
    return _extendStatics(d, b);
  };
  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    _extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
var cokeframework_1 = __webpack_require__(/*! cokeframework */ "./packages/packages.ts");
var ButtonRate = /** @class */function (_super) {
  __extends(ButtonRate, _super);
  function ButtonRate() {
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this.methods = {
      rate: function rate(_rate) {
        console.log(_rate);
        this.app.rateRef.set(_rate);
      }
    };
    return _this;
  }
  ButtonRate.prototype.onBuildStart = function () {
    return "<div id=\"rate\" style=\"margin-top: 32px;\">\n            <h3>Rate us ({{$rate}} / 5):</h3>\n\n            <button [Event.click]=\"(()=>@rate(1))\">*</button>\n            <button [Event.click]=\"(()=>@rate(2))\">*</button>\n            <button [Event.click]=\"(()=>@rate(3))\">*</button>\n            <button [Event.click]=\"(()=>@rate(4))\">*</button>\n            <button [Event.click]=\"(()=>@rate(5))\">*</button>\n        </div>";
  };
  ButtonRate.prototype.styles = function () {
    return "";
  };
  ButtonRate.prototype.data = function () {
    return {
      rate: 4
    };
  };
  ButtonRate.prototype.onMounted = function () {
    this.rateRef = new cokeframework_1.Reference(this, "rate");
  };
  return ButtonRate;
}(cokeframework_1.Component);
exports["default"] = ButtonRate;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!****************************!*\
  !*** ./tests/src/index.ts ***!
  \****************************/


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
var cokeframework_1 = __webpack_require__(/*! cokeframework */ "./packages/packages.ts");
var App_1 = __webpack_require__(/*! ./components/App */ "./tests/src/components/App.ts");
var app = new cokeframework_1.App("#app", new App_1["default"]());
})();

/******/ })()
;