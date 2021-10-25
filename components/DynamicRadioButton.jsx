import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// Custom Components
import { COLORS } from "../variables/color";

const DynamicRadioButton = ({ field, handleClick, style, selected }) => {
  const [active, setActive] = useState();
  return (
    <View style={[styles.container, style]}>
      {field.options.choices.map((item) => (
        <TouchableOpacity
          key={`${item.id}`}
          onPress={() => {
            setActive(item.id);
            handleClick(item);
          }}
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
    flexWrap: "wrap",
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
    marginTop: 5,
  },
  radioOptionText: {
    fontSize: 15,
    color: COLORS.text_dark,
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

export default DynamicRadioButton;
