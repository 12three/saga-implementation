import { put, select, take, call, race, all } from '../index.js';
import { userSetName, USER_ACTION_TYPES } from './actions.js';

function delay(fn, ms) {
  return (...args) => new Promise(resolve => {
    setTimeout(() => {
      resolve(fn(...args));
    }, ms);
  })
}

