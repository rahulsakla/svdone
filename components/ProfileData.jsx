import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Custom Components & Constants
import { COLORS } from "../variables/color";

const ProfileData = ({ label, value }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  rowLabel: {
    color: COLORS.text_gray,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  rowValue: {
    color: COLORS.text_gray,
    fontSize: 15,
  },
});

export default ProfileData;
