"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./components/ErrorBoundary.js":
/*!*************************************!*\
  !*** ./components/ErrorBoundary.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nclass ErrorBoundary extends (react__WEBPACK_IMPORTED_MODULE_1___default().Component) {\n    constructor(props){\n        super(props);\n        this.state = {\n            hasError: false\n        };\n    }\n    static getDerivedStateFromError(error) {\n        return {\n            hasError: true\n        };\n    }\n    componentDidCatch(error, errorInfo) {\n        console.error(\"Error caught:\", error, errorInfo);\n    }\n    render() {\n        if (this.state.hasError) {\n            return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                children: \"出现了一些问题。\"\n            }, void 0, false, {\n                fileName: \"E:\\\\ynnai_beat 1.2\\\\components\\\\ErrorBoundary.js\",\n                lineNumber: 19,\n                columnNumber: 14\n            }, this);\n        }\n        return this.props.children;\n    }\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ErrorBoundary);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb21wb25lbnRzL0Vycm9yQm91bmRhcnkuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQTBCO0FBRTFCLE1BQU1DLHNCQUFzQkQsd0RBQWU7SUFDekNHLFlBQVlDLEtBQUssQ0FBRTtRQUNqQixLQUFLLENBQUNBO1FBQ04sSUFBSSxDQUFDQyxLQUFLLEdBQUc7WUFBRUMsVUFBVTtRQUFNO0lBQ2pDO0lBRUEsT0FBT0MseUJBQXlCQyxLQUFLLEVBQUU7UUFDckMsT0FBTztZQUFFRixVQUFVO1FBQUs7SUFDMUI7SUFFQUcsa0JBQWtCRCxLQUFLLEVBQUVFLFNBQVMsRUFBRTtRQUNsQ0MsUUFBUUgsS0FBSyxDQUFDLGlCQUFpQkEsT0FBT0U7SUFDeEM7SUFFQUUsU0FBUztRQUNQLElBQUksSUFBSSxDQUFDUCxLQUFLLENBQUNDLFFBQVEsRUFBRTtZQUN2QixxQkFBTyw4REFBQ087MEJBQUc7Ozs7OztRQUNiO1FBRUEsT0FBTyxJQUFJLENBQUNULEtBQUssQ0FBQ1UsUUFBUTtJQUM1QjtBQUNGO0FBRUEsaUVBQWViLGFBQWFBLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9haS1pbWFnZS10b29sLy4vY29tcG9uZW50cy9FcnJvckJvdW5kYXJ5LmpzP2M5YWIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcclxuXHJcbmNsYXNzIEVycm9yQm91bmRhcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xyXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcyk7XHJcbiAgICB0aGlzLnN0YXRlID0geyBoYXNFcnJvcjogZmFsc2UgfTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IoZXJyb3IpIHtcclxuICAgIHJldHVybiB7IGhhc0Vycm9yOiB0cnVlIH07XHJcbiAgfVxyXG5cclxuICBjb21wb25lbnREaWRDYXRjaChlcnJvciwgZXJyb3JJbmZvKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjYXVnaHQ6JywgZXJyb3IsIGVycm9ySW5mbyk7XHJcbiAgfVxyXG5cclxuICByZW5kZXIoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0ZS5oYXNFcnJvcikge1xyXG4gICAgICByZXR1cm4gPGgxPuWHuueOsOS6huS4gOS6m+mXrumimOOAgjwvaDE+O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRXJyb3JCb3VuZGFyeTsgIl0sIm5hbWVzIjpbIlJlYWN0IiwiRXJyb3JCb3VuZGFyeSIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzdGF0ZSIsImhhc0Vycm9yIiwiZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yIiwiZXJyb3IiLCJjb21wb25lbnREaWRDYXRjaCIsImVycm9ySW5mbyIsImNvbnNvbGUiLCJyZW5kZXIiLCJoMSIsImNoaWxkcmVuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./components/ErrorBoundary.js\n");

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _components_ErrorBoundary__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/ErrorBoundary */ \"./components/ErrorBoundary.js\");\n\n\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ErrorBoundary__WEBPACK_IMPORTED_MODULE_1__[\"default\"], {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"E:\\\\ynnai_beat 1.2\\\\pages\\\\_app.js\",\n            lineNumber: 6,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"E:\\\\ynnai_beat 1.2\\\\pages\\\\_app.js\",\n        lineNumber: 5,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQXdEO0FBRXhELFNBQVNDLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQUU7SUFDckMscUJBQ0UsOERBQUNILGlFQUFhQTtrQkFDWiw0RUFBQ0U7WUFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7OztBQUc5QjtBQUVBLGlFQUFlRixLQUFLQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYWktaW1hZ2UtdG9vbC8uL3BhZ2VzL19hcHAuanM/ZTBhZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXJyb3JCb3VuZGFyeSBmcm9tICcuLi9jb21wb25lbnRzL0Vycm9yQm91bmRhcnknO1xyXG5cclxuZnVuY3Rpb24gTXlBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9KSB7XHJcbiAgcmV0dXJuIChcclxuICAgIDxFcnJvckJvdW5kYXJ5PlxyXG4gICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XHJcbiAgICA8L0Vycm9yQm91bmRhcnk+XHJcbiAgKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTXlBcHA7ICJdLCJuYW1lcyI6WyJFcnJvckJvdW5kYXJ5IiwiTXlBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/_app.js"));
module.exports = __webpack_exports__;

})();