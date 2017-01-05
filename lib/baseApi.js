'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _xhr = require('xhr');

var _xhr2 = _interopRequireDefault(_xhr);

var _data = require('data.task');

var _data2 = _interopRequireDefault(_data);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
let aspect = {
  requestStart: undefined,
  requestEnd: undefined,
  throwError: undefined,
};
*/

var requestCreator = _ramda2.default.curry(function (aops) {
  var aspect = _ramda2.default.clone(aops);

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

  var configAspect = function configAspect(aop) {
    aspect = _ramda2.default.merge(aspect, aop);
  };
  // Hindley-Milner 类型签名
  // :: Object -> String -> Object -> Task Error Object
  var request = _ramda2.default.curry(function (opts, path, params, dispatch) {
    return new _data2.default(function (reject, resolve) {
      var header = opts.header,
          method = opts.method,
          showLoading = opts.showLoading;

      var uri = _ramda2.default.equals('GET', method) ? path + '?' + _querystring2.default.stringify(params) : path;
      var bodys = _ramda2.default.equals('GET', method) ? undefined : JSON.stringify(params);
      var headers = _ramda2.default.compose(_ramda2.default.assoc('X-Requested-With', 'XMLHttpRequest'), _ramda2.default.merge({ 'Content-Type': 'application/json;charset=UTF-8' }), _ramda2.default.defaultTo({}))(header);

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
          return reject(ex);
        }
        var status = _ramda2.default.defaultTo(200, _ramda2.default.path(['error', 'code'], data));
        if (status !== 200) {
          return reject(_ramda2.default.path(['error'], data));
        }
        return resolve(data);
      });
    }).rejectedMap(function (err) {
      invoke(dispatch, 'throwError', err);
      throw err;
    });
  });

  // :: String -> Object -> Task Error Object
  var getJson = request({ header: {}, method: 'GET', showLoading: true });
  var postJson = request({ header: {}, method: 'POST', showLoading: true });

  var getJsonSilence = request({ header: {}, method: 'GET', showLoading: false });
  var postJsonSilence = request({ header: {}, method: 'POST', showLoading: false });

  return {
    request: request,
    getJson: getJson,
    postJson: postJson,
    getJsonSilence: getJsonSilence,
    postJsonSilence: postJsonSilence,
    configAspect: configAspect
  };
});

exports.default = requestCreator;