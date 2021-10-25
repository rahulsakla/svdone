"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReanimatedV2 = exports.isWeb = exports.isAndroid = exports.isIOS = exports.DEFAULT_PROPS = exports.DEFAULT_ANIMATION_CONFIG = exports.SCROLL_POSITION_TOLERANCE = void 0;
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
// Fire onScrollComplete when within this many px of target offset
exports.SCROLL_POSITION_TOLERANCE = 2;
exports.DEFAULT_ANIMATION_CONFIG = {
    damping: 20,
    mass: 0.2,
    stiffness: 100,
    overshootClamping: false,
    restSpeedThreshold: 0.2,
    restDisplacementThreshold: 0.2,
};
exports.DEFAULT_PROPS = {
    autoscrollThreshold: 30,
    autoscrollSpeed: 100,
    animationConfig: exports.DEFAULT_ANIMATION_CONFIG,
    scrollEnabled: true,
    dragHitSlop: 0,
    activationDistance: 0,
    dragItemOverflow: false,
};
exports.isIOS = react_native_1.Platform.OS === "ios";
exports.isAndroid = react_native_1.Platform.OS === "android";
exports.isWeb = react_native_1.Platform.OS === "web";
// Is there a better way to check for v2?
exports.isReanimatedV2 = !!react_native_reanimated_1.useSharedValue;
