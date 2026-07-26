// index.js

// Provider
export { default as KeyboardProvider } from "./KeyboardProvider";

// Context Hook
export { default as useKeyboard } from "./useKeyboard";

// Components
export { default as VirtualKeyboard } from "./VirtualKeyboard";
export { default as KeyboardInput } from "./KeyboardInput";
export { default as KeyboardButton } from "./KeyboardButton";
export { default as DatePicker } from "./DatePicker";

// Layouts
export {
    NumericLayout,
    AlphabetLayout,
    AlphaNumericLayout,
    PhoneLayout,
    EmailLayout,
    VehicleLayout,
    DecimalLayout,
    CalculatorLayout,
    getLayout
} from "./KeyboardLayouts";

// Constants
export {
    KeyboardType,
    KeyColor,
    KeyWidth,
    KeyVariant,
    SpecialKey,
    KeyboardConfig,
    DefaultOptions
} from "./constants";

// Icons
export {
    KeyboardIcons,
    getKeyboardIcon,
    getKeyboardIconNames,
    hasKeyboardIcon
} from "./KeyboardIcons";

// Utilities
export {
    getSelection,
    setSelection,
    replaceSelection,
    insertText,
    safeInsert,
    backspace,
    deleteForward,
    clearText,
    applyCase,
    moveCursorLeft,
    moveCursorRight,
    moveCursorHome,
    moveCursorEnd,
    selectAll,
    isNumeric,
    isDecimal,
    isPhone,
    isEmailCharacter,
    canInsertDecimal,
    trimValue,
    clamp,
    formatDate,
    parseDate,
    compareDates,
    isDateDisabled
} from "./utils";