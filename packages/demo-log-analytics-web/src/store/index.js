import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./reducers/app";
import filterReducer from "./reducers/filter";
import logsReducer from "./reducers/logs";
import userReducer from "./reducers/user";

export const store = configureStore({
  reducer: {
    app: appReducer,
    filter: filterReducer,
    logs: logsReducer,
    user: userReducer,
  },
});
