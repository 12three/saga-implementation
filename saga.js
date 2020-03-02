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

const runSaga = async (store, saga, actionMonitor) => {
  const iterator = saga();
  let result = iterator.next();

  while (!result.done) {
    const effect = result.value;

    switch (effect.type) {
      case EFFECT_TYPES.TAKE:
        const action = await new Promise(resolve => {
          return actionMonitor.once(effect.actionType, resolve);
        });

        result = iterator.next( action );
        break;

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

class ActionMonitor {
  handlers = [];

  emit(action) {
    this.handlers = this.handlers.reduce((acc, handler) => {

      if (handler.actionType === action.type) {
        handler.fn(action);
        return acc;
      }

      return [
        ...acc,
        handler,
      ]
    }, []);
  };

  once(actionType, fn) {
    this.handlers.push({ actionType, fn })
  };
}

export default function sagaMiddlewareFactory() {
  const actionMonitor = new ActionMonitor();
  let boundRunSaga;

  const sagaMiddleware = store => {
    boundRunSaga = runSaga.bind(null, store);

    return next => action => {
      actionMonitor.emit(action)
      return next(action);
    };
  }

  sagaMiddleware.run = (saga) => {
    boundRunSaga(saga, actionMonitor);
  }

  return sagaMiddleware;
}