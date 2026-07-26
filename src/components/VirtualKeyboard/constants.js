// constants.js

/**
 * Keyboard types
 */
export const KeyboardType = Object.freeze({
    NUMERIC: "numeric",
    ALPHABET: "alphabet",
    ALPHANUMERIC: "alphanumeric",
    PHONE: "phone",
    EMAIL: "email",
    VEHICLE: "vehicle",
    CUSTOM: "custom"
});

/**
 * Date picker types
 */
export const PickerType = Object.freeze({
    DATE: "date",
    TIME: "time",
    DATETIME: "datetime"
});

/**
 * Key width
 */
export const KeyWidth = Object.freeze({
    NORMAL: "normal",
    WIDE: "wide",
    EXTRA_WIDE: "extra-wide"
});

/**
 * Keyboard actions
 */
export const SpecialKey = Object.freeze({
    SHIFT: "SHIFT",
    CAPS: "CAPS",

    BACKSPACE: "BACKSPACE",
    DELETE: "DELETE",
    CLEAR: "CLEAR",

    SPACE: "SPACE",
    TAB: "TAB",
    ENTER: "ENTER",

    LEFT: "LEFT",
    RIGHT: "RIGHT",
    HOME: "HOME",
    END: "END",

    CONFIRM: "CONFIRM",
    CANCEL: "CANCEL"
});

/**
 * Keyboard themes
 */
export const KeyboardTheme = Object.freeze({
    LIGHT: "light",
    DARK: "dark",
    AUTO: "auto"
});

/**
 * Repeat timings
 */
export const KeyboardConfig = Object.freeze({

    repeatDelay: 450,

    repeatInterval: 60

});

/**
 * Default keyboard options
 */
export const DefaultOptions = Object.freeze({

    type: KeyboardType.ALPHABET,

    layout: null,

    label: "",

    placeholder: "",

    theme: KeyboardTheme.LIGHT,

    maxLength: Number.MAX_SAFE_INTEGER,

    closeOnConfirm: true,

    closeOnCancel: true,

    enablePhysicalKeyboard: true,

    enableSound: false,

    enableVibration: false,

    autoCapitalize: false,

    disablePastDates: false,

    disableFutureDates: false,

    minDate: null,

    maxDate: null

});

/**
 * Key colors
 */
export const KeyColor = Object.freeze({

    DEFAULT: "default",

    PRIMARY: "primary",

    SUCCESS: "success",

    DANGER: "danger",

    WARNING: "warning"

});

/**
 * Key variants
 */
export const KeyVariant = Object.freeze({

    FILLED: "filled",

    OUTLINED: "outlined",

    TEXT: "text"

});