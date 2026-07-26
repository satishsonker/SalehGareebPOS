// KeyboardInput.jsx

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef
} from "react";

import useKeyboard from "./useKeyboard";
import { getSelection } from "./utils";

const KeyboardInput = forwardRef(({
    name,
    value = "",
    onChange,
    onConfirm,
    keyboard,
    layout,
    label = "",
    placeholder = "",
    maxLength = Number.MAX_SAFE_INTEGER,
    disabled = false,
    readOnly = true,
    autoFocus = false,
    className = "",
    style,
    inputMode = "none",
    as = "input",
    onFocus,
    onBlur,
    onClick,
    ...rest
}, ref) => {

    const inputRef = useRef(null);

    const keyboardApi = useKeyboard();

    useImperativeHandle(ref, () => inputRef.current);

    /**
     * Open virtual keyboard
     */
    const openKeyboard = useCallback(() => {

        if (disabled)
            return;

        const input = inputRef.current;

        const selection = getSelection(input);

        keyboardApi.openKeyboard({

            inputRef: input,
            keyboard,
            layout,
            name:name,
            label,
            maxLength,
            value,
            selectionStart: selection.start,
            selectionEnd: selection.end,
            onChange,
            onConfirm
        });
    }, [ disabled, keyboard, layout, label, maxLength, value, onChange, onConfirm, keyboardApi]);

    /**
     * Keep cursor position
     */
    const handleSelect = useCallback(() => {

        const input = inputRef.current;

        if (!input)
            return;

        keyboardApi.updateSelection(

            input.selectionStart,

            input.selectionEnd

        );

    }, [keyboardApi]);

    /**
     * Prevent native keyboard on touch devices
     */
    const handlePointerDown = useCallback((e) => {

        e.preventDefault();

        openKeyboard();

        onClick?.(e);

    }, [

        openKeyboard,

        onClick

    ]);

    /**
     * Optional autofocus
     */
    useEffect(() => {

        if (autoFocus) {

            openKeyboard();

        }

    }, [

        autoFocus,

        openKeyboard

    ]);

    const Component = as === "textarea"
        ? "textarea"
        : "input";
        

    return (

        <Component

            {...rest}

            ref={inputRef}

            value={value}

            disabled={disabled}

            readOnly={readOnly}

            placeholder={placeholder}

            className={className}

            style={style}

            inputMode={inputMode}

            autoComplete="off"

            autoCorrect="off"

            autoCapitalize="off"

            spellCheck={false}

            onPointerDown={handlePointerDown}

            onSelect={handleSelect}

            onFocus={onFocus}

            onBlur={onBlur}

        />

    );

});

KeyboardInput.displayName = "KeyboardInput";

export default KeyboardInput;