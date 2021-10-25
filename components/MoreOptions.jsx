import React from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { useNavigation } from "@react-navigation/native";

// Custom Components & Constants
import { COLORS } from "../variables/color";

const MoreOptions = ({ title, detail, routeName }) => {
  const navigation = useNavigation();
  return (
    <TouchableWithoutFeedback onPress={() => navigation.navigate(routeName)}>
      <View style={styles.container}>
        <View style={styles.right}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.detail} numberOfLines={3}>
            {detail}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: "3%",
  },
  detail: {
    fontSize: 14,
    color: COLORS.text_gray,
    textAlign: "justify",
    lineHeight: 22,
  },
  image: {
    height: 40,
    width: 40,
    resizeMode: "cover",
  },
  imageWrap: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    color: "#4D4B4B",
    fontWeight: "bold",
    marginBottom: 5,
  },
  right: {
    flex: 1,
  },
  separator: {
    backgroundColor: COLORS.bg_dark,
    width: "100%",
  },
});

export default MoreOptions;
