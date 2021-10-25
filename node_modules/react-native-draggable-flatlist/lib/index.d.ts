import React from "react";
import { FlatListProps, ViewStyle, StyleProp } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
declare const defaultProps: {
    autoscrollThreshold: number;
    autoscrollSpeed: number;
    animationConfig: {
        damping: number;
        mass: number;
        stiffness: number;
        overshootClamping: boolean;
        restSpeedThreshold: number;
        restDisplacementThreshold: number;
    };
    scrollEnabled: boolean;
    dragHitSlop: number | Partial<Record<"bottom" | "left" | "right" | "top" | "horizontal" | "vertical", number>> | Record<"left" | "width", number> | Record<"right" | "width", number> | Record<"top" | "height", number> | Record<"bottom" | "height", number> | undefined;
    activationDistance: number;
    dragItemOverflow: boolean;
};
declare type DefaultProps = Readonly<typeof defaultProps>;
export declare type DragEndParams<T> = {
    data: T[];
    from: number;
    to: number;
};
export declare type RenderItemParams<T> = {
    item: T;
    index?: number;
    drag: () => void;
    isActive: boolean;
};
declare type Modify<T, R> = Omit<T, keyof R> & R;
export declare type DraggableFlatListProps<T> = Modify<FlatListProps<T>, {
    autoscrollSpeed?: number;
    autoscrollThreshold?: number;
    data: T[];
    onRef?: (ref: React.RefObject<FlatList<T>>) => void;
    onDragBegin?: (index: number) => void;
    onRelease?: (index: number) => void;
    onDragEnd?: (params: DragEndParams<T>) => void;
    renderItem: (params: RenderItemParams<T>) => React.ReactNode;
    renderPlaceholder?: (params: {
        item: T;
        index: number;
    }) => React.ReactNode;
    animationConfig: Partial<Animated.SpringConfig>;
    activationDistance?: number;
    debug?: boolean;
    layoutInvalidationKey?: string;
    onScrollOffsetChange?: (scrollOffset: number) => void;
    onPlaceholderIndexChange?: (placeholderIndex: number) => void;
    containerStyle?: StyleProp<ViewStyle>;
    dragItemOverflow?: boolean;
    simultaneousHandlers?: React.Ref<any> | React.Ref<any>[];
} & Partial<DefaultProps>>;
declare type State = {
    activeKey: string | null;
    hoverComponent: React.ReactNode | null;
};
declare type CellData = {
    size: Animated.Value<number>;
    offset: Animated.Value<number>;
    measurements: {
        size: number;
        offset: number;
    };
    style: Animated.AnimateStyle<ViewStyle>;
    currentIndex: Animated.Value<number>;
    onLayout: () => void;
    onUnmount: () => void;
};
declare class DraggableFlatList<T> extends React.Component<DraggableFlatListProps<T>, State> {
    state: State;
    containerRef: React.RefObject<Animated.View>;
    flatlistRef: React.RefObject<FlatList<T>>;
    panGestureHandlerRef: React.RefObject<React.ComponentType<import("react-native-gesture-handler").PanGestureHandlerProps & React.RefAttributes<any>>>;
    containerSize: Animated.Value<number>;
    touchInit: Animated.Value<number>;
    activationDistance: Animated.Value<number>;
    touchAbsolute: Animated.Value<number>;
    panGestureState: Animated.Value<0>;
    isPressedIn: {
        native: Animated.Value<number>;
        js: boolean;
    };
    hasMoved: Animated.Value<0>;
    disabled: Animated.Value<0>;
    activeIndex: Animated.Value<number>;
    spacerIndex: Animated.Value<number>;
    isHovering: Animated.Node<0 | 1>;
    activeCellSize: Animated.Value<number>;
    activeCellOffset: Animated.Value<number>;
    scrollOffset: Animated.Value<number>;
    scrollViewSize: Animated.Value<number>;
    isScrolledUp: Animated.Node<0 | 1>;
    isScrolledDown: Animated.Node<0 | 1>;
    touchCellOffset: Animated.Node<number>;
    hoverAnimUnconstrained: Animated.Node<number>;
    hoverAnimConstrained: Animated.Node<number>;
    hoverAnim: Animated.Node<number>;
    hoverOffset: Animated.Node<number>;
    placeholderOffset: Animated.Value<0>;
    placeholderPos: Animated.Node<number>;
    hoverTo: Animated.Value<0>;
    hoverClock: Animated.Clock;
    hoverAnimState: {
        finished: Animated.Value<0>;
        velocity: Animated.Value<0>;
        position: Animated.Value<0>;
        time: Animated.Value<0>;
    };
    hoverAnimConfig: {
        toValue: Animated.Value<0>;
        damping: (Animated.Adaptable<number> | undefined) & number;
        mass: (Animated.Adaptable<number> | undefined) & number;
        stiffness: (Animated.Adaptable<number> | undefined) & number;
        overshootClamping: (boolean | Animated.Adaptable<number> | undefined) & boolean;
        restSpeedThreshold: (Animated.Adaptable<number> | undefined) & number;
        restDisplacementThreshold: (Animated.Adaptable<number> | undefined) & number;
    };
    distToTopEdge: Animated.Node<number>;
    distToBottomEdge: Animated.Node<number>;
    cellAnim: Map<string, {
        config: Animated.SpringConfig;
        state: Animated.SpringState;
        clock: Animated.Clock;
    }>;
    cellData: Map<string, CellData>;
    cellRefs: Map<string, React.RefObject<Animated.View>>;
    moveEndParams: Animated.Value<number>[];
    resetTouchedCell: Animated.Node<number>[];
    keyToIndex: Map<string, number>;
    isAutoScrollInProgress: {
        native: Animated.Value<number>;
        js: boolean;
    };
    queue: (() => void | Promise<void>)[];
    static getDerivedStateFromProps<U>(props: DraggableFlatListProps<U>): {
        extraData: any;
    };
    static defaultProps: {
        autoscrollThreshold: number;
        autoscrollSpeed: number;
        animationConfig: {
            damping: number;
            mass: number;
            stiffness: number;
            overshootClamping: boolean;
            restSpeedThreshold: number;
            restDisplacementThreshold: number;
        };
        scrollEnabled: boolean;
        dragHitSlop: number | Partial<Record<"bottom" | "left" | "right" | "top" | "horizontal" | "vertical", number>> | Record<"left" | "width", number> | Record<"right" | "width", number> | Record<"top" | "height", number> | Record<"bottom" | "height", number> | undefined;
        activationDistance: number;
        dragItemOverflow: boolean;
    };
    constructor(props: DraggableFlatListProps<T>);
    dataKeysHaveChanged: (a: T[], b: T[]) => boolean;
    componentDidUpdate: (prevProps: DraggableFlatListProps<T>, prevState: State) => Promise<void>;
    flushQueue: () => Promise<void>;
    resetHoverState: () => void;
    drag: (hoverComponent: React.ReactNode, activeKey: string) => void;
    onRelease: ([index]: readonly number[]) => void;
    onDragEnd: ([from, to]: readonly number[]) => void;
    updateCellData: (data?: T[]) => void;
    setCellData: (key: string, index: number) => void;
    measureAll: (data: T[]) => void;
    measureCell: (key: string) => Promise<void>;
    keyExtractor: (item: T, index: number) => string;
    onContainerLayout: () => void;
    onListContentSizeChange: (w: number, h: number) => void;
    targetScrollOffset: Animated.Value<number>;
    resolveAutoscroll?: (scrollParams: readonly number[]) => void;
    onAutoscrollComplete: (params: readonly number[]) => void;
    scrollToAsync: (offset: number) => Promise<readonly number[]>;
    getScrollTargetOffset: (distFromTop: number, distFromBottom: number, scrollOffset: number, isScrolledUp: boolean, isScrolledDown: boolean) => number;
    autoscrollLooping: boolean;
    autoscroll: (params: readonly number[]) => Promise<void>;
    isAtTopEdge: Animated.Node<0 | 1>;
    isAtBottomEdge: Animated.Node<0 | 1>;
    isAtEdge: Animated.Node<0 | 1>;
    autoscrollParams: Animated.Node<number>[];
    checkAutoscroll: Animated.Node<number>;
    onScroll: (...args: any[]) => void;
    onGestureRelease: Animated.Node<number>[];
    onPanStateChange: (...args: any[]) => void;
    onPanGestureEvent: (...args: any[]) => void;
    hoverComponentTranslate: Animated.Node<number>;
    hoverComponentOpacity: Animated.Node<0 | 1>;
    renderHoverComponent: () => JSX.Element;
    renderItem: ({ item, index }: {
        item: T;
        index: number;
    }) => JSX.Element;
    renderOnPlaceholderIndexChange: () => JSX.Element;
    renderPlaceholder: () => JSX.Element | null;
    CellRendererComponent: (cellProps: any) => JSX.Element | null;
    renderDebug(): JSX.Element;
    onContainerTouchEnd: () => void;
    render(): JSX.Element;
}
export default DraggableFlatList;
