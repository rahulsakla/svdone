import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { COLORS } from "../variables/color";
import { LiteCreditCardInput } from "react-native-credit-card-input";
import { decodeString } from "../helper/helper";

const { width: windowWidth } = Dimensions.get("window");
const PaymentMethodCard = ({
  method,
  isLast,
  onSelect,
  selected,
  onCardDataUpdate,
}) => {
  const [iconDim, setIconDim] = useState({ iconHeight: 0, iconWidth: 0 });

  useEffect(() => {
    makeVisible();
    return () => {};
  }, [selected]);

  const areaHeight = new Animated.Value(0);
  const areaOpacity = new Animated.Value(0);

  const makeVisible = () => {
    Animated.timing(areaHeight, {
      toValue: 300,
      duration: 500,
      useNativeDriver: false,
    }).start();
    Animated.timing(areaOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if (method?.icon) {
      Image.getSize(method?.icon, (width, height) => {
        const ratio = width / height;
        let tempDim = { iconHeight: 0, iconWidth: 0 };
        if (ratio * 20 < windowWidth * 0.25) {
          tempDim = { iconHeight: 20, iconWidth: ratio * 20 };
        } else {
          tempDim = { iconHeight: 20, iconWidth: windowWidth * 0.25 };
        }

        setIconDim(tempDim);
      });
    }
  }, []);

  return (
    <View style={[styles.container]}>
      <TouchableOpacity onPress={() => onSelect(method)}>
        <View style={styles.titleRow}>
          <View style={styles.checkBox}>
            {selected?.id === method.id && <View style={styles.inner} />}
          </View>
          <View style={{ flex: 1, alignContent: "flex-start" }}>
            <Text style={styles.title}>{method.title}</Text>
          </View>
          {!!method.icon && (
            <View style={styles.paymentMethodIconWrap}>
              <Image
                source={{ uri: method.icon }}
                style={{
                  height: iconDim.iconHeight,
                  width: iconDim.iconWidth,
                  resizeMode: "contain",
                }}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
      {selected?.id === method?.id && (
        <>
          {selected?.id === "offline" && (
            <Animated.View
              style={[
                styles.cardContentWrap,
                { maxHeight: areaHeight, opacity: areaOpacity, marginTop: 10 },
              ]}
            >
              <View style={styles.cardContent}>
                {!!method.description && (
                  <Text style={styles.cardDescription}>
                    {method.description}
                  </Text>
                )}
              </View>
            </Animated.View>
          )}
          {selected?.id === "paypal" && (
            <Animated.View
              style={[
                styles.cardContentWrap,
                {
                  maxHeight: areaHeight,
                  opacity: areaOpacity,
                  marginTop: 10,
                },
              ]}
            >
              <View style={[styles.cardContent, { padding: 10 }]}>
                {!!method.description && (
                  <Text style={styles.text}>{method.description}</Text>
                )}
              </View>
            </Animated.View>
          )}
          {selected?.id === "authorizenet" && (
            <>
              {!!method.description && (
                <Text style={styles.cardDescription}>{method.description}</Text>
              )}
              <Animated.View
                style={[
                  styles.cardContentWrap,
                  {
                    maxHeight: areaHeight,
                    opacity: areaOpacity,
                    marginTop: !!method.description ? 0 : 10,
                  },
                ]}
              >
                <View style={styles.cardContent}>
                  <LiteCreditCardInput
                    onChange={(form) => onCardDataUpdate(form)}
                  />
                </View>
              </Animated.View>
            </>
          )}
          {selected?.id === "stripe" && (
            <>
              {!!method.description && (
                <Text style={styles.cardDescription}>
                  {decodeString(method.description)}
                </Text>
              )}
              <Animated.View
                style={[
                  styles.cardContentWrap,
                  {
                    maxHeight: areaHeight,
                    opacity: areaOpacity,
                    marginTop: !!method.description ? 0 : 10,
                  },
                ]}
              >
                <View style={styles.cardContent}>
                  <LiteCreditCardInput
                    onChange={(form) => onCardDataUpdate(form)}
                  />
                </View>
              </Animated.View>
            </>
          )}
        </>
      )}
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: isLast ? COLORS.white : COLORS.border_light,
          marginTop: 12,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    paddingHorizontal: 10,
    margin: 10,
    backgroundColor: COLORS.bg_dark,
  },
  cardContentWrap: {
    backgroundColor: COLORS.bg_light,
  },
  cardDescription: {
    padding: 10,
  },
  checkBox: {
    height: 15,
    width: 15,
    borderRadius: 15 / 2,
    borderWidth: 2,
    borderColor: COLORS.border_light,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: 10,
    paddingTop: 12,
  },
  inner: {
    height: 8,
    width: 8,
    borderRadius: 8 / 2,
    backgroundColor: COLORS.primary,
  },
  paymentMethodIconWrap: {
    height: 20,
  },
  title: {
    paddingLeft: 5,
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default PaymentMethodCard;
