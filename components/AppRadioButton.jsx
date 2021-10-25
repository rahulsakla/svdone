import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// Custom Components
import { COLORS } from "../variables/color";

const AppRadioButton = ({ field, handleClick, style, selected }) => {
  const [active, setActive] = useState();
  return (
    <View style={[styles.container, style]}>
      {field.map((item) => (
        <TouchableOpacity
          key={`${item.id}`}
          onPress={() => {
            setActive(item.id);
            handleClick(item);
          }}
          disabled={active === item.id || selected === item.id}
          style={styles.radioOption}
        >
          <View style={styles.radioBorder}>
            {(active === item.id || selected === item.id) && (
              <View style={styles.selected} />
            )}
          </View>
          <Text style={styles.radioOptionText}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioBorder: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOptionText: {
    fontSize: 15,
    color: COLORS.text_gray,
    marginLeft: 5,
    marginRight: 15,
  },
  selected: {
    height: 7,
    width: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});

export default AppRadioButton;
