// useKeyboard.js

import { useKeyboardContext } from "./KeyboardContext";

/**
 * Hook for accessing Virtual Keyboard.
 */
export default function useKeyboard() {

    return useKeyboardContext();

}