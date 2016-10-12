'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postJsonSilence = exports.getJsonSilence = exports.postJson = exports.getJson = exports.request = exports.configAspect = undefined;

var _xhr = require('xhr');

var _xhr2 = _interopRequireDefault(_xhr);

var _data = require('data.task');

var _data2 = _interopRequireDefault(_data);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var aspect = {
  requestStart: undefined,
  requestEnd: undefined,
  throwError: undefined
};

var invoke = function invoke(dispatch, type) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  if (_ramda2.default.is(Object, aspect[type])) {
    dispatch(aspect[type].apply(null, args));
    console.log(type);
  } else {
    throw new TypeError('aspect.' + type + ' is not an actionCreator or action!');
  }
};

var configAspect = exports.configAspect = function configAspect(aspects) {
  aspect = aspects;
};

// Hindley-Milner 类型签名
// :: String -> String -> Object -> Task Error Object
var request = exports.request = _ramda2.default.curry(function (preprocess, header, method, showLoading, path, params, dispatch) {
  return new _data2.default(function (reject, resolve) {
    var uri = _ramda2.default.equals('GET', method) ? path + '?' + _qs2.default.stringify(params) : path;
    var bodys = _ramda2.default.equals('GET', method) ? undefined : preprocess(params);
    var headers = header ? _ramda2.default.merge({ 'Content-Type': 'application/json' }, header) : {};
    headers['X-Requested-With'] = 'XMLHttpRequest';

    if (showLoading && !_ramda2.default.isNil(aspect.requestStart)) {
      invoke(dispatch, 'requestStart');
    }
    (0, _xhr2.default)({
      uri: uri,
      method: method,
      headers: headers,
      body: bodys
    }, function (err, resp, body) {
      if (showLoading && !_ramda2.default.isNil(aspect.requestEnd)) {
        invoke(dispatch, 'requestEnd');
      }
      if (err) {
        return reject(err);
      }
      var data = {};
      try {
        data = _ramda2.default.compose(_ramda2.default.defaultTo({}), JSON.parse)(body);
      } catch (ex) {
        return reject('服务器异常，请刷新重试');
      }
      var status = _ramda2.default.defaultTo(200, _ramda2.default.path(['error', 'code'], data));
      var errorMsg = _ramda2.default.defaultTo('', _ramda2.default.path(['error', 'message'], data));
      if (status !== 200) {
        return reject(errorMsg);
      }
      return resolve(data);
    });
  }).rejectedMap(function (err) {
    invoke(dispatch, 'throwError', err);
    return err;
  });
});

// :: String -> Object -> Task Error Object
var getJson = exports.getJson = request(JSON.stringify, {}, 'GET', true);
var postJson = exports.postJson = request(JSON.stringify, {}, 'POST', true);

var getJsonSilence = exports.getJsonSilence = request(JSON.stringify, {}, 'GET', false);
var postJsonSilence = exports.postJsonSilence = request(JSON.stringify, {}, 'POST', false);