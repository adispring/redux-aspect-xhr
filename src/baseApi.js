import xhr from 'xhr';
import Task from 'data.task';
import R from 'ramda';
import qs from 'querystring';

/*
let aspect = {
  requestStart: undefined,
  requestEnd: undefined,
  throwError: undefined,
};
*/

const requestCreator = R.curry((aops) => {
  let aspect = R.clone(aops);

  const invoke = (dispatch, type, ...args) => {
    if (R.is(Object, aspect[type])) {
      dispatch(aspect[type].apply(null, args));
    } else {
      throw new TypeError(`aspect.${type} is not an actionCreator or action!`);
    }
  };

  const configAspect = (aop) => {
    aspect = R.merge(aspect, aop);
  };
  // Hindley-Milner 类型签名
  // :: Object -> String -> Object -> Task Error Object
  const request =
    R.curry((opts, path, params, dispatch) =>
      new Task((reject, resolve) => {
        const { header, method, showLoading } = opts;
        const uri = R.equals('GET', method) ? `${path}?${qs.stringify(params)}` : path;
        const bodys = R.equals('GET', method) ? undefined : JSON.stringify(params);
        const headers = header
        ? R.merge({ 'Content-Type': 'application/json;charset=UTF-8' }, header)
        : {};
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
            data = R.compose(R.defaultTo({}), JSON.parse)(body);
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
        throw err;
      }));

  // :: String -> Object -> Task Error Object
  const getJson = request({ header: {}, method: 'GET', showLoading: true });
  const postJson = request({ header: {}, method: 'POST', showLoading: true });

  const getJsonSilence = request({ header: {}, method: 'GET', showLoading: false });
  const postJsonSilence = request({ header: {}, method: 'POST', showLoading: false });

  return ({
    request,
    getJson,
    postJson,
    getJsonSilence,
    postJsonSilence,
    configAspect,
  });
});

export default requestCreator;

