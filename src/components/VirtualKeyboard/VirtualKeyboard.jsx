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

    useEffect(() => {

        if (!isOpen)
            return;

        setText(activeInput?.value ?? "");

    }, [isOpen, activeInput]);

    useEffect(() => {

        if (!isOpen)
            return;

        if (!activeInput?.ref)
            return;

        setSelectionState({

            start: activeInput.selectionStart,

            end: activeInput.selectionEnd

        });

    }, [isOpen, activeInput]);

    const layout = useMemo(() => {

        return getLayout(

            options.keyboard ??

            KeyboardType.ALPHABET,

            options.layout

        );

    }, [options]);

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

    }, [activeInput, updateValue]);

    const currentSelection = useCallback(() => {

        if (!activeInput?.ref)
            return selection;

        const sel = getSelection(activeInput.ref);

        setSelectionState(sel);

        return sel;

    }, [activeInput, selection]);

    const insertCharacter = useCallback((character) => {

        const sel = selection ?? currentSelection();

        let value = character;

        if (options.keyboard !== KeyboardType.NUMERIC) {
            // apply case rules
            value = applyCase(value, shift, capsLock);
        }

        const before = text.slice(0, sel.start);

        const after  = text.slice(sel.end);

        const newText = before + value + after;

        const cursor = before.length + value.length;

        commit({ value: newText, cursor });

    }, [selection, currentSelection, text, options, shift, capsLock, commit]);

    return null; // minimal stub restored to allow build; full implementation archived

}
