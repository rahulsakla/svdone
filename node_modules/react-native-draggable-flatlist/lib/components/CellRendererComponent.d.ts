import React from "react";
import { LayoutChangeEvent } from "react-native";
declare type Props<T> = {
    item: T;
    index: number;
    children: React.ReactNode;
    onLayout: (e: LayoutChangeEvent) => void;
};
declare function CellRendererComponent<T>(props: Props<T>): JSX.Element;
declare const _default: typeof CellRendererComponent;
export default _default;
