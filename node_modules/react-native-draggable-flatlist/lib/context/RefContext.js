"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.useRefs = void 0;
var react_1 = __importStar(require("react"));
var react_2 = require("react");
var constants_1 = require("../constants");
var PropsContext_1 = require("./PropsContext");
var AnimatedValueContext_1 = require("./AnimatedValueContext");
var RefContext = react_1.default.createContext(undefined);
function RefProvider(_a) {
    var children = _a.children;
    var value = useSetupRefs();
    return react_1.default.createElement(RefContext.Provider, { value: value }, children);
}
exports.default = RefProvider;
function useRefs() {
    var value = react_1.useContext(RefContext);
    if (!value) {
        throw new Error("useRefs must be called from within a RefContext.Provider!");
    }
    return value;
}
exports.useRefs = useRefs;
function useSetupRefs() {
    var props = PropsContext_1.useProps();
    var onRef = props.onRef, _a = props.animationConfig, animationConfig = _a === void 0 ? constants_1.DEFAULT_PROPS.animationConfig : _a;
    var isTouchActiveNative = AnimatedValueContext_1.useAnimatedValues().isTouchActiveNative;
    var propsRef = react_2.useRef(props);
    propsRef.current = props;
    var animConfig = __assign(__assign({}, constants_1.DEFAULT_PROPS.animationConfig), animationConfig);
    var animationConfigRef = react_2.useRef(animConfig);
    animationConfigRef.current = animConfig;
    var cellDataRef = react_2.useRef(new Map());
    var keyToIndexRef = react_2.useRef(new Map());
    var containerRef = react_2.useRef(null);
    var flatlistRef = react_2.useRef(null);
    var panGestureHandlerRef = react_2.useRef(null);
    var scrollOffsetRef = react_2.useRef(0);
    var isTouchActiveRef = react_2.useRef({
        native: isTouchActiveNative,
        js: false,
    });
    react_1.useEffect(function () {
        if (flatlistRef.current)
            onRef === null || onRef === void 0 ? void 0 : onRef(flatlistRef.current);
    }, [onRef]);
    var refs = react_2.useMemo(function () { return ({
        animationConfigRef: animationConfigRef,
        cellDataRef: cellDataRef,
        containerRef: containerRef,
        flatlistRef: flatlistRef,
        isTouchActiveRef: isTouchActiveRef,
        keyToIndexRef: keyToIndexRef,
        panGestureHandlerRef: panGestureHandlerRef,
        propsRef: propsRef,
        scrollOffsetRef: scrollOffsetRef,
    }); }, []);
    return refs;
}
