// KeyboardProvider.jsx

import React, {
    useCallback,
    useMemo,
    useRef,
    useState
} from "react";

import KeyboardContext from "./KeyboardContext";
import { DefaultOptions } from "./constants";

export default function KeyboardProvider({ children }) {

    const [isOpen, setIsOpen] = useState(false);

    const [options, setOptions] = useState(DefaultOptions);

    const [activeInput, setActiveInput] = useState(null);

    const callbacksRef = useRef({
        onChange: null,
        onConfirm: null,
        onCancel: null
    });

    /**
     * Opens keyboard
     */
    const openKeyboard = useCallback((config) => {

        setActiveInput({
            ref: config.inputRef,
            value: config.value ?? "",
            selectionStart: config.selectionStart ?? 0,
            selectionEnd: config.selectionEnd ?? 0,
            name: config.name ?? ""
        });

        setOptions({

            ...DefaultOptions,

            ...config

        });

        callbacksRef.current = {

            onChange: config.onChange ?? null,

            onConfirm: config.onConfirm ?? null,

            onCancel: config.onCancel ?? null

        };

        setIsOpen(true);

    }, []);

    /**
     * Close keyboard
     */
    const closeKeyboard = useCallback(() => {

        setIsOpen(false);

        callbacksRef.current.onCancel?.();

    }, []);

    /**
     * Update value
     */
    const updateValue = useCallback((value) => {

        callbacksRef.current.onChange?.(value);

    }, []);

    /**
     * Confirm value
     */
    const confirmValue = useCallback((value) => {

        callbacksRef.current.onConfirm?.(value);

        if (options.closeOnConfirm) {

            setIsOpen(false);

        }

    }, [options]);

    /**
     * Cancel
     */
    const cancelKeyboard = useCallback(() => {

        callbacksRef.current.onCancel?.();

        if (options.closeOnCancel) {

            setIsOpen(false);

        }

    }, [options]);

    /**
     * Refresh cursor position
     */
    const updateSelection = useCallback((start, end = start) => {

        setActiveInput(current => {

            if (!current)
                return current;

            return {

                ...current,

                selectionStart: start,

                selectionEnd: end

            };

        });

    }, []);

    /**
     * Restore focus
     */
    const restoreFocus = useCallback(() => {

        const input = activeInput?.ref;

        if (!input)
            return;

        requestAnimationFrame(() => {

            input.focus();

            input.setSelectionRange(

                activeInput.selectionStart,

                activeInput.selectionEnd

            );

        });

    }, [activeInput]);

    /**
     * Reset
     */
    const reset = useCallback(() => {

        setIsOpen(false);

        setActiveInput(null);

        setOptions(DefaultOptions);

        callbacksRef.current = {

            onChange: null,

            onConfirm: null,

            onCancel: null

        };

    }, []);

    const context = useMemo(() => ({

        isOpen,

        options,

        activeInput,

        openKeyboard,

        closeKeyboard,

        cancelKeyboard,

        updateValue,

        confirmValue,

        updateSelection,

        restoreFocus,

        reset

    }), [

        isOpen,

        options,

        activeInput,

        openKeyboard,

        closeKeyboard,

        cancelKeyboard,

        updateValue,

        confirmValue,

        updateSelection,

        restoreFocus,

        reset

    ]);

    return (

        <KeyboardContext.Provider value={context}>

            {children}

        </KeyboardContext.Provider>

    );

}