import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { LogBox } from "react-native";

// Custom Components
import Screen from "./components/Screen";
import HomeNavigator from "./navigation/HomeNavigator";
import { StateProvider } from "./StateProvider";
import reducer, { initialState } from "./reducer";

const App = () => {
  // TODO: This is a temporary fix for the "Componentwillreceiveprops has been renamed" development warning
  LogBox.ignoreLogs(["componentWillReceiveProps"]);
  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      <Screen>
        <NavigationContainer>
          <HomeNavigator />
        </NavigationContainer>
      </Screen>
    </StateProvider>
  );
};

export default App;
