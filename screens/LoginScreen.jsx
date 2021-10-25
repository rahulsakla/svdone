/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import * as Facebook from "expo-facebook";
import * as Google from "expo-auth-session/providers/google";
import * as AppleAuthentication from "expo-apple-authentication";

import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

// External Libraries
import { Formik } from "formik";
import * as Yup from "yup";

// Custom Components & Functions
import AppButton from "../components/AppButton";
import AppTextButton from "../components/AppTextButton";
import AppSeparator from "../components/AppSeparator";
import { useStateValue } from "../StateProvider";
import api from "../api/client";
import { COLORS } from "../variables/color";
import authStorage from "../app/auth/authStorage";
import FlashNotification from "../components/FlashNotification";
import { __ } from "../language/stringPicker";
import { socialConfig } from "../app/services/socialLoginConfig";
import { routes } from "../navigation/routes";

const LoginScreen = ({ navigation }) => {
  const [{ ios, appSettings }, dispatch] = useStateValue();
  const [validationSchema, setValidationSchema] = useState(
    Yup.object().shape({
      username: Yup.string()
        .required(
          __("loginScreenTexts.formFieldsLabel.username", appSettings.lng) +
            " " +
            __("loginScreenTexts.formValidation.requiredField", appSettings.lng)
        )
        .min(
          3,
          __("loginScreenTexts.formFieldsLabel.username", appSettings.lng) +
            " " +
            __(
              "loginScreenTexts.formValidation.minimumLength3",
              appSettings.lng
            )
        ),
      password: Yup.string()
        .required(
          __("loginScreenTexts.formFieldsLabel.password", appSettings.lng) +
            " " +
            __("loginScreenTexts.formValidation.requiredField", appSettings.lng)
        )
        .min(
          3,
          __("loginScreenTexts.formFieldsLabel.password", appSettings.lng) +
            " " +
            __(
              "loginScreenTexts.formValidation.minimumLength3",
              appSettings.lng
            )
        ),
    })
  );
  const [validationSchema_reset, setValidationSchema_reset] = useState(
    Yup.object().shape({
      user_login: Yup.string()
        .required(
          __("loginScreenTexts.formFieldsLabel.reset", appSettings.lng) +
            " " +
            __("loginScreenTexts.formValidation.requiredField", appSettings.lng)
        )
        .min(
          3,
          __("loginScreenTexts.formFieldsLabel.reset", appSettings.lng) +
            " " +
            __(
              "loginScreenTexts.formValidation.minimumLength3",
              appSettings.lng
            )
        ),
    })
  );
  const [responseErrorMessage, setResponseErrorMessage] = useState();
  const [passResetErrorMessage, setPassResetResponseErrorMessage] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reset_Loading, setReset_Loading] = useState(false);
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();
  const [socialOverlayActive, setSocialOverlayActive] = useState(false);
  const [socialErrorMessage, setSocialErrorMessage] = useState();
  const [activeSocialType, setActiveSocialType] = useState();

  const handleLogin = (values) => {
    setResponseErrorMessage();
    setLoading(true);
    Keyboard.dismiss();
    api
      .post("login", {
        username: values.username,
        password: values.password,
      })
      .then((res) => {
        if (res.ok) {
          dispatch({
            type: "SET_AUTH_DATA",
            data: {
              user: res.data.user,
              auth_token: res.data.jwt_token,
            },
          });
          authStorage.storeUser(JSON.stringify(res.data));

          handleSuccess(
            __("loginScreenTexts.loginSuccessMessage", appSettings.lng)
          );
        } else {
          setResponseErrorMessage(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("loginScreenTexts.customResponseError", appSettings.lng)
          );
          handleError(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("loginScreenTexts.customResponseError", appSettings.lng)
          );
          setLoading(false);
        }
      });
  };
  const handleSuccess = (message) => {
    setFlashNotificationMessage(message);
    setTimeout(() => {
      setFlashNotification(true);
    }, 10);
    setTimeout(() => {
      setFlashNotification(false);
      if (loading) {
        setLoading(false);
      }
      if (socialOverlayActive) {
        setSocialOverlayActive(false);
      }
      setFlashNotificationMessage();
      navigation.goBack();
    }, 1000);
  };
  const handleError = (message) => {
    setFlashNotificationMessage(message);
    setTimeout(() => {
      setFlashNotification(true);
    }, 10);
    setTimeout(() => {
      setFlashNotification(false);
      setFlashNotificationMessage();

      if (socialOverlayActive) {
        setSocialOverlayActive(false);
      }
    }, 1000);
  };

  const handleResetSuccess = (message) => {
    setFlashNotificationMessage(message);
    setTimeout(() => {
      setFlashNotification(true);
    }, 10);
    setTimeout(() => {
      setFlashNotification(false);
    }, 2000);
  };

  const handlePassReset = (values) => {
    setPassResetResponseErrorMessage();
    setReset_Loading(true);
    Keyboard.dismiss();
    api
      .post("reset-password", {
        user_login: values.user_login,
      })
      .then((res) => {
        if (res.ok) {
          setReset_Loading(false);
          setModalVisible(false);
          handleResetSuccess(
            __("loginScreenTexts.resetSuccessMessage", appSettings.lng)
          );
        } else {
          setPassResetResponseErrorMessage(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("loginScreenTexts.customResponseError", appSettings.lng)
          );
          setReset_Loading(false);
        }
      })
      .catch((error) => {
        alert("Error");
      });
  };

  const handleAppleLoginPress = async () => {
    setSocialErrorMessage();
    setActiveSocialType("apple");
    setSocialOverlayActive(true);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // signed in
      if (credential?.identityToken && credential?.user) {
        api
          .post("social-login", {
            access_token: credential.identityToken,
            type: "apple",
            apple_user: credential.user,
          })
          .then((res) => {
            console.log(res);

            if (res.ok) {
              dispatch({
                type: "SET_AUTH_DATA",
                data: {
                  user: res.data.user,
                  auth_token: res.data.jwt_token,
                },
              });
              authStorage.storeUser(JSON.stringify(res.data));

              handleSuccess(
                __("loginScreenTexts.loginSuccessMessage", appSettings.lng)
              );
            } else {
              setSocialErrorMessage(
                res?.data?.error_message ||
                  res?.data?.error ||
                  res?.problem ||
                  __("loginScreenTexts.customResponseError", appSettings.lng)
              );
              handleError(
                res?.data?.error_message ||
                  res?.data?.error ||
                  res?.problem ||
                  __("loginScreenTexts.customResponseError", appSettings.lng)
              );
            }
          })
          .then(() => setActiveSocialType());
      } else {
        setSocialOverlayActive(false);
        return true;
      }
    } catch (e) {
      if (e.code === "ERR_CANCELED") {
        // handle that the user canceled the sign-in flow
        console.log(e);
      } else {
        // handle other errors
        console.log(e);
        setSocialErrorMessage(
          e.code || __("loginScreenTexts.customResponseError", appSettings.lng)
        );
        handleError(
          e.code || __("loginScreenTexts.customResponseError", appSettings.lng)
        );
      }
    }
  };

  const handleFacebookLoginPress = () => {
    setSocialErrorMessage();
    setActiveSocialType("facebook");
    setSocialOverlayActive(true);
    loginWithFBReadPermissionAsync();
  };

  const loginWithFBReadPermissionAsync = async () => {
    try {
      await Facebook.initializeAsync({
        appId: socialConfig.facebook.appID,
        appName: socialConfig.facebook.appName,
      });

      const result = await Facebook.logInWithReadPermissionsAsync({
        permissions: ["public_profile", "email"],
      });

      if (result?.type === "success" && result?.token) {
        handleSocialLoginRequest(result.token, "facebook");
      } else {
        setActiveSocialType();
        setSocialOverlayActive(false);
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  };

  const handleGoogleLoginPress = () => {
    promptAsync();
    setSocialErrorMessage();
    setActiveSocialType("google");
    setSocialOverlayActive(true);
  };

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: socialConfig.google.android.clientId,
    expoClientId: socialConfig.google.expoGo.clientId,
    iosClientId: socialConfig.google.iOS.clientId,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;

      if (authentication?.accessToken) {
        handleSocialLoginRequest(authentication?.accessToken, "google");
      }
    } else {
      if (activeSocialType) {
        setActiveSocialType();
      }
      if (socialOverlayActive) {
        setSocialOverlayActive(false);
      }
    }
  }, [response]);

  const handleSocialLoginRequest = (access_token, type) => {
    if (!access_token || !type) {
      setSocialOverlayActive(false);
      return true;
    }

    api
      .post("social-login", {
        access_token: access_token,
        type: type,
      })
      .then((res) => {
        if (res.ok) {
          dispatch({
            type: "SET_AUTH_DATA",
            data: {
              user: res.data.user,
              auth_token: res.data.jwt_token,
            },
          });
          authStorage.storeUser(JSON.stringify(res.data));

          handleSuccess(
            __("loginScreenTexts.loginSuccessMessage", appSettings.lng)
          );
          setActiveSocialType();
        } else {
          setSocialErrorMessage(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("loginScreenTexts.customResponseError", appSettings.lng)
          );
          handleError(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("loginScreenTexts.customResponseError", appSettings.lng)
          );
          setActiveSocialType();
        }
      });
  };

  const handleSocialLoginCancel = () => {
    setActiveSocialType();
    setSocialOverlayActive(false);
  };
  return (
    <KeyboardAvoidingView
      behavior={ios ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 80 }]}
      >
        <Text style={styles.loginNotice}>
          {__("loginScreenTexts.loginTitle", appSettings.lng)}
        </Text>
        <View
          style={[
            styles.loginForm,
            { marginBottom: socialConfig?.enabled ? 20 : 40 },
          ]}
        >
          <Formik
            initialValues={{ username: "", password: "" }}
            onSubmit={handleLogin}
            validationSchema={validationSchema}
          >
            {({
              handleChange,
              handleSubmit,
              values,
              errors,
              setFieldTouched,
              touched,
            }) => (
              <View style={{ width: "100%", alignItems: "center" }}>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    onChangeText={handleChange("username")}
                    onBlur={() => setFieldTouched("username")}
                    value={values.username}
                    placeholder={__(
                      "loginScreenTexts.formFieldsPlaceholder.username",
                      appSettings.lng
                    )}
                    autoCorrect={false}
                    onFocus={() => setFieldTouched("username")}
                    autoCapitalize="none"
                  />
                  <View style={styles.errorFieldWrap}>
                    {touched.username && errors.username && (
                      <Text style={styles.errorMessage}>{errors.username}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    onChangeText={handleChange("password")}
                    onBlur={() => setFieldTouched("password")}
                    value={values.password}
                    placeholder={__(
                      "loginScreenTexts.formFieldsPlaceholder.password",
                      appSettings.lng
                    )}
                    type="password"
                    autoCorrect={false}
                    autoCapitalize="none"
                    onFocus={() => setFieldTouched("password")}
                    secureTextEntry={true}
                  />
                  <View style={styles.errorFieldWrap}>
                    {touched.password && errors.password && (
                      <Text style={styles.errorMessage}>{errors.password}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.loginBtnWrap}>
                  <AppButton
                    onPress={handleSubmit}
                    title={__(
                      "loginScreenTexts.loginButtonTitle",
                      appSettings.lng
                    )}
                    style={styles.loginBtn}
                    textStyle={styles.loginBtnTxt}
                    disabled={
                      errors.username ||
                      errors.password ||
                      !touched.username ||
                      socialOverlayActive
                    }
                    loading={loading}
                  />
                </View>
                {responseErrorMessage && (
                  <View style={styles.responseErrorWrap}>
                    <Text style={styles.responseErrorMessage}>
                      {responseErrorMessage}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Formik>
          <AppTextButton
            title={__("loginScreenTexts.forgotPassword", appSettings.lng)}
            style
            textStyle
            onPress={() => {
              setModalVisible(true);
            }}
          />
        </View>
        {socialConfig?.enabled && (
          <View style={styles.socialLoginWrap}>
            {ios && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                }
                buttonStyle={
                  AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={3}
                style={{ width: "100%", height: 40, marginBottom: 10 }}
                onPress={handleAppleLoginPress}
              />
            )}
            {socialConfig?.socialPlatforms.includes("facebook") && (
              <TouchableOpacity
                style={{
                  backgroundColor: "#3b5998",
                  marginBottom: 10,
                  padding: 10,
                  alignItems: "center",
                  borderRadius: 3,
                  flexDirection: "row",
                  justifyContent: "center",
                }}
                onPress={handleFacebookLoginPress}
                disabled={socialOverlayActive || loading}
              >
                <View style={{ marginRight: 10 }}>
                  <Entypo name="facebook" size={18} color={COLORS.white} />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    color: COLORS.white,
                    fontWeight: "bold",
                  }}
                >
                  {__(
                    "loginScreenTexts.socialButtonTitle.facebook",
                    appSettings.lng
                  )}
                </Text>
              </TouchableOpacity>
            )}
            {socialConfig?.socialPlatforms?.includes("google") && (
              <TouchableOpacity
                style={{
                  backgroundColor: "#4285F4",
                  marginBottom: 10,
                  padding: 10,
                  alignItems: "center",
                  borderRadius: 3,
                  flexDirection: "row",
                  justifyContent: "center",
                }}
                onPress={handleGoogleLoginPress}
                disabled={socialOverlayActive || loading}
              >
                <View style={{ marginRight: 10 }}>
                  <AntDesign name="google" size={18} color={COLORS.white} />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    color: COLORS.white,
                    fontWeight: "bold",
                  }}
                >
                  {__(
                    "loginScreenTexts.socialButtonTitle.google",
                    appSettings.lng
                  )}
                </Text>
              </TouchableOpacity>
            )}
            {socialErrorMessage && (
              <View style={styles.responseErrorWrap}>
                <Text style={styles.responseErrorMessage}>
                  {socialErrorMessage}
                </Text>
              </View>
            )}
          </View>
        )}
        <AppSeparator />
        <View
          style={[
            styles.signUpPrompt,
            { marginTop: socialConfig?.enabled ? 20 : 40 },
          ]}
        >
          <Text style={styles.signUpPromptText}>
            {__("loginScreenTexts.signUpPrompt", appSettings.lng)}
          </Text>
          <AppTextButton
            title={__("loginScreenTexts.signUpButtonTitle", appSettings.lng)}
            onPress={() => navigation.navigate(routes.signUpScreen)}
          />
        </View>
        <View style={styles.centeredView}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>
                  {__("loginScreenTexts.forgotPassword", appSettings.lng)}
                </Text>
                <Text style={styles.modalText}>
                  {__("loginScreenTexts.passwordReset", appSettings.lng)}
                </Text>

                <Formik
                  initialValues={{ user_login: "" }}
                  validationSchema={validationSchema_reset}
                  onSubmit={handlePassReset}
                >
                  {({
                    handleChange,

                    handleSubmit,
                    values,
                    errors,
                    setFieldTouched,
                    touched,
                  }) => (
                    <View
                      style={{
                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      <TextInput
                        style={styles.modalEmail}
                        onChangeText={handleChange("user_login")}
                        onBlur={() => setFieldTouched("user_login")}
                        value={values.user_login}
                        placeholder={__(
                          "loginScreenTexts.formFieldsPlaceholder.username",
                          appSettings.lng
                        )}
                        autoCorrect={false}
                        autoCapitalize="none"
                      />
                      <View style={styles.errorFieldWrap}>
                        {touched.user_login && errors.user_login && (
                          <Text style={styles.errorMessage}>
                            {errors.user_login}
                          </Text>
                        )}
                      </View>
                      <AppButton
                        title={__(
                          "loginScreenTexts.passwordResetButton",
                          appSettings.lng
                        )}
                        style={styles.resetLink}
                        onPress={handleSubmit}
                        loading={reset_Loading}
                        disabled={
                          errors.user_login || values.user_login.length < 1
                        }
                      />
                      {passResetErrorMessage && (
                        <View style={styles.responseErrorWrap}>
                          <Text style={styles.responseErrorMessage}>
                            {passResetErrorMessage}
                          </Text>
                        </View>
                      )}
                      <AppTextButton
                        title={__(
                          "loginScreenTexts.cancelButtonTitle",
                          appSettings.lng
                        )}
                        onPress={() => {
                          setModalVisible(!modalVisible);
                        }}
                        textStyle={styles.cancelResetBtn}
                      />
                    </View>
                  )}
                </Formik>
              </View>
            </View>
          </Modal>
        </View>
        <FlashNotification
          falshShow={flashNotification}
          flashMessage={flashNotificationMessage}
        />
      </ScrollView>
      {socialOverlayActive && (
        <View style={styles.socialOverlayWrap}>
          <View
            style={{
              backgroundColor: "#000",
              opacity: 0.2,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <View
            style={{
              paddingVertical: 40,
              backgroundColor: COLORS.white,
              width: "60%",
              alignItems: "center",
              borderRadius: 10,
            }}
          >
            <Text style={{ marginBottom: 20 }}>
              {__("loginScreenTexts.pleaseWaitText", appSettings.lng)}
            </Text>
            <ActivityIndicator size="large" color="black" />
            <AppTextButton
              title={__("loginScreenTexts.cancelButtonTitle", appSettings.lng)}
              onPress={handleSocialLoginCancel}
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  cancelResetBtn: {
    color: "gray",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  container: {
    alignItems: "center",
    paddingTop: 10,
  },
  errorFieldWrap: {
    height: 15,
    justifyContent: "center",
  },
  errorMessage: {
    fontSize: 12,
    color: COLORS.red,
  },
  input: {
    backgroundColor: "#e3e3e3",
    width: "95%",
    marginVertical: 10,
    height: 38,
    justifyContent: "center",
    borderRadius: 3,
    paddingHorizontal: 10,
  },
  inputWrap: {
    width: "100%",
    alignItems: "center",
  },
  loginBtn: {
    height: 40,
    borderRadius: 3,
    marginVertical: 10,
  },
  loginBtnWrap: {
    width: "100%",
    paddingHorizontal: "3%",
  },
  loginForm: {
    width: "100%",
  },
  loginNotice: {
    fontSize: 16,
    color: "#111",
    marginVertical: 20,
  },
  modalEmail: {
    backgroundColor: "#e3e3e3",
    width: "95%",
    marginVertical: 10,
    height: 38,
    justifyContent: "center",
    borderRadius: 3,
    paddingHorizontal: 10,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 3,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "90%",
  },
  resetLink: {
    height: 40,
    borderRadius: 3,
    marginVertical: 10,
    width: "60%",
  },
  responseErrorMessage: {
    color: COLORS.red,
    fontWeight: "bold",
    fontSize: 15,
  },
  responseErrorWrap: {
    marginVertical: 10,
    alignItems: "center",
  },
  signUpPrompt: {},
  socialLogin: {
    marginHorizontal: 15,
  },
  socialLoginWrap: {
    marginBottom: 10,
    width: "100%",
    paddingHorizontal: "3%",
  },
  socialOverlayWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LoginScreen;
