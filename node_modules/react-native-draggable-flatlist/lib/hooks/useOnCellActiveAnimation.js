"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOnCellActiveAnimation = void 0;
var react_native_reanimated_1 = require("react-native-reanimated");
var AnimatedValueContext_1 = require("../context/AnimatedValueContext");
var CellContext_1 = require("../context/CellContext");
var procs_1 = require("../procs");
var useSpring_1 = require("./useSpring");
function useOnCellActiveAnimation(_a) {
    var _b = _a === void 0 ? { animationConfig: {} } : _a, animationConfig = _b.animationConfig;
    var _c = useSpring_1.useSpring({ config: animationConfig }), clock = _c.clock, state = _c.state, config = _c.config;
    var isDraggingCell = AnimatedValueContext_1.useAnimatedValues().isDraggingCell;
    var isActive = CellContext_1.useIsActive();
    react_native_reanimated_1.useCode(function () {
        return react_native_reanimated_1.block([
            react_native_reanimated_1.onChange(isDraggingCell, [
                //@ts-ignore
                react_native_reanimated_1.set(config.toValue, react_native_reanimated_1.cond(isDraggingCell, 1, 0)),
                react_native_reanimated_1.startClock(clock),
            ]),
            react_native_reanimated_1.cond(react_native_reanimated_1.clockRunning(clock), [
                procs_1.springFill(clock, state, config),
                react_native_reanimated_1.cond(state.finished, [
                    react_native_reanimated_1.stopClock(clock),
                    react_native_reanimated_1.set(state.finished, 0),
                    react_native_reanimated_1.set(state.time, 0),
                    react_native_reanimated_1.set(state.velocity, 0),
                ]),
            ]),
        ]);
    }, []);
    return {
        isActive: isActive,
        onActiveAnim: state.position,
    };
}
exports.useOnCellActiveAnimation = useOnCellActiveAnimation;
