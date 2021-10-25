import React, { useRef, useState, useEffect } from "react";
import { AppState, Platform, StyleSheet, Text, View } from "react-native";

const TestScreen = (props) => {
  const [dim, setDim] = useState(0);
  const handleHeaderLayout = (e) => {
    console.log(e.nativeEvent.layout);
    setDim(e.nativeEvent.layout);
  };
  return (
    <View style={styles.container}>
      {dim ? (
        <View
          style={{
            backgroundColor: "red",
            paddingVertical: 10,
            paddingHorizontal: 50,
            position: "absolute",
            top: 0,
            right: 0,
            transform: [
              { translateX: dim.width / 4 },

              {
                translateY: dim.width / 4 - dim.height / 2,
              },
              { rotate: "45deg" },
            ],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              height: 4,
              width: 4,
              backgroundColor: "yellow",
              position: "absolute",
            }}
          ></View>
          <Text style={styles.text}>kjhuhkgvygv ytftr</Text>
        </View>
      ) : (
        <View
          onLayout={(event) => handleHeaderLayout(event)}
          style={{
            opacity: 0,
            backgroundColor: "green",
            paddingVertical: 10,
            paddingHorizontal: 50,
            position: "absolute",
            top: 0,
            right: 0,

            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              height: 4,
              width: 4,
              backgroundColor: "yellow",
              position: "absolute",
            }}
          ></View>
          <Text style={styles.text}>kjhuhkgvygv ytftr</Text>
        </View>
      )}
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "blue",
          position: "absolute",
          top: Platform.OS === "ios" ? 212 / 4 : 206 / 4,
        }}
      ></View>
      <View
        style={{
          height: 200,
          width: 1,
          backgroundColor: "blue",
          position: "absolute",
          top: 0,
          right: Platform.OS === "ios" ? 212 / 4 : 206 / 4,
        }}
      ></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
  },
});

export default TestScreen;
