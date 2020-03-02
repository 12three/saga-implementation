export const BOOK_ACTION_TYPES = {
  SET_BOOKS: 'SET_BOOKS',
}

export const USER_ACTION_TYPES = {
  SET_NAME: 'SET_NAME',
};
export const userSetName = name => ({ type: USER_ACTION_TYPES.SET_NAME, payload: name });