import { put, select, take } from '../index.js';
import { userSetName, USER_ACTION_TYPES } from './actions.js';

export function* rootSaga() {
  while(true) {
    const { payload } = yield take(USER_ACTION_TYPES.SET_NAME);
    yield put(userSetName(payload));

    const name = yield select(state => state.user.name);
    console.log(name);
  }
}

