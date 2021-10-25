import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ScrollView,
} from "react-native";

// Vector Icons
import { FontAwesome5 } from "@expo/vector-icons";

// Custom Components
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import { __ } from "../language/stringPicker";

const DynamicFilterListPicker = ({ onselect, selected, data }) => {
  const [{ appSettings }] = useStateValue();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerText, setPickerText] = useState(selected);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.pickerFieldWrap}
        onPress={() => {
          setPickerVisible(!pickerVisible);
        }}
      >
        <Text style={styles.priceTypePickerFieldText}>
          {pickerText
            ? pickerText
            : __("dynamicFilterListPickerTexts.selectText", appSettings.lng)}
        </Text>
        <FontAwesome5 name="chevron-down" size={14} color={COLORS.text_gray} />
      </TouchableOpacity>
      <Modal animationType="slide" transparent={true} visible={pickerVisible}>
        <TouchableWithoutFeedback onPress={() => setPickerVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView
              contentContainerStyle={{
                display: "flex",
                width: "100%",
                alignItems: "flex-start",
              }}
            >
              {data.map((item) => (
                <TouchableOpacity
                  style={styles.pickerOptions}
                  key={`${item.id}`}
                  onPress={() => {
                    onselect(item);
                    setPickerText(item.name);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={styles.pickerOptionsText}>{item.name}</Text>
                  {pickerText &&
                    (pickerText === item.name || pickerText === item.id) && (
                      <FontAwesome5 name="check" size={14} color="black" />
                    )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredModalview: {
    justifyContent: "center",
    alignItems: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  container: {},
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  modalText: {
    fontSize: 17,
    paddingBottom: 12,
  },
  modalView: {
    width: "94%",
    backgroundColor: "white",
    borderRadius: 3,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerFieldWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.gray,
    height: 32,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  pickerOptions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  pickerOptionsText: {
    fontSize: 16,
    color: COLORS.text_dark,
    textTransform: "capitalize",
    flex: 1,
  },
});

export default DynamicFilterListPicker;
