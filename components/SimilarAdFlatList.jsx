import React from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity } from "react-native";

// Vector Icons
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Custom Components & Constants
import { COLORS } from "../variables/color";
import { getPrice, decodeString } from "../helper/helper";
import { useStateValue } from "../StateProvider";
import { __ } from "../language/stringPicker";

const similarAdListItemFallbackImageUrl = require("../assets/200X150.png");

const SimilarAdFlatList = ({ time, title, url, views, onClick, item }) => {
  const [{ config, appSettings }] = useStateValue();
  return (
    <TouchableOpacity style={styles.listAd} onPress={onClick}>
      <View style={styles.imageWrap}>
        <Image
          style={styles.image}
          source={
            url !== null
              ? {
                  uri: url,
                }
              : similarAdListItemFallbackImageUrl
          }
        />
      </View>
      <View style={styles.details}>
        <View style={styles.detailsLeft}>
          <Text style={styles.title} numberOfLines={1}>
            {decodeString(title)}
          </Text>

          <View style={styles.detailsLeftRow}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons
                name="clock"
                size={12}
                color={COLORS.text_gray}
              />
            </View>
            <Text style={styles.detailsLeftRowText}>{time}</Text>
          </View>
          <View style={[styles.detailsLeftRow, { marginBottom: 0 }]}>
            <View style={styles.iconWrap}>
              <FontAwesome5 name="eye" size={12} color={COLORS.text_gray} />
            </View>
            <Text style={styles.detailsLeftRowText}>
              {__("similarAdListItemTexts.viewsText", appSettings.lng)} {views}
            </Text>
          </View>
        </View>
        <View style={{ paddingLeft: "3%" }}>
          <Text style={styles.price}>
            {getPrice(
              config.currency,
              {
                pricing_type: item.pricing_type,
                price_type: item.price_type,
                price: item.price,
                max_price: item.max_price,
              },
              appSettings.lng
            )}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  details: {
    flex: 3,
    justifyContent: "space-between",
  },
  detailsLeft: {
    paddingLeft: "4%",
    flex: 1,
  },
  detailsLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  detailsLeftRowText: {
    fontSize: 12,
    color: COLORS.text_gray,
  },
  detailsRight: {
    justifyContent: "center",
    flex: 1,
    alignItems: "flex-end",
  },
  iconButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: COLORS.primary,
    marginHorizontal: 5,
    borderRadius: 3,
  },
  iconWrap: {
    width: 20,
    alignItems: "center",
    paddingRight: 5,
  },
  image: {
    height: 80,
    width: "100%",
    resizeMode: "cover",
  },
  imageWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    height: 80,
    width: 80,
    overflow: "hidden",
  },
  price: {
    fontWeight: "bold",
    color: COLORS.primary,
  },
  listAd: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.bg_light,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.bg_dark,
    marginVertical: 5,

    padding: "3%",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 3,
  },
});

export default SimilarAdFlatList;
