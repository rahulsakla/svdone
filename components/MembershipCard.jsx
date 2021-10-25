import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { getPrice } from "../helper/helper";
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import { __ } from "../language/stringPicker";

const { width: windowWidth } = Dimensions.get("window");
const MembershipCard = ({ memPlan, onSelect, selected }) => {
  const [{ config, appSettings }] = useStateValue();

  if (!memPlan?.promotion?.membership && !memPlan?.regular_ads) {
    return null;
  }
  return (
    <TouchableWithoutFeedback style={styles.container} onPress={onSelect}>
      <View style={styles.content}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{memPlan.title}</Text>
        </View>
        <View style={styles.featuresWrap}>
          <View style={styles.chkBoxWrap}>
            <View style={styles.chkBxOuter}>
              {memPlan?.id === selected?.id && (
                <View style={styles.chkBxInner} />
              )}
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.tableHeaderRowWrap}>
              <View style={{ flex: 1.5 }} />
              <View style={styles.headerContent}>
                <Text style={styles.headerText}>
                  {__("membershipCardTexts.ads", appSettings.lng)}
                </Text>
              </View>
              <View style={styles.headerContent}>
                <Text style={styles.headerText}>
                  {__("membershipCardTexts.validityUnit", appSettings.lng)}
                </Text>
              </View>
            </View>
            {!!memPlan?.regular_ads && (
              <View
                style={[
                  styles.tableRowWrap,
                  {
                    borderBottomColor: COLORS.border_light,
                    borderBottomWidth: !!memPlan?.promotion?.membership
                      ? 0
                      : 0.7,
                    paddingBottom: !!memPlan?.promotion?.membership ? 5 : 10,
                  },
                ]}
              >
                <View
                  style={[
                    styles.tableRowContent,
                    { alignItems: "flex-start", flex: 1.5 },
                  ]}
                >
                  <Text style={styles.contentText}>
                    {__("membershipCardTexts.regular", appSettings.lng)}
                  </Text>
                </View>
                <View style={styles.tableRowContent}>
                  <Text style={styles.contentText}>{memPlan.regular_ads}</Text>
                </View>
                <View style={styles.tableRowContent}>
                  <Text style={styles.contentText}>{memPlan.visible}</Text>
                </View>
              </View>
            )}

            {!!memPlan?.promotion?.membership &&
              Object.keys(memPlan.promotion.membership).map((memPkg, index) => (
                <View
                  style={[
                    styles.tableRowWrap,
                    {
                      backgroundColor:
                        !!memPlan?.regular_ads && index % 2 === 0
                          ? COLORS.bg_light
                          : COLORS.white,
                    },
                  ]}
                  key={index}
                >
                  <View
                    style={[
                      styles.tableRowContent,
                      { alignItems: "flex-start", flex: 1.5 },
                    ]}
                  >
                    <Text style={styles.contentText}>
                      {config?.promotions[memPkg] || memPkg}
                    </Text>
                  </View>
                  <View style={styles.tableRowContent}>
                    <Text style={styles.contentText}>
                      {memPlan?.promotion?.membership[memPkg].ads}
                    </Text>
                  </View>
                  <View style={styles.tableRowContent}>
                    <Text style={styles.contentText}>
                      {memPlan?.promotion?.membership[memPkg].validate}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
          <View style={styles.priceWrapp}>
            <Text style={styles.price}>
              {getPrice(config.payment_currency, {
                pricing_type: "price",
                price_type: "fixed",
                price: memPlan.price,
                max_price: 0,
              })}
            </Text>
          </View>
        </View>
        <View style={styles.bottomContentWrap}></View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  bottomContentWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  chkBxInner: {
    height: 9,
    width: 9,
    borderRadius: 9 / 2,
    backgroundColor: COLORS.primary,
  },
  chkBxOuter: {
    height: 16,
    width: 16,
    borderRadius: 16 / 2,
    borderWidth: 1.5,
    borderColor: COLORS.border_light,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chkBoxWrap: {},
  container: {},
  content: {
    borderRadius: 5,
    backgroundColor: COLORS.white,
    elevation: 3,
    marginVertical: 10,
    shadowRadius: 5,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.9,
    shadowColor: COLORS.gray,
    marginHorizontal: windowWidth * 0.03,
  },
  contentText: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  featuresWrap: {
    marginVertical: 10,
    paddingBottom: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerText: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  iconWrap: {
    width: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  labelWrap: {
    alignItems: "center",
    paddingVertical: 15,
  },
  note: {
    color: COLORS.text_gray,
    textAlign: "justify",
  },
  noteWrap: {
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
  priceWrapp: {
    margin: 10,
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  tableHeaderRowWrap: {
    flexDirection: "row",
    borderBottomColor: COLORS.border_light,
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 5,
  },
  tableRowContent: {
    flex: 1,
    alignItems: "center",
  },
  tableRowWrap: {
    flexDirection: "row",
    paddingVertical: 5,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: COLORS.white,
  },
  titleWrap: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  priceTag: {
    backgroundColor: COLORS.primary,

    paddingVertical: 10,
    paddingLeft: 30,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 100,
    justifyContent: "center",
  },
  priceWrap: {},
});

export default MembershipCard;
