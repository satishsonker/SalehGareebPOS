// KeyboardContext.jsx

import { createContext, useContext } from "react";

/**
 * Keyboard Context
 */
export const KeyboardContext = createContext(null);

/**
 * Hook to access keyboard context.
 */
export function useKeyboardContext() {

    const context = useContext(KeyboardContext);

    if (context === null) {

        throw new Error(
            "useKeyboardContext must be used within a KeyboardProvider."
        );

    }

    return context;

}

export default KeyboardContext;