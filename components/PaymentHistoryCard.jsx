import React from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import { getPrice } from "../helper/helper";
import { __ } from "../language/stringPicker";
import moment from "moment";

const PaymentHistoryCard = ({ item, onCardPress }) => {
  const [{ appSettings, config }] = useStateValue();
  const getStatusColor = () => {
    if (item.status === "Refunded") {
      return COLORS.text_gray;
    } else if (["Cancelled", "Failed"].includes(item.status)) {
      return COLORS.red;
    } else if (item.status === "Completed") {
      return COLORS.green;
    } else if (["Pending", "On hold"].includes(item.status)) {
      return COLORS.yellow_dark;
    } else if (["Created", "Processing"].includes(item.status)) {
      return COLORS.dodgerblue;
    } else {
      return COLORS.text_dark;
    }
  };
  return (
    <TouchableWithoutFeedback onPress={onCardPress}>
      <View style={styles.container}>
        <View style={styles.contentWrap}>
          <View style={styles.cardLeftWrap}>
            <View style={styles.methodWrap}>
              <Text style={styles.method}>
                {__("paymentsScreenTexts.paymentMethodPrefix", appSettings.lng)}{" "}
                <Text style={{ fontStyle: "italic" }}>{item.method}</Text>
              </Text>
            </View>
            <View style={styles.dateWrap}>
              <Text style={styles.date}>
                {moment(
                  item?.paid_date || item?.created_date,
                  "YYYY-MM-DD H-mm-ss"
                ).format("MMM Do, YY h:mm: a")}
              </Text>
            </View>
          </View>
          <View style={styles.cardRightWrap}>
            <View style={styles.priceWrap}>
              <Text style={styles.price}>
                {getPrice(config.payment_currency, {
                  pricing_type: "price",
                  price_type: "fixed",
                  price: item.price,
                  max_price: 0,
                })}
              </Text>
            </View>
            <View style={styles.statusWrap}>
              <Text
                style={[
                  styles.status,
                  {
                    color: getStatusColor(),
                  },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  cardLeftWrap: {
    flex: 1,
  },
  cardRightWrap: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  container: {
    backgroundColor: COLORS.white,
    marginHorizontal: "3%",
    marginVertical: "2%",
    padding: 15,
    borderRadius: 10,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOpacity: 0.3,
    shadowOffset: { height: 0, width: 0 },
    shadowRadius: 3,
  },
  contentWrap: {
    flexDirection: "row",
  },
  date: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  methodWrap: {
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  status: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
});

export default PaymentHistoryCard;
