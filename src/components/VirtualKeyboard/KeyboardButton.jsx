// KeyboardButton.jsx

import React, {
    memo,
    useCallback,
    useEffect,
    useRef
} from "react";

import { KeyboardConfig } from "./constants";
import { getKeyboardIcon } from "./KeyboardIcons";

function KeyboardButton({
    item,
    active = false,
    disabled = false,
    onPress,
    onRelease
}) {

    const repeatTimeout = useRef(null);
    const repeatInterval = useRef(null);

    const Icon = getKeyboardIcon(item.icon);

    const clearRepeat = useCallback(() => {

        if (repeatTimeout.current) {
            clearTimeout(repeatTimeout.current);
            repeatTimeout.current = null;
        }

        if (repeatInterval.current) {
            clearInterval(repeatInterval.current);
            repeatInterval.current = null;
        }

    }, []);

    useEffect(() => {

        return () => {

            clearRepeat();

        };

    }, [clearRepeat]);

    const handlePointerDown = useCallback((event) => {

        event.preventDefault();

        if (disabled || item.disabled)
            return;

        onPress?.(item);

        if (!item.repeat)
            return;

        repeatTimeout.current = setTimeout(() => {

            repeatInterval.current = setInterval(() => {

                onPress?.(item);

            }, KeyboardConfig.repeatInterval);

        }, KeyboardConfig.repeatDelay);

    }, [

        disabled,
        item,
        onPress

    ]);

    const handlePointerUp = useCallback(() => {

        clearRepeat();

        onRelease?.(item);

    }, [

        clearRepeat,
        item,
        onRelease

    ]);

    const classNames = [

        "vk-key",

        `vk-${item.width}`,

        `vk-${item.color}`,

        `vk-${item.variant}`,

        active ? "vk-active" : "",

        disabled || item.disabled
            ? "vk-disabled"
            : "",

        item.className

    ]
        .filter(Boolean)
        .join(" ");

    return (

        <button
            type="button"
            className={classNames}
            disabled={disabled || item.disabled}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onContextMenu={(e) => e.preventDefault()}
        >
            {
                Icon
                    ? <Icon size={20} />
                    : item.label
            }
        </button>

    );

}

export default memo(KeyboardButton);