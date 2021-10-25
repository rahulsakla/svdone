import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";

// Vector Icons
import { FontAwesome5 } from "@expo/vector-icons";

// Custom Components & Functions
import AppSeparator from "../components/AppSeparator";
import { COLORS } from "../variables/color";
import authStorage from "../app/auth/authStorage";
import { useStateValue } from "../StateProvider";
import { __ } from "../language/stringPicker";
import settingsStorage from "../app/settings/settingsStorage";

const SettingsScreen = () => {
  const [{ user, appSettings }, dispatch] = useStateValue();

  const handleLanguageChange = (languageCode) => {
    if (appSettings.lng === languageCode) {
      return true;
    }
    const tempSettings = {
      ...appSettings,
      lng: languageCode,
    };

    dispatch({
      type: "SET_SETTINGS",
      appSettings: tempSettings,
    });

    settingsStorage.storeAppSettings(JSON.stringify(tempSettings));
  };

  return (
    <ScrollView style={styles.container}>
      <View>
        <View style={styles.contentWrapper}>
          <Text style={styles.screenTitle}>
            {__("settingsScreenTexts.screenTitle", appSettings.lng)}
          </Text>
          <AppSeparator style={styles.separator} />
          {Object.keys(languages)?.length === 2 && (
            <>
              <View style={styles.notiWrapper}>
                <Text style={styles.notiTitle}>
                  {__("settingsScreenTexts.languageTitle", appSettings.lng)}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginVertical: 15,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      width: "48.5%",
                      backgroundColor:
                        appSettings.lng === Object.keys(languages)[0]
                          ? COLORS.primary
                          : COLORS.white,
                      borderWidth: 1,
                      borderColor: "blue",
                      alignItems: "center",
                      paddingVertical: 5,
                    }}
                    onPress={() =>
                      handleLanguageChange(Object.keys(languages)[0])
                    }
                  >
                    <Text
                      style={{
                        color:
                          appSettings.lng === Object.keys(languages)[0]
                            ? COLORS.white
                            : COLORS.primary,
                      }}
                    >
                      {languages[`${Object.keys(languages)[0]}`]}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      width: "48.5%",
                      backgroundColor:
                        appSettings.lng === Object.keys(languages)[1]
                          ? COLORS.primary
                          : COLORS.white,
                      borderWidth: 1,
                      borderColor: "blue",
                      alignItems: "center",
                      paddingVertical: 5,
                    }}
                    onPress={() =>
                      handleLanguageChange(Object.keys(languages)[1])
                    }
                  >
                    <Text
                      style={{
                        color:
                          appSettings.lng === Object.keys(languages)[1]
                            ? COLORS.white
                            : COLORS.primary,
                      }}
                    >
                      {languages[`${Object.keys(languages)[1]}`]}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <AppSeparator style={styles.separator} />
            </>
          )}
          {Object.keys(languages)?.length > 2 && (
            <>
              <View style={styles.notiWrapper}>
                <Text style={styles.notiTitle}>
                  {__("settingsScreenTexts.languageTitle", appSettings.lng)}
                </Text>
                <View
                  style={{
                    alignItems: "center",
                    marginVertical: 15,
                  }}
                >
                  {Object.keys(languages).map((_language, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        backgroundColor:
                          appSettings.lng === _language
                            ? COLORS.primary
                            : COLORS.white,
                        borderWidth: 1,
                        borderColor: "blue",
                        alignItems: "center",
                        paddingVertical: 5,
                        width: "100%",
                        marginVertical: 5,
                      }}
                      onPress={() => handleLanguageChange(_language)}
                    >
                      <Text
                        style={{
                          color:
                            appSettings.lng === _language
                              ? COLORS.white
                              : COLORS.primary,
                        }}
                      >
                        {languages[_language]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <AppSeparator style={styles.separator} />
            </>
          )}
        </View>

        {user && (
          <View style={styles.contentWrapper}>
            <TouchableOpacity
              style={styles.logOutWrap}
              onPress={() => {
                dispatch({
                  type: "SET_AUTH_DATA",
                  data: {
                    user: null,
                    auth_token: null,
                  },
                });
                authStorage.removeUser();
              }}
            >
              <FontAwesome5 name="power-off" size={16} color={COLORS.primary} />
              <Text style={styles.logOutTitle}>
                {__("settingsScreenTexts.logoutbuttonTitle", appSettings.lng)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  btnCommon: {
    width: "50%",
    paddingVertical: 9,
    borderRadius: 0,
  },
  btninActive: {
    backgroundColor: COLORS.white,
  },
  btnTextinActive: {
    color: COLORS.text_gray,
  },
  btnTextCommon: {
    color: COLORS.white,
  },
  changeDetailTitle: {
    padding: "3%",
    fontWeight: "bold",
  },
  changePassTitle: {
    padding: "3%",
    fontWeight: "bold",
  },

  container: {
    backgroundColor: COLORS.bg_dark,
  },
  contentWrapper: {
    backgroundColor: COLORS.white,
  },

  form: {
    paddingHorizontal: "3%",
    paddingTop: 10,
    paddingBottom: 20,
  },

  formSeparator: {
    backgroundColor: COLORS.gray,
    width: "100%",
    marginBottom: 10,
  },
  label: {
    color: COLORS.text_gray,
  },
  languageTitle: {
    fontSize: 20,
  },
  languageTitle2: {
    padding: "3%",
    fontWeight: "bold",
  },
  langButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  languageSupport: {
    padding: "3%",
  },
  languageSupport2: {
    paddingBottom: 10,
  },
  logOutWrap: {
    flexDirection: "row",
    paddingHorizontal: "5%",
    paddingVertical: 10,
    alignItems: "center",
  },
  logOutTitle: {
    fontWeight: "bold",
    paddingLeft: 10,
  },
  notiSwitchWrap: {},
  notiTitle: {
    fontSize: 20,
  },
  notiWrapper: {
    padding: "3%",
  },
  pickerWrap: {
    paddingHorizontal: "1%",
    paddingTop: 10,
  },
  screenTitle: {
    padding: "3%",
    fontWeight: "bold",
  },

  separator: {
    width: "100%",
  },
  toggleSwitch: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  updateButton: {
    width: "100%",
    borderRadius: 0,
    paddingVertical: 10,
  },
});

export default SettingsScreen;
