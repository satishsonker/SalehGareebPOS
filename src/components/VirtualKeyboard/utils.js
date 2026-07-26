// utils.js

/**
 * Returns current selection from an input/textarea.
 */
export function getSelection(element) {

    if (!element) {

        return {
            start: 0,
            end: 0
        };

    }

    return {

        start: element.selectionStart ?? 0,

        end: element.selectionEnd ?? 0

    };

}

/**
 * Restores cursor position.
 */
export function setSelection(element, start, end = start) {

    if (!element)
        return;

    requestAnimationFrame(() => {

        element.focus();

        element.setSelectionRange(start, end);

    });

}

/**
 * Replace selected text.
 */
export function replaceSelection(
    value,
    start,
    end,
    replacement
) {

    const newValue =
        value.substring(0, start) +
        replacement +
        value.substring(end);

    return {

        value: newValue,

        cursor: start + replacement.length

    };

}

/**
 * Insert text.
 */
export function insertText(
    value,
    start,
    end,
    text
) {

    return replaceSelection(
        value,
        start,
        end,
        text
    );

}

/**
 * Safe insert with max length.
 */
export function safeInsert(value,start, end, text, maxLength = Number.MAX_SAFE_INTEGER) {

    const newLength = value.length - (end - start) + text.length;

    if (newLength > maxLength) {
        return {
            value,
            cursor: start
        };
    }

    return insertText( value, start ,end, text );

}

/**
 * Backspace.
 */
export function backspace(
    value,
    start,
    end
) {

    if (start !== end) {

        return replaceSelection(
            value,
            start,
            end,
            ""
        );

    }

    if (start === 0) {

        return {

            value,

            cursor: 0

        };

    }

    return {

        value:
            value.substring(0, start - 1) +
            value.substring(start),

        cursor: start - 1

    };

}

/**
 * Forward delete.
 */
export function deleteForward(
    value,
    start,
    end
) {

    if (start !== end) {

        return replaceSelection(
            value,
            start,
            end,
            ""
        );

    }

    if (start >= value.length) {

        return {

            value,

            cursor: start

        };

    }

    return {

        value:
            value.substring(0, start) +
            value.substring(start + 1),

        cursor: start

    };

}

/**
 * Clear text.
 */
export function clearText() {

    return {

        value: "",

        cursor: 0

    };

}

/**
 * Apply Shift / CapsLock.
 */
export function applyCase(
    character,
    shift,
    capsLock
) {

    if (character.length !== 1)
        return character;

    const upper = shift !== capsLock;

    return upper
        ? character.toUpperCase()
        : character.toLowerCase();

}

/**
 * Move cursor left.
 */
export function moveCursorLeft(cursor) {

    return Math.max(0, cursor - 1);

}

/**
 * Move cursor right.
 */
export function moveCursorRight(cursor, value) {

    return Math.min(
        value.length,
        cursor + 1
    );

}

/**
 * Move cursor to start.
 */
export function moveCursorHome() {

    return 0;

}

/**
 * Move cursor to end.
 */
export function moveCursorEnd(value) {

    return value.length;

}

/**
 * Select entire value.
 */
export function selectAll(element) {

    if (!element)
        return;

    requestAnimationFrame(() => {

        element.focus();

        element.select();

    });

}

/**
 * Numeric validation.
 */
export function isNumeric(value) {

    return /^\d+$/.test(value);

}

/**
 * Decimal validation.
 */
export function isDecimal(value) {

    return /^\d*\.?\d*$/.test(value);

}

/**
 * Phone validation.
 */
export function isPhone(value) {

    return /^[0-9+\- ]*$/.test(value);

}

/**
 * Email character validation.
 */
export function isEmailCharacter(character) {

    return /^[A-Za-z0-9@._-]$/.test(character);

}

/**
 * Prevent multiple decimal points.
 */
export function canInsertDecimal(value) {

    return !value.includes(".");

}

/**
 * Trim text.
 */
export function trimValue(value) {

    return value.trim();

}

/**
 * Clamp number.
 */
export function clamp(
    value,
    min,
    max
) {

    return Math.min(
        Math.max(value, min),
        max
    );

}

/**
 * Format Date -> yyyy-MM-dd
 */
export function formatDate(date) {

    if (!date)
        return "";

    const d = new Date(date);

    const year = d.getFullYear();

    const month = String(
        d.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        d.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}

/**
 * Parse yyyy-MM-dd
 */
export function parseDate(value) {

    if (!value)
        return null;

    const d = new Date(value);

    if (Number.isNaN(d.getTime()))
        return null;

    return d;

}

/**
 * Compare dates (time ignored)
 */
export function compareDates(a, b) {

    const d1 = new Date(a);

    const d2 = new Date(b);

    d1.setHours(0, 0, 0, 0);

    d2.setHours(0, 0, 0, 0);

    return d1.getTime() - d2.getTime();

}

/**
 * Is date disabled?
 */
export function isDateDisabled(
    date,
    options
) {

    if (!date)
        return false;

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (
        options.disablePastDates &&
        compareDates(date, today) < 0
    ) {

        return true;

    }

    if (
        options.disableFutureDates &&
        compareDates(date, today) > 0
    ) {

        return true;

    }

    if (
        options.minDate &&
        compareDates(date, options.minDate) < 0
    ) {

        return true;

    }

    if (
        options.maxDate &&
        compareDates(date, options.maxDate) > 0
    ) {

        return true;

    }

    return false;

}