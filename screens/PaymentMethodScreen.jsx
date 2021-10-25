import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import { COLORS } from "../variables/color";
import { decodeString, getPrice } from "../helper/helper";
import { useStateValue } from "../StateProvider";
import PaymentMethodCard from "../components/PaymentMethodCard";
import AppSeparator from "../components/AppSeparator";

import { __ } from "../language/stringPicker";
import api, { removeAuthToken, setAuthToken } from "../api/client";
import { AntDesign } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

const PaymentMethodScreen = ({ navigation, route }) => {
  const [{ config, ios, appSettings, auth_token, user }] = useStateValue();
  const [loading, setLoading] = useState(true);
  const [selected] = useState(route.params.selected);
  const [selectedMethod, setSelectedMethod] = useState();
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [keyboardStatus, setKeyboardStatus] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState();
  const [paymentError, setPaymentError] = useState();
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [cardData, setCardData] = useState();
  const [paypalData, setPaypalData] = useState(null);

  useEffect(() => {
    Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
    };
  }, []);

  const _keyboardDidShow = () => setKeyboardStatus(true);
  const _keyboardDidHide = () => setKeyboardStatus(false);

  useEffect(() => {
    if (!loading) return;
    getPaymentMethods();

    return () => {
      // TODO
    };
  }, []);

  const getPaymentMethods = () => {
    api
      .get("payment-gateways")
      .then((res) => {
        console.log(res);
        if (res.ok) {
          setPaymentMethodData(res.data);
        } else {
          // TODO handle error
        }
      })
      .then(() => {
        setLoading(false);
      });
  };

  const handlePaymentMethodSelection = (method) => {
    setSelectedMethod(method);
    setCardData();
  };

  const handlePayment = () => {
    setPaymentLoading(true);
    setPaymentModal(true);

    let args = {};
    if (route?.params?.type === "membership") {
      args = {
        type: "membership",
        gateway_id: selectedMethod?.id,
        plan_id: route?.params?.selected?.id,
      };
    } else if (route?.params?.type === "promotion") {
      args = {
        type: "promotion",
        promotion_type: "regular",
        gateway_id: selectedMethod?.id,
        plan_id: route?.params?.selected?.id,
        listing_id: route?.params?.listingID,
      };
    }
    if (["stripe", "authorizenet"].includes(selectedMethod?.id)) {
      handleCardPayment(args);
      return;
    }
    if (selectedMethod?.id === "paypal") {
      setPaymentLoading(true);
      handlePaypalPayment(args);
      return;
    }
    handleCheckout(args);
  };

  const handlePaypalPayment = (args) => {
    setAuthToken(auth_token);

    // return;
    api
      .post("checkout", args)
      .then((res) => {
        if (res.ok) {
          setPaymentData(res.data);
          setPaypalLoading(true);
          setPaymentLoading(false);
          if (args?.gateway_id === "paypal" && res?.data?.redirect) {
            setPaypalData(res.data);
          }
        } else {
          setPaymentError(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("paymentMethodScreen.unknownError", appSettings.lng)
          );
          // TODO handle error
        }
      })
      .then(() => {
        removeAuthToken();
      });
  };

  const handleCheckout = (args) => {
    setAuthToken(auth_token);

    // return;
    api
      .post("checkout", args)
      .then((res) => {
        if (res.ok) {
          setPaymentData(res.data);
        } else {
          setPaymentError(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("paymentMethodScreen.unknownError", appSettings.lng)
          );
          // TODO handle error
        }
      })
      .then(() => {
        removeAuthToken();
        setPaymentLoading(false);
      });
  };

  const handleCardData = (cardData) => {
    setCardData(cardData);
  };

  const proccedPaymentBtn = selectedMethod?.id === "stripe" && !cardData?.valid;

  const handleCardPayment = (args) => {
    if (!cardData?.valid) {
      Alert.alert(
        __("paymentMethodScreen.invalidCardMessage", appSettings.lng)
      );
      return;
    }

    setAuthToken(auth_token);
    api
      .post("checkout", {
        card_number: cardData?.values?.number,
        card_exp_month: cardData?.values?.expiry.split("/")[0],
        card_exp_year: cardData?.values?.expiry.split("/")[1],
        card_cvc: cardData?.values?.cvc,
        ...args,
      })
      .then((res) => {
        if (res.ok) {
          setPaymentData(res?.data);
        } else {
          setPaymentError(
            res?.data?.error_message || res?.data?.error || res?.problem
          );
        }
      })
      .then(() => {
        removeAuthToken();
        setPaymentLoading(false);
      });
  };

  const handlePaymentSumaryDismiss = () => {
    if (paymentError) {
      setPaymentModal(false);
      setPaymentError();
      return;
    }
    setPaymentModal(false);
    navigation.pop(3);
  };

  const handleWebviewDataChange = (data) => {
    if (data.url.search("rtcl_return=success") > -1) {
      setPaymentModal(false);
      navigation.pop(3);
      return;
    } else if (data.url.search("rtcl_return=cancel") > -1) {
      setPaymentModal(false);
      setPaymentLoading(false);
      return;
    }

    return;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={ios ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 90,
        }}
      >
        <View style={styles.paymentDetailWrap}>
          <View style={styles.paymentDetailHeaderWrap}>
            <Text style={styles.paymentDetailHeaderText}>
              {__("paymentMethodScreen.paymentDetail", appSettings.lng)}
            </Text>
          </View>
          <View style={{ paddingHorizontal: "3%" }}>
            {route?.params?.type === "membership" && (
              <View style={styles.selectedPackageWrap}>
                <View style={{ marginRight: 10 }}>
                  <Text style={styles.selectedLabelText}>
                    {__("paymentMethodScreen.selectedPackage", appSettings.lng)}
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <Text
                    numberOfLines={1}
                    style={styles.selectedPackageNameText}
                  >
                    {selected.title}
                  </Text>
                </View>
              </View>
            )}
            {route?.params?.type === "promotion" && (
              <>
                <View style={styles.selectedPackageWrap}>
                  <View style={{ marginRight: 10 }}>
                    <Text style={styles.selectedLabelText}>
                      {__(
                        "paymentMethodScreen.promotionConfirmation",
                        appSettings.lng
                      )}
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text style={styles.selectedPackageNameText}>
                      {decodeString(route.params.listingTitle)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.selectedPackageWrap, { marginTop: 15 }]}>
                  <View style={{ marginRight: 10 }}>
                    <Text style={styles.selectedLabelText}>
                      {__("paymentMethodScreen.promotionPlan", appSettings.lng)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text style={styles.selectedPackageNameText}>
                      {decodeString(selected.title)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            <AppSeparator style={styles.separator} />
            <View style={styles.pricingWrap}>
              <View style={styles.priceRow}>
                <Text style={styles.priceRowLabel}>
                  {__(
                    route.params.type === "membership"
                      ? "paymentMethodScreen.packagePrice"
                      : "paymentMethodScreen.promotionPrice",
                    appSettings.lng
                  )}
                </Text>
                <Text style={styles.priceRowValue} numberOfLines={1}>
                  {getPrice(config.payment_currency, {
                    pricing_type: "price",
                    price_type: "fixed",
                    price: selected.price,
                    max_price: 0,
                  })}
                </Text>
              </View>
            </View>
            <AppSeparator style={styles.separator} />
            <View style={styles.pricingWrap}>
              <View style={styles.priceRow}>
                <Text
                  style={[styles.priceRowLabel, { color: COLORS.text_dark }]}
                >
                  {__("paymentMethodScreen.subTotal", appSettings.lng)}
                </Text>
                <Text
                  style={[styles.priceRowValue, { color: COLORS.primary }]}
                  numberOfLines={1}
                >
                  {getPrice(config.payment_currency, {
                    pricing_type: "price",
                    price_type: "fixed",
                    price: selected.price,
                    max_price: 0,
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ paddingVertical: 10 }} />
        <View style={styles.paymentSectionWrap}>
          <View style={styles.paymentSectionTitle}>
            <Text style={styles.paymentHeaderTitle} numberOfLines={1}>
              {__("paymentMethodScreen.choosePayment", appSettings.lng)}
            </Text>
          </View>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={COLORS.primary} size="large" />
            </View>
          ) : (
            <View style={styles.paymentMethodsWrap}>
              {paymentMethodData?.map((method, index, arr) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  isLast={arr.length - 1 === index}
                  onSelect={handlePaymentMethodSelection}
                  selected={selectedMethod}
                  onCardDataUpdate={handleCardData}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      {((ios && !!selectedMethod) || (!keyboardStatus && !!selectedMethod)) && (
        <View style={[styles.buttonWrap, { marginHorizontal: "3%" }]}>
          <TouchableOpacity
            style={[
              styles.showMoreButton,
              {
                backgroundColor: proccedPaymentBtn
                  ? COLORS.button.disabled
                  : COLORS.button.active,
              },
            ]}
            onPress={handlePayment}
            disabled={proccedPaymentBtn}
          >
            <Text style={styles.showMoreButtonText} numberOfLines={1}>
              {__("paymentMethodScreen.proceedPayment", appSettings.lng)}
            </Text>
            <View style={styles.iconWrap}>
              <AntDesign name="arrowright" size={18} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        </View>
      )}
      <Modal animationType="slide" transparent={true} visible={paymentModal}>
        <View
          style={[
            styles.modalInnerWrap,
            { backgroundColor: paypalLoading ? COLORS.primary : COLORS.white },
          ]}
        >
          {paymentLoading ? (
            <View style={styles.paymentLoadingWrap}>
              <Text style={styles.text}>
                {__("paymentMethodScreen.paymentProcessing", appSettings.lng)}
              </Text>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <>
              {paypalLoading ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  <WebView
                    source={{ uri: paymentData.redirect }}
                    style={{ marginTop: 20 }}
                    onNavigationStateChange={(data) =>
                      handleWebviewDataChange(data)
                    }
                    startInLoadingState={true}
                    renderLoading={() => (
                      <View
                        style={{
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ActivityIndicator
                          size="large"
                          color={COLORS.primary}
                        />
                      </View>
                    )}
                  />
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  {!!paymentError && (
                    <View style={styles.paymentErrorWrap}>
                      <Text style={styles.paymentError}>{paymentError}</Text>
                    </View>
                  )}
                  {paymentData && !paymentError && (
                    <ScrollView style={styles.paymentDataWrap}>
                      {!!paymentData && (
                        <View style={styles.paymentTableWrap}>
                          {!!paymentData?.id && (
                            <View style={styles.paymentTableHeaderWrap}>
                              <View
                                style={{
                                  paddingVertical: ios ? 10 : 7,
                                  alignItems: "center",
                                  paddingHorizontal: 10,
                                }}
                              >
                                <Text
                                  style={[
                                    styles.paymentTableValue,
                                    { color: COLORS.white },
                                  ]}
                                >
                                  {"#"}
                                  {paymentData.id}
                                </Text>
                              </View>
                            </View>
                          )}
                          {!!paymentData?.method && (
                            <View style={styles.paymentTableRow}>
                              <View style={styles.paymentTableLabelWrap}>
                                <Text style={styles.paymentTableLabel}>
                                  {__(
                                    "paymentMethodScreen.payment.method",
                                    appSettings.lng
                                  )}
                                </Text>
                              </View>
                              <View style={styles.paymentTableValueWrap}>
                                <Text style={styles.paymentTableValue}>
                                  {paymentData.method}
                                </Text>
                              </View>
                            </View>
                          )}

                          {!!paymentData?.price && (
                            <View style={styles.paymentTableRow}>
                              <View style={styles.paymentTableLabelWrap}>
                                <Text style={styles.paymentTableLabel}>
                                  {__(
                                    "paymentMethodScreen.payment.totalAmount",
                                    appSettings.lng
                                  )}
                                </Text>
                              </View>
                              <View style={styles.paymentTableValueWrap}>
                                <Text style={styles.paymentTableValue}>
                                  {getPrice(config.payment_currency, {
                                    pricing_type: "price",
                                    price_type: "fixed",
                                    price: paymentData.price,
                                    max_price: 0,
                                  })}
                                </Text>
                              </View>
                            </View>
                          )}
                          {!!paymentData?.paid_date && (
                            <View style={styles.paymentTableRow}>
                              <View style={styles.paymentTableLabelWrap}>
                                <Text style={styles.paymentTableLabel}>
                                  {__(
                                    "paymentMethodScreen.payment.date",
                                    appSettings.lng
                                  )}
                                </Text>
                              </View>
                              <View style={styles.paymentTableValueWrap}>
                                <Text style={styles.paymentTableValue}>
                                  {paymentData.paid_date}
                                </Text>
                              </View>
                            </View>
                          )}
                          {!!paymentData?.transaction_id && (
                            <View style={styles.paymentTableRow}>
                              <View style={styles.paymentTableLabelWrap}>
                                <Text style={styles.paymentTableLabel}>
                                  {__(
                                    "paymentMethodScreen.payment.transactionID",
                                    appSettings.lng
                                  )}
                                </Text>
                              </View>
                              <View style={styles.paymentTableValueWrap}>
                                <Text style={styles.paymentTableValue}>
                                  {paymentData.transaction_id}
                                </Text>
                              </View>
                            </View>
                          )}

                          {!!paymentData?.status && (
                            <View style={styles.paymentTableRow}>
                              <View style={styles.paymentTableLabelWrap}>
                                <Text style={styles.paymentTableLabel}>
                                  {__(
                                    "paymentMethodScreen.payment.status",
                                    appSettings.lng
                                  )}
                                </Text>
                              </View>
                              <View style={styles.paymentTableValueWrap}>
                                <Text style={styles.paymentTableValue}>
                                  {paymentData.status}
                                </Text>
                              </View>
                            </View>
                          )}
                          {paymentData?.status !== "Completed" &&
                            !!selectedMethod?.instructions && (
                              <View style={styles.paymentTableRow}>
                                <View style={styles.paymentTableLabelWrap}>
                                  <Text style={styles.paymentTableLabel}>
                                    {__(
                                      "paymentMethodScreen.payment.instructions",
                                      appSettings.lng
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.paymentTableValueWrap}>
                                  <Text style={styles.paymentTableValue}>
                                    {decodeString(selectedMethod.instructions)}
                                  </Text>
                                </View>
                              </View>
                            )}
                        </View>
                      )}
                      {!!paymentData?.plan && (
                        <View style={styles.planTableWrap}>
                          <View
                            style={{
                              paddingHorizontal: 5,
                              paddingVertical: ios ? 10 : 7,
                              backgroundColor: COLORS.primary,
                              borderTopLeftRadius: 10,
                              borderTopRightRadius: 10,
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={[
                                styles.paymentTableValue,
                                { color: COLORS.white },
                              ]}
                            >
                              {__(
                                "paymentMethodScreen.plan.details",
                                appSettings.lng
                              )}
                            </Text>
                          </View>

                          {!!paymentData?.plan?.title && (
                            <View style={styles.paymentTableRow}>
                              <View style={styles.paymentTableLabelWrap}>
                                <Text style={styles.paymentTableLabel}>
                                  {__(
                                    "paymentMethodScreen.plan.pricingOption",
                                    appSettings.lng
                                  )}
                                </Text>
                              </View>
                              <View style={styles.paymentTableValueWrap}>
                                <Text style={styles.paymentTableValue}>
                                  {decodeString(paymentData.plan.title)}
                                </Text>
                              </View>
                            </View>
                          )}
                          {!!paymentData?.plan?.visible && (
                            <View style={styles.paymentTableRow}>
                              <View style={styles.paymentTableLabelWrap}>
                                <Text style={styles.paymentTableLabel}>
                                  {__(
                                    "paymentMethodScreen.plan.duration",
                                    appSettings.lng
                                  )}
                                </Text>
                              </View>
                              <View style={styles.paymentTableValueWrap}>
                                <Text style={styles.paymentTableValue}>
                                  {paymentData.plan.visible}
                                </Text>
                              </View>
                            </View>
                          )}
                          {!!paymentData?.plan?.price && (
                            <View style={styles.paymentTableRow}>
                              <View style={styles.paymentTableLabelWrap}>
                                <Text style={styles.paymentTableLabel}>
                                  {__(
                                    "paymentMethodScreen.plan.amount",
                                    appSettings.lng
                                  )}
                                </Text>
                              </View>
                              <View style={styles.paymentTableValueWrap}>
                                <Text style={styles.paymentTableValue}>
                                  {getPrice(config.payment_currency, {
                                    pricing_type: "price",
                                    price_type: "fixed",
                                    price: paymentData.plan.price,
                                    max_price: 0,
                                  })}
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>
                      )}
                    </ScrollView>
                  )}
                  <View style={styles.buttonWrap}>
                    <TouchableOpacity
                      style={[
                        styles.showMoreButton,
                        {
                          backgroundColor: COLORS.button.active,
                        },
                      ]}
                      onPress={handlePaymentSumaryDismiss}
                    >
                      <Text style={styles.showMoreButtonText} numberOfLines={1}>
                        {__(
                          !!paymentError
                            ? "paymentMethodScreen.closeButton"
                            : "paymentMethodScreen.goToAccountButton",
                          appSettings.lng
                        )}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  buttonWrap: {
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: { flex: 1, backgroundColor: COLORS.white },
  loadingWrap: {
    width: "100%",
    marginVertical: 50,
  },
  iconWrap: {
    marginLeft: 5,
    marginTop: 2,
  },

  modalInnerWrap: {
    backgroundColor: COLORS.bg_light,
    flex: 1,
    padding: 15,
  },
  paymentDetailHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
  paymentDetailHeaderWrap: {
    paddingHorizontal: "3%",
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    marginBottom: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  paymentDetailWrap: {
    backgroundColor: COLORS.white,
    marginHorizontal: "3%",
    paddingBottom: "3%",
    borderRadius: 10,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: {
      height: 0,
      width: 0,
    },
  },
  paymentError: {
    fontSize: 15,
    color: COLORS.red,
    fontWeight: "bold",
  },
  paymentErrorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 75,
  },
  paymentHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
  paymentLoadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentMethodsWrap: {},
  paymentSectionWrap: {
    backgroundColor: COLORS.white,
    marginHorizontal: "3%",
    borderRadius: 10,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  paymentSectionTitle: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: "3%",
  },
  paymentTableHeaderWrap: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  paymentTableLabel: {
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  paymentTableLabelWrap: {
    justifyContent: "center",
    flex: 2,
    paddingVertical: Platform.OS === "ios" ? 10 : 7,
    paddingHorizontal: 5,
  },
  paymentTableRow: {
    flexDirection: "row",

    borderBottomWidth: 1,
    borderBottomColor: COLORS.border_light,
  },
  paymentTableValue: {
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  paymentTableValueWrap: {
    justifyContent: "center",
    flex: 2.5,
    paddingHorizontal: 5,
    paddingVertical: Platform.OS === "ios" ? 10 : 7,
  },
  paymentTableWrap: {},
  planTableWrap: {
    marginTop: 30,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceRowLabel: {
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  priceRowValue: {
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  selectedLabelText: {
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  selectedPackageNameText: {
    fontWeight: "bold",
    color: COLORS.text_dark,
    textAlign: "right",
  },
  selectedPackageWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  separator: {
    width: "100%",
    marginVertical: 15,
  },
  showMoreButton: {
    borderRadius: 3,
    marginVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  showMoreButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
});

export default PaymentMethodScreen;
