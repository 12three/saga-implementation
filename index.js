const EFFECT_TYPES = {
  TAKE: 'TAKE',
  SELECT: 'SELECT',
  CALL: 'CALL',
  PUT: 'PUT',
  FORK: 'FORK',
  ALL: 'ALL',
  RACE: 'RACE',
}

export const take = actionType => ({ type: EFFECT_TYPES.TAKE, actionType });
export const select = selector => ({ type: EFFECT_TYPES.SELECT, selector });
export const call = (fn, ...args) => ({ type: EFFECT_TYPES.CALL, fn, args });
export const put = action => ({ type: EFFECT_TYPES.PUT, action });
export const fork = (fn, ...args) => ({ type: EFFECT_TYPES.FORK, fn, args });
export const all = (effects = []) => ({ type: EFFECT_TYPES.ALL, effects });
export const race = (effects = []) => ({ type: EFFECT_TYPES.RACE, effects });

/* TODO: implement:
  - takeEvery
*/

async function handleEffect(effect, store, actionMonitor) {
  switch (effect.type) {
    case EFFECT_TYPES.ALL:
      return await Promise.all(effect.effects.map(effct => handleEffect(effct)));

    case EFFECT_TYPES.RACE:
        return await Promise.race(effect.effects.map(effct => handleEffect(effct)));

    case EFFECT_TYPES.TAKE:
      return await new Promise(resolve => {
        return actionMonitor.once(effect.actionType, resolve);
      });

    case EFFECT_TYPES.CALL:
      return await effect.fn(...effect.args)

    case EFFECT_TYPES.FORK:
      // ???
      break;

    case EFFECT_TYPES.SELECT:
      return effect.selector(store.getState());

    case EFFECT_TYPES.PUT:
      store.dispatch(effect.action)
      break

    default:
      console.error(`Unknown effect type ${effect.type}`);
  }
}

const runSaga = async (store, saga, actionMonitor) => {
  const iterator = saga();
  let result = iterator.next();

  while (!result.done) {
    const effect = result.value;

    result = iterator.next(await handleEffect(effect, store, actionMonitor));
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