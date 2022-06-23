import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counter'
import  myPeerReducer from './myPeer';
export default configureStore({
  reducer: {
    counter: counterReducer,
    myPeer: myPeerReducer,
  },
})
