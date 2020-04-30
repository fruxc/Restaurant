import { createStore, applyMiddleware } from "redux";
// import { createForms } from "react-redux-form";
import { Dishes } from "./dishes";
import { Leaders } from "./leaders";
import { Promotions } from "./promotions";
import { Comments } from "./comments";
import { favorites } from "./favorites";
import thunk from "redux-thunk";
import logger from "redux-logger";
// import { InitialFeedback } from "./forms";
import { persistStore, persistCombineReducers } from "redux-persist";
import storage from "redux-persist/es/storage";

export const ConfigureStore = () => {
  const config = {
    key: "root",
    storage,
    debug: true,
  };
  const store = createStore(
    persistCombineReducers(config, {
      dishes: Dishes,
      comments: Comments,
      promotions: Promotions,
      leaders: Leaders,
      favorites,
      // ...createForms({
      //   feedback: InitialFeedback,
      // }),
    }),
    applyMiddleware(thunk, logger)
  );
  const persistor = persistStore(store);

  return { persistor, store };
};
