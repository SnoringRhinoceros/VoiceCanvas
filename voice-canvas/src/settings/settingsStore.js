// store.js
import { createStore } from 'redux';

// Example reducer to manage the state
const counterReducer = (state = { threshold: 20, clarity: 20}, action) => {
  switch (action.type) {
    case 'setThreshold':
      return { ...state, threshold: action.payload};
    case 'setClarity':
      return { ...state, clarity: action.payload};
    default:
      return state;
  }
};

// Create the Redux store
const store = createStore(counterReducer);

export default store;