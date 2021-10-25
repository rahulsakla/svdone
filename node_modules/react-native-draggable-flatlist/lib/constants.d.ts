import Animated from "react-native-reanimated";
export declare const SCROLL_POSITION_TOLERANCE = 2;
export declare const DEFAULT_ANIMATION_CONFIG: Animated.WithSpringConfig;
export declare const DEFAULT_PROPS: {
    autoscrollThreshold: number;
    autoscrollSpeed: number;
    animationConfig: Animated.WithSpringConfig;
    scrollEnabled: boolean;
    dragHitSlop: number | Partial<Record<"bottom" | "left" | "right" | "top" | "horizontal" | "vertical", number>> | Record<"left" | "width", number> | Record<"right" | "width", number> | Record<"top" | "height", number> | Record<"bottom" | "height", number> | undefined;
    activationDistance: number;
    dragItemOverflow: boolean;
};
export declare const isIOS: boolean;
export declare const isAndroid: boolean;
export declare const isWeb: boolean;
export declare const isReanimatedV2 = true;
