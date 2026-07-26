// KeyboardIcons.js

import {
    FiDelete,
    FiTrash2,
    FiCheck,
    FiX,
    FiArrowUp,
    FiCornerDownLeft,
    FiArrowLeft,
    FiArrowRight,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
    FiLock,
    FiUnlock,
    FiMinus,
    FiPlus,
    FiAtSign,
    FiHash,
    FiSlash,
    FiCalendar,
    FiClock,
    FiSearch,
    FiMail,
    FiPhone,
    FiEdit3,
    FiMoreHorizontal
} from "react-icons/fi";

/**
 * Icon registry
 *
 * Layouts reference icons by name instead of importing
 * React components directly.
 */
export const KeyboardIcons = Object.freeze({

    delete: FiDelete,

    clear: FiTrash2,

    confirm: FiCheck,

    cancel: FiX,

    shift: FiArrowUp,

    enter: FiCornerDownLeft,

    left: FiArrowLeft,

    right: FiArrowRight,

    previous: FiChevronLeft,

    next: FiChevronRight,

    home: FiChevronsLeft,

    end: FiChevronsRight,

    caps: FiLock,

    unlock: FiUnlock,

    minus: FiMinus,

    plus: FiPlus,

    at: FiAtSign,

    hash: FiHash,

    slash: FiSlash,

    calendar: FiCalendar,

    clock: FiClock,

    search: FiSearch,

    email: FiMail,

    phone: FiPhone,

    edit: FiEdit3,

    more: FiMoreHorizontal

});

/**
 * Returns icon component.
 *
 * @param {string} name
 * @returns {React.Component|null}
 */
export function getKeyboardIcon(name) {

    if (!name)
        return null;

    return KeyboardIcons[name] ?? null;

}

/**
 * Returns true if icon exists.
 */
export function hasKeyboardIcon(name) {

    return Object.prototype.hasOwnProperty.call(
        KeyboardIcons,
        name
    );

}

/**
 * Returns all registered icon names.
 */
export function getKeyboardIconNames() {

    return Object.keys(KeyboardIcons);

}