import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import api, { removeAuthToken, setAuthToken } from "../api/client";
import AppButton from "../components/AppButton";
import { decodeString, getPrice } from "../helper/helper";
import { __ } from "../language/stringPicker";
import { useStateValue } from "../StateProvider";
import { COLORS } from "../variables/color";
import moment from "moment";

const PaymentDetailScreen = ({ route }) => {
  const [{ auth_token, appSettings, config, ios }] = useStateValue();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [retry, setRetry] = useState(false);

  // Initial Call
  useEffect(() => {
    getPaymentDetail(route.params.id);
  }, []);

  // Retry Call
  useEffect(() => {
    getPaymentDetail(route.params.id);
  }, [retry]);

  const getPaymentDetail = (id) => {
    if (errorMessage) {
      setErrorMessage();
    }
    setAuthToken(auth_token);
    api
      .get(`/payments/${id}`)
      .then((res) => {
        console.log(res);
        if (res.ok) {
          setPaymentData(res.data);
        } else {
          setErrorMessage(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("paymentsScreenTexts.unknownError", appSettings.lng)
          );
        }
      })
      .then(() => {
        removeAuthToken();
        setLoading(false);
      });
  };

  const handleRetry = () => {
    setLoading(true);
    setRetry((prevRetry) => !prevRetry);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {errorMessage ? (
            <View style={styles.errorWrap}>
              <Text style={styles.text}>
                {__("paymentDetailScreen.errorNotice", appSettings.lng)}
              </Text>
              <Text style={styles.text}>
                {__("paymentDetailScreen.originalErrorLabel", appSettings.lng)}{" "}
                {errorMessage}
              </Text>
              <View style={{ width: "50%", marginTop: 30 }}>
                <AppButton
                  title={__("paymentsScreenTexts.retryButton", appSettings.lng)}
                  onPress={handleRetry}
                />
              </View>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollWrap}>
              <View style={styles.headerWrap}>
                <Text style={styles.id}>
                  {decodeString("&#35;")}
                  {paymentData.id}
                </Text>
              </View>

              <View style={{ padding: "3%" }}>
                {!!paymentData && (
                  <View style={styles.paymentTableWrap}>
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
                    {!!paymentData?.created_date &&
                      paymentData.status !== "Completed" && (
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
                              {moment(
                                paymentData?.created_date,
                                "YYYY-MM-DD H-mm-ss"
                              ).format("MMM Do, YY h:mm: a")}
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
                            {moment(
                              paymentData?.paid_date,
                              "YYYY-MM-DD H-mm-ss"
                            ).format("MMM Do, YY h:mm: a")}
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
                    {!!paymentData?.order_key && (
                      <View style={styles.paymentTableRow}>
                        <View style={styles.paymentTableLabelWrap}>
                          <Text style={styles.paymentTableLabel}>
                            {__(
                              "paymentMethodScreen.payment.orderKey",
                              appSettings.lng
                            )}
                          </Text>
                        </View>
                        <View style={styles.paymentTableValueWrap}>
                          <Text style={styles.paymentTableValue}>
                            {paymentData.order_key}
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
                    {!!paymentData?.gateway?.instructions &&
                      // paymentData?.method === "offline" &&
                      paymentData?.status !== "Completed" && (
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
                              {decodeString(paymentData.gateway.instructions)}
                            </Text>
                          </View>
                        </View>
                      )}
                  </View>
                )}
                {paymentData?.plan?.type === "regular" ? (
                  <View style={styles.planTableWrap}>
                    <View
                      style={{
                        backgroundColor: COLORS.primary,
                        paddingHorizontal: 10,
                        paddingVertical: ios ? 10 : 7,
                        alignItems: "center",
                        borderTopRightRadius: 10,
                        borderTopLeftRadius: 10,
                        marginTop: 15,
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
                    {!!paymentData?.plan?.description && (
                      <View style={styles.paymentTableRow}>
                        <View style={styles.paymentTableLabelWrap}>
                          <Text style={styles.paymentTableLabel}>
                            {__(
                              "paymentMethodScreen.plan.description",
                              appSettings.lng
                            )}
                          </Text>
                        </View>
                        <View style={styles.paymentTableValueWrap}>
                          <Text style={styles.paymentTableValue}>
                            {decodeString(paymentData.plan.description)}
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
                            <Text
                              style={{
                                fontSize: 12,
                                color: COLORS.text_gray,
                                fontWeight: "normal",
                              }}
                            >
                              {" ("}
                              {__(
                                "promoteScreenTexts.validPeriodUnit",
                                appSettings.lng
                              )}
                              )
                            </Text>
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
                ) : (
                  <View style={styles.planTableWrap}>
                    {paymentData?.plan && (
                      <View
                        style={{
                          backgroundColor: COLORS.primary,
                          paddingHorizontal: 10,
                          paddingVertical: ios ? 10 : 7,
                          alignItems: "center",
                          borderTopRightRadius: 10,
                          borderTopLeftRadius: 10,
                          marginTop: 15,
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
                    )}
                    {!!paymentData?.plan?.title && (
                      <View style={styles.paymentTableRow}>
                        <View style={styles.paymentTableLabelWrap}>
                          <Text style={styles.paymentTableLabel}>
                            {__(
                              "paymentMethodScreen.plan.membershipTitle",
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
                    {!!paymentData?.plan?.description && (
                      <View style={styles.paymentTableRow}>
                        <View style={styles.paymentTableLabelWrap}>
                          <Text style={styles.paymentTableLabel}>
                            {__(
                              "paymentMethodScreen.plan.description",
                              appSettings.lng
                            )}
                          </Text>
                        </View>
                        <View style={styles.paymentTableValueWrap}>
                          <Text style={styles.paymentTableValue}>
                            {decodeString(paymentData.plan.description)}
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
                            <Text
                              style={{
                                fontSize: 12,
                                color: COLORS.text_gray,
                                fontWeight: "normal",
                              }}
                            >
                              {" "}
                              (
                              {__(
                                "promoteScreenTexts.validPeriodUnit",
                                appSettings.lng
                              )}
                              )
                            </Text>
                          </Text>
                        </View>
                      </View>
                    )}

                    {!!paymentData?.plan?.promotion && (
                      <View style={styles.featuresSectionWrap}>
                        <View
                          style={{
                            backgroundColor: COLORS.primary,
                            paddingHorizontal: 10,
                            paddingVertical: ios ? 10 : 7,
                            alignItems: "center",
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                            marginTop: 15,
                          }}
                        >
                          <Text
                            style={[
                              styles.featuresHeader,
                              { color: COLORS.white },
                            ]}
                          >
                            {__(
                              "paymentDetailScreen.features",
                              appSettings.lng
                            )}
                          </Text>
                        </View>
                        <View style={styles.featuresTableWrap}>
                          <View style={styles.featTabHedRow}>
                            <View style={styles.featTabContentLabelWrap} />
                            <View style={styles.featTabHedContentWrap}>
                              <Text style={styles.featTabHed}>
                                {__("membershipCardTexts.ads", appSettings.lng)}
                              </Text>
                            </View>
                            <View style={styles.featTabHedContentWrap}>
                              <Text style={styles.featTabHed}>
                                {__(
                                  "membershipCardTexts.validityUnit",
                                  appSettings.lng
                                )}
                              </Text>
                            </View>
                          </View>
                          {!!paymentData?.plan?.regular_ads && (
                            <View style={styles.featTabRow}>
                              <View style={styles.featTabContentLabelWrap}>
                                <Text style={styles.featTabContent}>
                                  {__(
                                    "membershipCardTexts.regular",
                                    appSettings.lng
                                  )}
                                </Text>
                              </View>
                              <View style={styles.featTabContentWrap}>
                                <Text style={styles.featTabContent}>
                                  {paymentData.plan.regular_ads}
                                </Text>
                              </View>
                              <View style={styles.featTabContentWrap}>
                                <Text style={styles.featTabContent}>
                                  {paymentData.plan.visible}
                                </Text>
                              </View>
                            </View>
                          )}
                          {!!Object.keys(
                            paymentData?.plan?.promotion?.membership
                          ).length &&
                            Object.keys(
                              paymentData?.plan?.promotion?.membership
                            ).map((_key, index) => (
                              <View style={styles.featTabRow} key={index}>
                                <View style={styles.featTabContentLabelWrap}>
                                  <Text style={styles.featTabContent}>
                                    {config?.promotions[_key] || _key}
                                  </Text>
                                </View>
                                <View style={styles.featTabContentWrap}>
                                  <Text style={styles.featTabContent}>
                                    {
                                      paymentData.plan.promotion.membership[
                                        _key
                                      ].ads
                                    }
                                  </Text>
                                </View>
                                <View style={styles.featTabContentWrap}>
                                  <Text style={styles.featTabContent}>
                                    {
                                      paymentData.plan.promotion.membership[
                                        _key
                                      ].validate
                                    }
                                  </Text>
                                </View>
                              </View>
                            ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  featuresHeader: {
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  featuresHeaderWrap: {
    paddingHorizontal: 5,
    paddingTop: 20,
  },
  featTabContent: { fontWeight: "bold", color: COLORS.text_dark },

  featTabContentLabelWrap: {
    flex: 1.5,
    paddingHorizontal: 5,
    paddingVertical: Platform.OS === "ios" ? 10 : 7,
  },
  featTabContentWrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: Platform.OS === "ios" ? 10 : 7,
  },
  featTabHed: {
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  featTabHedContentWrap: {
    flex: 1,
    alignItems: "center",
    padding: 5,
  },
  featTabHedRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border_light,
  },
  featTabRow: {
    flexDirection: "row",
    borderBottomWidth: 0.7,
    borderBottomColor: COLORS.border_light,
  },
  headerWrap: {
    alignItems: "center",
    marginTop: "3%",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 10 : 7,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginHorizontal: "3%",
  },
  id: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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

    borderBottomWidth: 0.7,
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
  scrollWrap: {
    paddingBottom: 45,
  },
});

export default PaymentDetailScreen;
