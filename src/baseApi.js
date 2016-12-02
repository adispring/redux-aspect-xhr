import xhr from 'xhr';
import Task from 'data.task';
import R from 'ramda';
import qs from 'qs';

/*
let aspect = {
  requestStart: undefined,
  requestEnd: undefined,
  throwError: undefined,
};
*/

export const createRequest = R.curry((opts) => {
  let aspect = R.clone(opts);

  const invoke = (dispatch, type, ...args) => {
    if (R.is(Object, aspect[type])) {
      dispatch(aspect[type].apply(null, args));
    } else {
      throw new TypeError(`aspect.${type} is not an actionCreator or action!`);
    }
  };

  const configAspect = (opt) => {
    aspect = R.merge(aspect, opt);
  };
  // Hindley-Milner 类型签名
  // :: String -> String -> Object -> Task Error Object
  const request =
    R.curry((preprocess, header, method, showLoading, path, params, dispatch) =>
      new Task((reject, resolve) => {
        const uri = R.equals('GET', method) ? `${path}?${qs.stringify(params)}` : path;
        const bodys = R.equals('GET', method) ? undefined : preprocess(params);
        const headers = header ? R.merge({ 'Content-Type': 'application/json' }, header) : {};
        headers['X-Requested-With'] = 'XMLHttpRequest';

        if (showLoading && !R.isNil(aspect.requestStart)) {
          invoke(dispatch, 'requestStart');
        }
        xhr({
          uri,
          method,
          headers,
          body: bodys,
        }, (err, resp, body) => {
          if (showLoading && !R.isNil(aspect.requestEnd)) {
            invoke(dispatch, 'requestEnd');
          }
          if (err) { return reject(err); }
          let data = {};
          try {
            data = R.compose(
            R.defaultTo({}),
            JSON.parse
            )(body);
          } catch (ex) {
            return reject({ message: '服务器异常，请刷新重试' });
          }
          const status = R.defaultTo(200, R.path(['error', 'code'], data));
          if (status !== 200) { return reject(R.path(['error'], data)); }
          return resolve(data);
        });
      })
      .rejectedMap((err) => {
        invoke(dispatch, 'throwError', err);
        return err;
      }));

  // :: String -> Object -> Task Error Object
  const getJson = request(JSON.stringify, {}, 'GET', true);
  const postJson = request(JSON.stringify, {}, 'POST', true);

  const getJsonSilence = request(JSON.stringify, {}, 'GET', false);
  const postJsonSilence = request(JSON.stringify, {}, 'POST', false);

  return ({
    request,
    getJson,
    postJson,
    getJsonSilence,
    postJsonSilence,
    configAspect,
  });
});

export default createRequest;

