import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Linking,
  Alert,
  Modal,
} from "react-native";

// Vector Icons
import { Fontisto } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Zocial } from "@expo/vector-icons";

// Custom Components & Functions
import { COLORS } from "../variables/color";
import { decodeString } from "../helper/helper";
import { useStateValue } from "../StateProvider";
import AppTextButton from "../components/AppTextButton";
import { __ } from "../language/stringPicker";
import { routes } from "../navigation/routes";

const week = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const iconURL = require("../assets/store_icon.png");

const { width: windowWidth } = Dimensions.get("window");

const StoreMoreDetailsScreen = ({ route, navigation }) => {
  const [{ config, user, ios, appSettings }] = useStateValue();
  const [modalVisible, setModalVisible] = useState(false);

  const handleCall = (number) => {
    setModalVisible(false);
    let phoneNumber = "";
    if (ios) {
      phoneNumber = `telprompt:${number}`;
    } else {
      phoneNumber = `tel:${number}`;
    }
    Linking.openURL(phoneNumber);
  };

  const handleEmail = () => {
    if (user === null && config?.registered_only?.store_contact) {
      handleEmailLoginAlert();
    } else {
      const data = {
        id: route.params.data.id,
        title: route.params.data.title,
      };
      navigation.navigate(routes.sendEmailScreen, {
        store: data,
        source: "store",
      });
    }
  };

  const handleEmailLoginAlert = () => {
    Alert.alert(
      "",
      __("storeMoreDetailTexts.loginAlert", appSettings.lng),
      [
        {
          text: __("storeMoreDetailTexts.cancelButtonTitle", appSettings.lng),
        },
        {
          text: __("storeMoreDetailTexts.loginButtonTitle", appSettings.lng),
          onPress: () => navigation.navigate(routes.loginScreen),
        },
      ],
      { cancelable: false }
    );
  };

  const getOpeningHours = () => {
    const data = route.params.data.opening_hours.hours;
    if (route.params.data.opening_hours.type === "selected") {
      return week.map((item, index) => (
        <OpeningDay
          item={item}
          key={index}
          data={data}
          today={week[new Date().getDay()] === item}
        />
      ));
    } else {
      return (
        <View style={styles.view}>
          <Text style={styles.text}>
            {__("storeMoreDetailTexts.alwaysOpen", appSettings.lng)}
          </Text>
        </View>
      );
    }
  };

  const OpeningDay = ({ item, data, today }) => (
    <View style={styles.dayWrap}>
      <View style={[styles.dayContentWrap, { paddingLeft: 18 }]}>
        <Text
          style={[
            styles.dayTitle,
            {
              fontWeight: today ? "bold" : "normal",
              color: today ? COLORS.text_dark : COLORS.text_gray,
            },
          ]}
          numberOfLines={1}
        >
          {item}
        </Text>
      </View>
      <View style={styles.dayContentWrap}>
        {data[item]?.active ? (
          <>
            {!!data[item]?.open && !!data[item]?.close ? (
              <Text
                style={[
                  styles.hoursText,
                  {
                    fontWeight: today ? "bold" : "normal",
                    color: today ? COLORS.text_dark : COLORS.text_gray,
                  },
                ]}
              >
                {data[item].open}
                {" -- "}
                {data[item].close}
              </Text>
            ) : (
              <Text
                style={[
                  styles.hoursText,
                  {
                    fontWeight: today ? "bold" : "normal",
                    color: today ? COLORS.text_dark : COLORS.text_gray,
                  },
                ]}
              >
                {__("storeMoreDetailTexts.fullDayOpen", appSettings.lng)}
              </Text>
            )}
          </>
        ) : (
          <Text
            style={[
              styles.closedText,
              {
                fontWeight: today ? "bold" : "normal",
              },
            ]}
          >
            {__("storeMoreDetailTexts.closed", appSettings.lng)}
          </Text>
        )}
      </View>
    </View>
  );
  const handleLoginAlert = () => {
    Alert.alert(
      "",
      __("listingDetailScreenTexts.loginAlert", appSettings.lng),
      [
        {
          text: __(
            "listingDetailScreenTexts.cancelButtonTitle",
            appSettings.lng
          ),
        },
        {
          text: __(
            "listingDetailScreenTexts.loginButtonTitle",
            appSettings.lng
          ),
          onPress: () => navigation.navigate(routes.loginScreen),
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Opening Time Section */}
        <View style={styles.detailSectionWrap}>
          <View style={styles.titleRow}>
            <Fontisto name="clock" size={20} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {__(
                  "storeMoreDetailTexts.sectionTitles.openinigDateTime",
                  appSettings.lng
                )}
              </Text>
            </View>
          </View>
          <View style={styles.detailSectionContent}>
            <View style={styles.openingDateTimeWrap}>
              {["selected", "always"].includes(
                route.params.data.opening_hours.type
              ) ? (
                getOpeningHours()
              ) : (
                <View style={styles.view}>
                  <Text style={styles.text}>
                    {__("storeMoreDetailTexts.noData", appSettings.lng)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        {/* Store Address Section */}
        <View style={styles.detailSectionWrap}>
          <View style={styles.titleRow}>
            <View style={styles.iconWrap}>
              <Image source={iconURL} style={styles.icon} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {__(
                  "storeMoreDetailTexts.sectionTitles.storeAddress",
                  appSettings.lng
                )}
              </Text>
            </View>
          </View>
          <View style={styles.detailSectionContent}>
            <View style={styles.addressWrap}>
              <View style={styles.iconWrap}>
                <Fontisto
                  name="map-marker-alt"
                  size={14}
                  color={COLORS.text_gray}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.address}>
                  {decodeString(route.params.data.address)}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {/* Store Details Section */}
        <View style={styles.detailSectionWrap}>
          <View style={styles.titleRow}>
            <View style={styles.iconWrap}>
              <Image source={iconURL} style={styles.icon} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {__(
                  "storeMoreDetailTexts.sectionTitles.storeDetails",
                  appSettings.lng
                )}
              </Text>
            </View>
          </View>

          <View style={styles.detailSectionContent}>
            <View style={styles.detailWrap}>
              <Text style={styles.description}>
                {decodeString(route.params.data.description)}
              </Text>
            </View>
          </View>
        </View>
        {/* Email and Call button Section */}
        {(user === null || user?.id !== route.params.data.owner_id) &&
          !config?.disabled?.listing_contact &&
          (!!route.params.data.phone || !!route.params.data.email) && (
            <View style={styles.detailButtonSectionWrap}>
              <View
                style={[
                  styles.storeContactWrap,
                  {
                    justifyContent:
                      !!route.params.data.phone && !!route.params.data.email
                        ? "space-between"
                        : "center",
                  },
                ]}
              >
                {!!route.params.data.phone && (
                  <TouchableOpacity
                    style={[
                      styles.storeContactButton,
                      { backgroundColor: COLORS.bg_dark },
                    ]}
                    onPress={() => {
                      if (
                        user === null &&
                        config?.registered_only?.store_contact
                      ) {
                        handleLoginAlert();
                      } else {
                        setModalVisible(true);
                      }
                    }}
                  >
                    <Ionicons name="call" size={18} color={COLORS.primary} />
                    <Text
                      style={[
                        styles.storeContactButtonText,
                        { color: COLORS.text_gray },
                      ]}
                      numberOfLines={1}
                    >
                      {__("sellerContactTexts.call", appSettings.lng)}
                    </Text>
                  </TouchableOpacity>
                )}
                {!!route.params.data.email && (
                  <TouchableOpacity
                    style={[
                      styles.storeContactButton,
                      { backgroundColor: COLORS.primary },
                    ]}
                    onPress={handleEmail}
                  >
                    <Zocial name="email" size={18} color={COLORS.white} />
                    <Text
                      style={[
                        styles.storeContactButtonText,
                        { color: COLORS.white },
                      ]}
                      numberOfLines={1}
                    >
                      {__("sellerContactTexts.email", appSettings.lng)}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
      </ScrollView>
      {/* Call Prompt Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <View
            style={{
              paddingHorizontal: "3%",
              padding: 20,
              backgroundColor: COLORS.white,
              width: "100%",
            }}
          >
            <Text style={styles.callText}>
              {__("storeMoreDetailTexts.callPrompt", appSettings.lng)}
            </Text>
            <TouchableOpacity
              onPress={() => handleCall(route.params.data.phone)}
              style={styles.phone}
            >
              <Text style={styles.phoneText}>{route.params.data.phone}</Text>
              <FontAwesome5 name="phone" size={18} color={COLORS.primary} />
            </TouchableOpacity>

            {ios && (
              <AppTextButton
                title={__(
                  "storeMoreDetailTexts.cancelButtonTitle",
                  appSettings.lng
                )}
                style={{ marginTop: 20 }}
                onPress={() => setModalVisible(false)}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  addressWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  callText: {
    fontSize: 20,
    color: COLORS.text_dark,
    textAlign: "center",
  },
  closedText: {
    color: COLORS.red,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: "3%",
  },
  dayContentWrap: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 14,

    textTransform: "capitalize",
  },
  dayWrap: {
    paddingLeft: 10,
    paddingRight: 5,
    paddingVertical: 5,

    marginVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  detailWrap: {
    padding: windowWidth * 0.03,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  detailButtonSectionWrap: {
    marginVertical: 20,
  },
  detailSectionWrap: {
    marginTop: 20,
  },
  description: {
    color: COLORS.text_dark,
  },
  hoursText: {
    fontSize: 14,
  },

  icon: {
    height: 20,
    width: 20,
    resizeMode: "cover",
  },
  iconWrap: {
    height: 20,
    width: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  phone: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  phoneText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 18,
  },
  storeContactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
    width: "49%",
    height: 32,
    paddingHorizontal: 10,
  },
  storeContactButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  storeContactWrap: {
    marginVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text_dark,
    paddingLeft: 10,
  },
  titleRow: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default StoreMoreDetailsScreen;
