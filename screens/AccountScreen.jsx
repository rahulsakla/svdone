import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

// Custom Components & Constants
import TabScreenHeader from "../components/TabScreenHeader";
import { COLORS } from "../variables/color";
import Option from "../components/Option";
import AppButton from "../components/AppButton";
import authStorage from "../app/auth/authStorage";
import FlashNotification from "../components/FlashNotification";
import AppSeparator from "../components/AppSeparator";
import { useStateValue } from "../StateProvider";
import { __, getAccountOptionsData } from "../language/stringPicker";
import { routes } from "../navigation/routes";

const AccountScreen = ({ navigation }) => {
  const [{ user, appSettings }, dispatch] = useStateValue();
  const [flashNotification, setFlashNotification] = useState(false);
  const [options, setOptions] = useState(
    getAccountOptionsData(appSettings.lng, !!user)
  );

  useEffect(() => {
    setOptions(getAccountOptionsData(appSettings.lng, !!user));
  }, [user, appSettings.lng]);

  const handleLogout = () => {
    dispatch({
      type: "SET_AUTH_DATA",
      data: {
        user: null,
        auth_token: null,
      },
    });
    authStorage.removeUser();
  };

  // external event on mount
  useEffect(() => {
    dispatch({
      type: "SET_NEW_LISTING_SCREEN",
      newListingScreen: false,
    });
  }, []);

  const getUsername = () => {
    if (!!user.first_name || !!user.last_name) {
      return [user.first_name, user.last_name].join(" ");
    } else {
      return user.username;
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen Header */}
      <TabScreenHeader
        onRightClick={() => navigation.navigate(routes.settingsScreen)}
        rightIcon="cog"
      />
      {/* UserName Component */}
      {user && (
        <>
          <View style={styles.userNameContainer}>
            <Text style={styles.userNameText}>{getUsername()}</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <AppSeparator style={{ width: "94%" }} />
          </View>
        </>
      )}
      {/* User logged out component */}
      {!user && (
        <View style={styles.loginWrap}>
          <AppButton
            title={__("accountScreenTexts.loginButtonText", appSettings.lng)}
            style={styles.loginButton}
            onPress={() => navigation.navigate(routes.loginScreen)}
          />
        </View>
      )}
      {/* Account Options Flatlist */}

      <View Style={styles.optionsContainer}>
        <ScrollView>
          {options.map((item, index) => (
            <Option
              key={item.id}
              title={item.title}
              onPress={() => navigation.navigate(item.routeName)}
              uri={item.assetUri}
              item={item}
            />
          ))}
          {user && (
            <View style={styles.logOutWrap}>
              <Option
                title={__(
                  "accountScreenTexts.logOutButtonText",
                  appSettings.lng
                )}
                icon="power-off"
                onPress={() => handleLogout()}
                uri={require("../assets/log_out.png")}
                item={{
                  id: "log_out",
                }}
              />
            </View>
          )}
        </ScrollView>
      </View>
      {/* Flash Notification */}
      <FlashNotification
        falshShow={flashNotification}
        flashMessage={__("accountScreenTexts.successMessage", appSettings.lng)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  headerMain: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
  },
  headerWrap: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: "3%",
    flexDirection: "row",
    height: 50,
    alignItems: "center",
    justifyContent: "space-between",
  },
  loginButton: {
    paddingVertical: 10,
    borderRadius: 3,
  },
  loginWrap: {
    flexDirection: "row",
    paddingHorizontal: "3%",
    marginVertical: 40,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  logOutWrap: {
    paddingBottom: 50,
  },
  optionsContainer: {
    flex: 1,
  },
  userNameContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  userNameText: {
    fontSize: 20,
    color: "#444",
  },
});

export default AccountScreen;
