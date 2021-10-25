"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
var AnimatedValueContext_1 = require("../context/AnimatedValueContext");
var DraggableFlatListContext_1 = require("../context/DraggableFlatListContext");
var PropsContext_1 = require("../context/PropsContext");
var RefContext_1 = require("../context/RefContext");
var useNode_1 = require("../hooks/useNode");
var utils_1 = require("../utils");
function PlaceholderItem(_a) {
    var _b, _c;
    var _d;
    var renderPlaceholder = _a.renderPlaceholder;
    var _e = AnimatedValueContext_1.useAnimatedValues(), activeCellSize = _e.activeCellSize, placeholderScreenOffset = _e.placeholderScreenOffset, spacerIndexAnim = _e.spacerIndexAnim;
    var _f = RefContext_1.useRefs(), keyToIndexRef = _f.keyToIndexRef, propsRef = _f.propsRef;
    var activeKey = DraggableFlatListContext_1.useDraggableFlatListContext().activeKey;
    var horizontal = PropsContext_1.useProps().horizontal;
    // for some reason using placeholderScreenOffset directly is buggy
    var translate = react_native_reanimated_1.useValue(0);
    var onPlaceholderIndexChange = react_1.useCallback(function (index) {
        var _a, _b;
        (_b = (_a = propsRef.current).onPlaceholderIndexChange) === null || _b === void 0 ? void 0 : _b.call(_a, index);
    }, [propsRef]);
    react_native_reanimated_1.useCode(function () {
        return react_native_reanimated_1.onChange(spacerIndexAnim, react_native_reanimated_1.call([spacerIndexAnim], function (_a) {
            var i = _a[0];
            onPlaceholderIndexChange(i);
        }));
    }, []);
    var translateKey = horizontal ? "translateX" : "translateY";
    var sizeKey = horizontal ? "width" : "height";
    var opacity = useNode_1.useNode(react_native_reanimated_1.cond(react_native_reanimated_1.greaterThan(spacerIndexAnim, -1), 1, 0));
    var activeIndex = activeKey
        ? keyToIndexRef.current.get(activeKey)
        : undefined;
    var activeItem = activeIndex === undefined ? null : (_d = propsRef.current) === null || _d === void 0 ? void 0 : _d.data[activeIndex];
    var animStyle = (_b = {
            opacity: opacity
        },
        _b[sizeKey] = activeCellSize,
        _b.transform = [
            (_c = {}, _c[translateKey] = translate, _c),
        ],
        _b);
    return (react_1.default.createElement(react_native_reanimated_1.default.View, { pointerEvents: activeKey ? "auto" : "none", style: [react_native_1.StyleSheet.absoluteFill, animStyle] },
        !activeItem || activeIndex === undefined
            ? null
            : renderPlaceholder === null || renderPlaceholder === void 0 ? void 0 : renderPlaceholder({ item: activeItem, index: activeIndex }),
        react_1.default.createElement(react_native_reanimated_1.default.Code, null, function () { return react_native_reanimated_1.set(translate, placeholderScreenOffset); })));
}
exports.default = utils_1.typedMemo(PlaceholderItem);
