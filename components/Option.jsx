import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

// Custom Components & Constants
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import { FontAwesome } from "@expo/vector-icons";

const Option = ({ title, onPress, uri, item }) => {
  if (!item) return null;
  const [{ config, user }] = useStateValue();
  if (!user) {
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.option}>
          <View
            style={{
              height: 20,
              width: 20,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {uri ? (
              <Image
                source={uri}
                style={{
                  height: "100%",
                  width: "100%",
                  resizeMode: "contain",
                }}
              />
            ) : (
              <FontAwesome name={item.icon} size={20} color={COLORS.primary} />
            )}
          </View>

          <Text style={styles.optionTitle}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  } else {
    if (!config.store_enabled && ["my_store", "all_stores"].includes(item.id)) {
      return null;
    } else {
      if (!user.store && "my_store" === item.id) {
        return null;
      } else {
        return (
          <TouchableOpacity onPress={onPress}>
            <View style={styles.option}>
              {uri && (
                <View
                  style={{
                    height: 20,
                    width: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={uri}
                    style={{
                      height: "100%",
                      width: "100%",
                      resizeMode: "contain",
                    }}
                  />
                </View>
              )}
              <Text style={styles.optionTitle}>{title}</Text>
            </View>
          </TouchableOpacity>
        );
      }
    }
  }
};

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginHorizontal: 3,
    paddingHorizontal: "2.3%",
  },
  optionTitle: {
    fontWeight: "bold",
    color: COLORS.text_gray,
    paddingLeft: 10,
  },
  separator: {
    width: "auto",
    backgroundColor: COLORS.bg_dark,
    height: 2,
  },
});

export default Option;
