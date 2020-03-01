import { put, select } from '../saga.js';
import { userSetName } from './actions.js';

export function* rootSaga() {
  yield put(userSetName('Alena'));
  const name = yield select(state => state.user.name);
  console.log(name);
}

