import { Platform } from "react-native";
import { defaultLng } from "./language/stringPicker";

export const initialState = {
  ios: Platform.OS === "ios",
  appSettings: {
    lng: defaultLng || "en",
  },
  auth_token: null,
  user: null,
  newListingScreen: false,
  search_categories: [],
  search_locations: [],
  listing_locations: null,
  cat_name: "",
  button_hidden: false,
  chat_badge: null,
  is_connected: true,
  config: {
    currency: {
      id: "USD",
      symbol: "&#36;",
      position: "left", // position: "left" or "right"
      separator: {
        decimal: ".",
        thousand: ",",
      },
    },
    payment_currency: {
      id: "USD",
      position: "right",
      separator: {
        decimal: ".",
        thousand: ",",
      },
      symbol: "&#36;",
    },
    promotions: {
      _bump_up: "Bump Up",
      _top: "Top",
      featured: "Featured",
    },
    location_type: "local", // location_type: "local" or "google"
    mark_as_sold: false, // mark_as_sold: boolian
    radius_search: {
      max_distance: 1000,
      units: "miles",
    },
    store_enabled: false,
    store: {
      time_options: {
        showMeridian: true,
      },
    },
    week_days: [
      {
        id: 1,
        name: "Monday",
      },
      {
        id: 2,
        name: "Tuesday",
      },
      {
        id: 3,
        name: "Wednesday",
      },
      {
        id: 4,
        name: "Thursday",
      },
      {
        id: 5,
        name: "Friday",
      },
      {
        id: 6,
        name: "Saturday",
      },
      {
        id: 0,
        name: "Sunday",
      },
    ],
    registered_only: {
      listing_contact: false,
      store_contact: false,
    },
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_AUTH_DATA":
      let new_state = state;
      if (
        action.data.user !== undefined &&
        action.data.auth_token !== undefined
      ) {
        new_state = {
          ...state,
          user: action.data.user,
          auth_token: action.data.auth_token,
        };
      } else if (action.data.user === undefined && action.data.auth_token) {
        new_state = {
          ...state,
          auth_token: action.data.auth_token,
        };
      } else if (action.data.user && action.data.auth_token === undefined) {
        new_state = {
          ...state,
          user: action.data.user,
        };
      }
      return new_state;

    case "SET_NEW_LISTING_SCREEN":
      return {
        ...state,
        newListingScreen: action.newListingScreen,
      };

    case "SET_SEARCH_LOCATIONS":
      return {
        ...state,
        search_locations: action.search_locations,
      };

    case "SET_SEARCH_CATEGORIES":
      return {
        ...state,
        search_categories: action.search_categories,
      };

    case "SET_LISTING_LOCATIONS":
      return {
        ...state,
        listing_locations: action.listing_locations,
      };

    case "SET_CAT_NAME":
      return {
        ...state,
        cat_name: action.cat_name,
      };

    case "SET_SETTINGS":
      return {
        ...state,
        appSettings: action.appSettings,
      };

    case "SET_BUTTON_HIDDEN":
      return {
        ...state,
        button_hidden: action.button_hidden,
      };

    case "SET_CHAT_BADGE":
      return {
        ...state,
        chat_badge: action.chat_badge,
      };

    case "SET_CONFIG":
      return {
        ...state,
        config: action.config,
      };

    case "IS_CONNECTED":
      return {
        ...state,
        is_connected: action.is_connected,
      };

    default:
      return state;
  }
};

export default reducer;
