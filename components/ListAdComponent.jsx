import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";

import { AdMobBanner, setTestDeviceIDAsync } from "expo-ads-admob";
import { admobConfig } from "../app/services/adMobConfig";
import { useStateValue } from "../StateProvider";

const { width: windowWidth } = Dimensions.get("window");

const ListAdComponent = ({ dummy }) => {
  const [{ ios }] = useStateValue();

  useEffect(() => {
    if (!admobConfig.admobEnabled) {
      return true;
    }
    configureAdmobTestDeviceID();

    return () => {};
  }, []);

  const configureAdmobTestDeviceID = async () => {
    await setTestDeviceIDAsync("EMULATOR");
  };

  return !dummy ? (
    <View style={styles.container}>
      <AdMobBanner
        bannerSize={admobConfig.listAdType}
        adUnitID={
          ios
            ? admobConfig.admobBannerId.iOS
            : admobConfig.admobBannerId.android
        }
        onDidFailToReceiveAdWithError={(error) => console.error(error)}
      />
    </View>
  ) : (
    <View style={styles.dummyAd} />
  );
};

const styles = StyleSheet.create({
  container: {
    width: windowWidth * 0.97,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: windowWidth * 0.03,
  },
  dummyAd: {
    minHeight: 50,
    minWidth: 1,
  },
});

export default ListAdComponent;
