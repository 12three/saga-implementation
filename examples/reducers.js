import { USER_ACTION_TYPES, BOOK_ACTION_TYPES } from './actions.js';

const booksInitialState = [];

export const booksReducer = (state = booksInitialState, action) => {
  switch (action.type) {
    case BOOK_ACTION_TYPES.SET_BOOKS:
      const newBooks = Array.isArray(action.payload) ? action.payload : [action.payload];
      return [
        ...state,
        ...newBooks,
      ]

    default:
    return state;
  }
};

const userInitialState = { name: null };
export const userReducer = (state = userInitialState, action) => {
  switch (action.type) {
    case USER_ACTION_TYPES.SET_NAME:
      return {
        ...state,
        name: action.payload,
      }

    default:
      return state;
  }
}