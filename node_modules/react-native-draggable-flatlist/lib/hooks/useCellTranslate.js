"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCellTranslate = void 0;
var react_native_reanimated_1 = require("react-native-reanimated");
var AnimatedValueContext_1 = require("../context/AnimatedValueContext");
var RefContext_1 = require("../context/RefContext");
var procs_1 = require("../procs");
var useSpring_1 = require("./useSpring");
var useNode_1 = require("../hooks/useNode");
var DraggableFlatListContext_1 = require("../context/DraggableFlatListContext");
function useCellTranslate(_a) {
    var cellIndex = _a.cellIndex, cellSize = _a.cellSize, cellOffset = _a.cellOffset;
    var _b = AnimatedValueContext_1.useAnimatedValues(), activeIndexAnim = _b.activeIndexAnim, activeCellSize = _b.activeCellSize, hoverAnim = _b.hoverAnim, scrollOffset = _b.scrollOffset, spacerIndexAnim = _b.spacerIndexAnim, placeholderOffset = _b.placeholderOffset, isDraggingCell = _b.isDraggingCell, resetTouchedCell = _b.resetTouchedCell, disabled = _b.disabled;
    var animationConfigRef = RefContext_1.useRefs().animationConfigRef;
    var onDragEnd = DraggableFlatListContext_1.useDraggableFlatListContext().onDragEnd;
    var cellSpring = useSpring_1.useSpring({ config: animationConfigRef.current });
    var clock = cellSpring.clock, state = cellSpring.state, config = cellSpring.config;
    var isAfterActive = react_native_reanimated_1.useValue(0);
    var isClockRunning = useNode_1.useNode(react_native_reanimated_1.clockRunning(clock));
    var runSpring = useNode_1.useNode(procs_1.springFill(clock, state, config));
    // Even though this is the same value as hoverOffset passed via context
    // the android context value lags behind the actual value on autoscroll
    var cellHoverOffset = useNode_1.useNode(react_native_reanimated_1.add(hoverAnim, scrollOffset));
    var onFinished = useNode_1.useNode(react_native_reanimated_1.cond(isClockRunning, [
        react_native_reanimated_1.stopClock(clock),
        react_native_reanimated_1.cond(react_native_reanimated_1.eq(cellIndex, activeIndexAnim), [
            resetTouchedCell,
            react_native_reanimated_1.call([activeIndexAnim, spacerIndexAnim], onDragEnd),
        ]),
    ]));
    var prevTrans = react_native_reanimated_1.useValue(0);
    var prevSpacerIndex = react_native_reanimated_1.useValue(-1);
    var prevIsDraggingCell = react_native_reanimated_1.useValue(0);
    var cellTranslate = useNode_1.useNode(procs_1.setupCell(cellIndex, cellSize, cellOffset, isAfterActive, prevTrans, prevSpacerIndex, activeIndexAnim, activeCellSize, cellHoverOffset, spacerIndexAnim, 
    //@ts-ignore
    config.toValue, state.position, state.time, state.finished, runSpring, onFinished, isDraggingCell, placeholderOffset, prevIsDraggingCell, clock, disabled));
    // This is required to continually evaluate values
    react_native_reanimated_1.useCode(function () {
        return react_native_reanimated_1.block([
            react_native_reanimated_1.onChange(cellTranslate, []),
            react_native_reanimated_1.onChange(prevTrans, []),
            react_native_reanimated_1.onChange(cellSize, []),
            react_native_reanimated_1.onChange(cellOffset, []),
        ]);
    }, []);
    return state.position;
}
exports.useCellTranslate = useCellTranslate;
