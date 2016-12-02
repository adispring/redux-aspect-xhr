'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRequest = undefined;

var _xhr = require('xhr');

var _xhr2 = _interopRequireDefault(_xhr);

var _data = require('data.task');

var _data2 = _interopRequireDefault(_data);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
let aspect = {
  requestStart: undefined,
  requestEnd: undefined,
  throwError: undefined,
};
*/

var createRequest = exports.createRequest = _ramda2.default.curry(function (opts) {
  var aspect = _ramda2.default.clone(opts);

  var invoke = function invoke(dispatch, type) {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    if (_ramda2.default.is(Object, aspect[type])) {
      dispatch(aspect[type].apply(null, args));
    } else {
      throw new TypeError('aspect.' + type + ' is not an actionCreator or action!');
    }
  };

  var configAspect = function configAspect(opt) {
    aspect = _ramda2.default.merge(aspect, opt);
  };
  // Hindley-Milner 类型签名
  // :: String -> String -> Object -> Task Error Object
  var request = _ramda2.default.curry(function (preprocess, header, method, showLoading, path, params, dispatch) {
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
          return reject({ message: '服务器异常，请刷新重试' });
        }
        var status = _ramda2.default.defaultTo(200, _ramda2.default.path(['error', 'code'], data));
        if (status !== 200) {
          return reject(_ramda2.default.path(['error'], data));
        }
        return resolve(data);
      });
    }).rejectedMap(function (err) {
      invoke(dispatch, 'throwError', err);
      return err;
    });
  });

  // :: String -> Object -> Task Error Object
  var getJson = request(JSON.stringify, {}, 'GET', true);
  var postJson = request(JSON.stringify, {}, 'POST', true);

  var getJsonSilence = request(JSON.stringify, {}, 'GET', false);
  var postJsonSilence = request(JSON.stringify, {}, 'POST', false);

  return {
    request: request,
    getJson: getJson,
    postJson: postJson,
    getJsonSilence: getJsonSilence,
    postJsonSilence: postJsonSilence,
    configAspect: configAspect
  };
});