// KeyboardLayouts.js

import {
    KeyboardType,
    KeyWidth,
    KeyColor,
    KeyVariant,
    SpecialKey
} from "./constants";

/**
 * Creates a standard key.
 */
export function key(label, options = {}) {
    return {
        type: "key",
        label,
        value: options.value ?? label,
        width: options.width ?? KeyWidth.NORMAL,
        color: options.color ?? KeyColor.DEFAULT,
        variant: options.variant ?? KeyVariant.FILLED,
        className: options.className ?? "",
        disabled: options.disabled ?? false
    };
}

/**
 * Creates a special key.
 */
export function special(label, action, options = {}) {
    return {
        type: "special",
        label,
        action,
        icon: options.icon ?? null,
        width: options.width ?? KeyWidth.WIDE,
        color: options.color ?? KeyColor.DEFAULT,
        variant: options.variant ?? KeyVariant.FILLED,
        className: options.className ?? "",
        disabled: options.disabled ?? false,
        repeat: options.repeat ?? false
    };
}

/**
 * Numeric Keyboard
 */
export const NumericLayout = [

    [
        key("1"),
        key("2"),
        key("3")
    ],

    [
        key("4"),
        key("5"),
        key("6")
    ],

    [
        key("7"),
        key("8"),
        key("9")
    ],

    [
        key("."),
        key("0"),

        special(
            "Backspace",
            SpecialKey.BACKSPACE,
            {
                icon: "delete",
                repeat: true,
                color: KeyColor.WARNING
            }
        )
    ],

    [
        special(
            "Clear",
            SpecialKey.CLEAR,
            {
                icon: "clear",
                width: KeyWidth.EXTRA_WIDE,
                color: KeyColor.DANGER
            }
        ),

        special(
            "Confirm",
            SpecialKey.CONFIRM,
            {
                icon: "confirm",
                width: KeyWidth.EXTRA_WIDE,
                color: KeyColor.SUCCESS
            }
        )
    ]

];

/**
 * Phone Keyboard
 */
export const PhoneLayout = [

    [
        key("1"),
        key("2"),
        key("3")
    ],

    [
        key("4"),
        key("5"),
        key("6")
    ],

    [
        key("7"),
        key("8"),
        key("9")
    ],

    [
        key("+"),
        key("0"),

        special(
            "Backspace",
            SpecialKey.BACKSPACE,
            {
                icon: "delete",
                repeat: true
            }
        )
    ],

    [
        special(
            "Confirm",
            SpecialKey.CONFIRM,
            {
                icon: "confirm",
                width: KeyWidth.EXTRA_WIDE,
                color: KeyColor.SUCCESS
            }
        )
    ]

];

/**
 * Alphabet Keyboard
 */
export const AlphabetLayout = [

    "QWERTYUIOP".split("").map(key),

    "ASDFGHJKL".split("").map(key),

    [

        special(
            "Shift",
            SpecialKey.SHIFT,
            {
                icon: "shift"
            }
        ),

        ..."ZXCVBNM".split("").map(key),

        special(
            "⌫",
            SpecialKey.BACKSPACE,
            {
                icon: "delete",
                repeat: true
            }
        )

    ],

    [

        special(
            "Space",
            SpecialKey.SPACE,
            {
                width: KeyWidth.EXTRA_WIDE
            }
        )

    ],

    [

        special(
            "Clear",
            SpecialKey.CLEAR,
            {
                icon: "clear",
                color: KeyColor.DANGER
            }
        ),

        special(
            "Cancel",
            SpecialKey.CANCEL,
            {
                icon: "cancel"
            }
        ),

        special(
            "Confirm",
            SpecialKey.CONFIRM,
            {
                icon: "confirm",
                color: KeyColor.SUCCESS
            }
        )

    ]

];

/**
 * AlphaNumeric Keyboard
 */
export const AlphaNumericLayout = [

    "1234567890".split("").map(key),

    ...AlphabetLayout

];

/**
 * Email Keyboard
 */
export const EmailLayout = [

    ...AlphaNumericLayout,

    [

        key("@"),

        key("."),

        key("_"),

        key("-")

    ]

];

/**
 * Vehicle Number Keyboard
 */
export const VehicleLayout = [

    "1234567890".split("").map(key),

    "QWERTYUIOP".split("").map(key),

    "ASDFGHJKL".split("").map(key),

    [

        ..."ZXCVBNM".split("").map(key),

        key("-"),

        special(
            "Backspace",
            SpecialKey.BACKSPACE,
            {
                icon: "delete",
                repeat: true
            }
        )

    ],

    [

        special(
            "Confirm",
            SpecialKey.CONFIRM,
            {
                icon: "confirm",
                width: KeyWidth.EXTRA_WIDE,
                color: KeyColor.SUCCESS
            }
        )

    ]

];

/**
 * Decimal Keyboard
 */
export const DecimalLayout = NumericLayout;

/**
 * Calculator Keyboard
 */
export const CalculatorLayout = [

    [
        key("7"),
        key("8"),
        key("9"),
        key("/")
    ],

    [
        key("4"),
        key("5"),
        key("6"),
        key("*")
    ],

    [
        key("1"),
        key("2"),
        key("3"),
        key("-")
    ],

    [
        key("."),
        key("0"),
        key("="),
        key("+")
    ]

];

/**
 * Resolve keyboard layout.
 */
export function getLayout(type, customLayout = null) {

    if (customLayout)
        return customLayout;

    switch (type) {

        case KeyboardType.NUMERIC:
            return NumericLayout;

        case KeyboardType.ALPHABET:
            return AlphabetLayout;

        case KeyboardType.ALPHANUMERIC:
            return AlphaNumericLayout;

        case KeyboardType.PHONE:
            return PhoneLayout;

        case KeyboardType.EMAIL:
            return EmailLayout;

        case KeyboardType.VEHICLE:
            return VehicleLayout;

        case KeyboardType.CUSTOM:
            return customLayout ?? [];

        default:
            return AlphabetLayout;
    }

}