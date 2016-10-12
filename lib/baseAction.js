'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var THROW_ERROR = exports.THROW_ERROR = 'bbia/frameworks/THROW_ERROR';
var REQUEST_START = exports.REQUEST_START = 'REQUEST_START';
var REQUEST_END = exports.REQUEST_END = 'REQUEST_END';

var requestStart = exports.requestStart = function requestStart() {
  return {
    type: REQUEST_START
  };
};

var requestEnd = exports.requestEnd = function requestEnd() {
  return {
    type: REQUEST_END
  };
};

var throwError = exports.throwError = function throwError(error) {
  return function (dispatch) {
    dispatch({
      type: THROW_ERROR,
      error: true,
      payload: error
    });
  };
};