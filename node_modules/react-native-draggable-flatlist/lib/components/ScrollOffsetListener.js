"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_reanimated_1 = require("react-native-reanimated");
var utils_1 = require("../utils");
var ScrollOffsetListener = function (_a) {
    var scrollOffset = _a.scrollOffset, onScrollOffsetChange = _a.onScrollOffsetChange;
    react_native_reanimated_1.useCode(function () { return react_native_reanimated_1.onChange(scrollOffset, react_native_reanimated_1.call([scrollOffset], onScrollOffsetChange)); }, []);
    return null;
};
exports.default = utils_1.typedMemo(ScrollOffsetListener);
