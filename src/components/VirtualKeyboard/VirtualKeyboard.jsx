// VirtualKeyboard.jsx

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import { createPortal } from "react-dom";

import KeyboardButton from "./KeyboardButton";
import useKeyboard from "./useKeyboard";

import { getLayout } from "./KeyboardLayouts";

import {
    KeyboardType,
    SpecialKey
} from "./constants";

import {
    getSelection,
    setSelection,
    safeInsert,
    backspace,
    deleteForward,
    clearText,
    applyCase
} from "./utils";

import "./VirtualKeyboard.css";

export default function VirtualKeyboard() {

    const {

        isOpen,
        activeInput,
        options,

        updateValue,
        confirmValue,
        cancelKeyboard

    } = useKeyboard();

    const keyboardRef = useRef(null);

    const [text, setText] = useState("");

    const [shift, setShift] = useState(false);

    const [capsLock, setCapsLock] = useState(false);

    const [selection, setSelectionState] = useState({

        start: 0,
        end: 0

    });

    /**
     * Load value whenever keyboard opens
     */
    useEffect(() => {

        if (!isOpen)
            return;

        setText(activeInput?.value ?? "");

    }, [

        isOpen,
        activeInput

    ]);

    /**
     * Restore cursor
     */
    useEffect(() => {

        if (!isOpen)
            return;

        if (!activeInput?.ref)
            return;

        setSelectionState({

            start: activeInput.selectionStart,

            end: activeInput.selectionEnd

        });

    }, [

        isOpen,
        activeInput

    ]);

    /**
     * Keyboard layout
     */
    const layout = useMemo(() => {

        return getLayout(

            options.keyboard ??
            KeyboardType.ALPHABET,

            options.layout

        );

    }, [

        options

    ]);

    /**
 * Apply text changes
 */
    const commit = useCallback((result) => {
        setText(result.value);

        updateValue({ target: { value: result.value, name: activeInput?.name } });

        setSelectionState({

            start: result.cursor,

            end: result.cursor

        });

        if (activeInput?.ref) {

            setSelection(

                activeInput.ref,

                result.cursor,

                result.cursor

            );

        }

    }, [

        activeInput,

        updateValue

    ]);

    /**
 * Read latest selection
 */
    const currentSelection = useCallback(() => {

        if (!activeInput?.ref)
            return selection;

        const sel = getSelection(activeInput.ref);

        setSelectionState(sel);

        return sel;

    }, [

        activeInput,

        selection

    ]);

    /**
 * Insert character
 */
    const insertCharacter = useCallback((character) => {

        const sel = selection ?? currentSelection();

        let value = character;

        if (

            options.keyboard !== KeyboardType.NUMERIC

        ) {

            value = applyCase(

                character,

                shift,

                capsLock

            );

        }

        const result = safeInsert(text,sel.start,sel.end,value,options.maxLength);

        commit(result);

        if (shift) {

            setShift(false);

        }

    }, [

        text,

        shift,

        capsLock,

        options,

        currentSelection,

        commit

    ]);

    const handleBackspace = useCallback(() => {

        const sel = selection ?? currentSelection();

        commit(

            backspace(

                text,

                sel.start,

                sel.end

            )

        );

    }, [

        text,

        currentSelection,

        commit

    ]);

    const handleDelete = useCallback(() => {

        const sel = selection ?? currentSelection();

        commit(

            deleteForward(

                text,

                sel.start,

                sel.end

            )

        );

    }, [

        text,

        currentSelection,

        commit

    ]);

    const handleClear = useCallback(() => {

        commit(

            clearText()

        );

    }, [

        commit

    ]);

    const handleConfirm = useCallback(() => {

        confirmValue(text);

    }, [

        text,

        confirmValue

    ]);

    /**
 * Handle special keys
 */
    const handleSpecialKey = useCallback((action) => {

        switch (action) {

            case SpecialKey.SHIFT:

                setShift(current => !current);
                return;

            case SpecialKey.CAPS:

                setCapsLock(current => !current);
                return;

            case SpecialKey.BACKSPACE:

                handleBackspace();
                return;

            case SpecialKey.DELETE:

                handleDelete();
                return;

            case SpecialKey.CLEAR:

                handleClear();
                return;

            case SpecialKey.SPACE:

                insertCharacter(" ");
                return;

            case SpecialKey.LEFT: {

                const sel = selection ?? currentSelection();

                const cursor = Math.max(0, sel.start - 1);

                setSelectionState({
                    start: cursor,
                    end: cursor
                });

                if (activeInput?.ref) {

                    setSelection(
                        activeInput.ref,
                        cursor,
                        cursor
                    );

                }

                return;
            }

            case SpecialKey.RIGHT: {

                const sel = selection ?? currentSelection();

                const cursor = Math.min(
                    text.length,
                    sel.end + 1
                );

                setSelectionState({
                    start: cursor,
                    end: cursor
                });

                if (activeInput?.ref) {

                    setSelection(
                        activeInput.ref,
                        cursor,
                        cursor
                    );

                }

                return;
            }

            case SpecialKey.HOME:

                setSelectionState({
                    start: 0,
                    end: 0
                });

                activeInput?.ref?.setSelectionRange(0, 0);

                return;

            case SpecialKey.END: {

                const cursor = text.length;

                setSelectionState({
                    start: cursor,
                    end: cursor
                });

                activeInput?.ref?.setSelectionRange(
                    cursor,
                    cursor
                );

                return;
            }

            case SpecialKey.CONFIRM:

                handleConfirm();
                return;

            case SpecialKey.CANCEL:

                cancelKeyboard();
                return;

            default:

                return;
        }

    }, [

        activeInput,
        cancelKeyboard,
        currentSelection,
        handleBackspace,
        handleClear,
        handleConfirm,
        handleDelete,
        insertCharacter,
        text

    ]);

    /**
     * Handle any key press
     */
    const handleKeyPress = useCallback((item) => {

        if (item.disabled)
            return;

        if (item.type === "special") {

            handleSpecialKey(item.action);

            return;

        }

        insertCharacter(item.value);

    }, [

        handleSpecialKey,
        insertCharacter

    ]);

    /**
     * Key release
     */
    const handleKeyRelease = useCallback(() => {

        // Reserved for click sound,
        // vibration or animations.

    }, []);

    useEffect(() => {

        if (!isOpen)
            return;

        if (!options.enablePhysicalKeyboard)
            return;

        const listener = (event) => {

            if (event.ctrlKey || event.metaKey || event.altKey)
                return;

            switch (event.key) {

                case "Backspace":

                    event.preventDefault();

                    handleBackspace();

                    return;

                case "Delete":

                    event.preventDefault();

                    handleDelete();

                    return;

                case "Enter":

                    event.preventDefault();

                    handleConfirm();

                    return;

                case "Escape":

                    event.preventDefault();

                    cancelKeyboard();

                    return;

                case " ":

                    event.preventDefault();

                    insertCharacter(" ");

                    return;

                case "Shift":

                    return;

                default:

                    break;
            }

            if (event.key.length === 1) {

                event.preventDefault();

                insertCharacter(event.key);

            }

        };

        window.addEventListener(
            "keydown",
            listener
        );

        return () => {

            window.removeEventListener(
                "keydown",
                listener
            );

        };

    }, [

        isOpen,
        options,
        insertCharacter,
        handleBackspace,
        handleDelete,
        handleConfirm,
        cancelKeyboard

    ]);

    const handleOverlayPointerDown = useCallback((event) => {

        if (
            event.target !== event.currentTarget
        ) {
            return;
        }

        cancelKeyboard();

    }, [

        cancelKeyboard

    ]);

    if (!isOpen)
        return null;

    return createPortal(

        <div
            className="vk-overlay"
            onPointerDown={handleOverlayPointerDown}
        >

            <div
                ref={keyboardRef}
                className={`vk-container vk-theme-${options.theme}`}
                onPointerDown={(e) => e.stopPropagation()}
            >

                {/* ==========================
                   Header
                =========================== */}

                <div className="vk-header">

                    <div className="vk-title">

                        {options.label || "Virtual Keyboard"}

                    </div>

                    <button
                        type="button"
                        className="vk-close-button"
                        onClick={cancelKeyboard}
                    >

                        ✕

                    </button>

                </div>

                {/* ==========================
                   Display
                =========================== */}

                <div className="vk-display">
                    <input
                        type="text"
                        className="vk-display-input co-input"
                        value={text}
                        readOnly
                    />
                </div>

                {/* ==========================
                   Keyboard
                =========================== */}

                <div className="vk-body">

                    {

                        layout.map((row, rowIndex) => (

                            <div
                                key={rowIndex}
                                className="vk-row"
                            >

                                {

                                    row.map((item, columnIndex) => (

                                        <KeyboardButton

                                            key={`${rowIndex}-${columnIndex}-${item.label}`}

                                            item={item}

                                            active={

                                                (item.action === SpecialKey.SHIFT && shift)

                                                ||

                                                (item.action === SpecialKey.CAPS && capsLock)

                                            }

                                            onPress={handleKeyPress}

                                            onRelease={handleKeyRelease}

                                        />

                                    ))

                                }

                            </div>

                        ))

                    }

                </div>

                {/* ==========================
                   Footer
                =========================== */}

                <div className="vk-footer">

                    <button

                        type="button"

                        className="vk-footer-button vk-cancel"

                        onClick={cancelKeyboard}

                    >

                        Cancel

                    </button>

                    <button

                        type="button"

                        className="vk-footer-button vk-confirm"

                        onClick={handleConfirm}

                    >

                        Confirm

                    </button>

                </div>

            </div>

        </div>,

        document.body

    );

}