const EFFECT_TYPES = {
  TAKE: 'TAKE',
  SELECT: 'SELECT',
  CALL: 'CALL',
  PUT: 'PUT',
  FORK: 'FORK',
}

export const take = actionType => ({ type: EFFECT_TYPES.TAKE, actionType })
export const select = selector => ({ type: EFFECT_TYPES.SELECT, selector })
export const call = (fn, ...args) => ({ type: EFFECT_TYPES.CALL, fn, args })
export const put = action => ({ type: EFFECT_TYPES.PUT, action })
export const fork = (fn, ...args) => ({ type: EFFECT_TYPES.FORK, fn, args })

/* TODO: implement:
  - take
  - all
  - race
  - takeEvery
*/

const runSaga = async (store, saga) => {

  const iterator = saga();
  let result = iterator.next();

  while (!result.done) {
    const effect = result.value;

    switch (effect.type) {
      case EFFECT_TYPES.CALL:
        result = iterator.next( await effect.fn(...effect.args) );
        break;

      case EFFECT_TYPES.FORK:
        result = iterator.next();
        setTimeout(() => effect.fn(...effect.args), 0);
        break;

      case EFFECT_TYPES.SELECT:
        result = iterator.next(effect.selector(store.getState()));
        break;

      case EFFECT_TYPES.PUT:
        store.dispatch(effect.action)
        result = iterator.next()
        break

      default:
        console.error(`Unknown effect type ${effect.type}`);
    }
  }
}

export default function sagaMiddlewareFactory() {
  let boundRunSaga;

  const sagaMiddleware = store => {
    boundRunSaga = runSaga.bind(null, store);

    return next => action => {
      return next(action);
    };
  }

  sagaMiddleware.run = (saga) => {
    boundRunSaga(saga);
  }

  return sagaMiddleware;
}