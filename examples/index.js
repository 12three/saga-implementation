import { createStore, combineReducers, applyMiddleware } from '../node_modules/redux/es/redux.mjs';
import { booksReducer, userReducer } from './reducers.js';
import createSagaMiddleware from '../saga.js';
import { rootSaga } from './sagas.js';
import { USER_ACTION_TYPES } from './actions.js';

const sagaMiddleware = createSagaMiddleware();
const rootReducer = combineReducers({
  books: booksReducer,
  user: userReducer
})
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);