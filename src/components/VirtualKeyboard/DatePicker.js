// DatePicker.jsx

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import { createPortal } from "react-dom";

import {
    FiChevronLeft,
    FiChevronRight,
    FiCalendar,
    FiCheck,
    FiX
} from "react-icons/fi";

import "./VirtualKeyboard.css";

const MONTHS = [

    "January",
    "February",
    "March",
    "April",
    "May",
    "June",

    "July",
    "August",
    "September",
    "October",
    "November",
    "December"

];

const WEEKDAYS = [

    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"

];

export default function DatePicker({

    isOpen,

    value,

    onChange,

    onConfirm,

    onClose,

    disablePastDates = false,

    disableFutureDates = false,

    minDate = null,

    maxDate = null,

    label = "Select Date"

}) {

    const initialDate = useMemo(() => {

        return value
            ? new Date(value)
            : new Date();

    }, [value]);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const [selectedDate, setSelectedDate] = useState(initialDate);

    const [currentMonth, setCurrentMonth] = useState(

        initialDate.getMonth()

    );

    const [currentYear, setCurrentYear] = useState(

        initialDate.getFullYear()

    );

    const firstDay = useMemo(() => {
        return new Date(currentYear, currentMonth, 1).getDay();
    }, [currentYear, currentMonth]);

    const daysInMonth = useMemo(() => {
        return new Date(currentYear, currentMonth + 1, 0).getDate();
    }, [currentYear, currentMonth]);


    useEffect(() => {

        if (!isOpen)
            return;

        const date = value
            ? new Date(value)
            : new Date();

        setSelectedDate(date);

        setCurrentMonth(date.getMonth());

        setCurrentYear(date.getFullYear());

    }, [

        isOpen,
        value

    ]);

    const isDisabled = useCallback((date) => {

        const d = new Date(date);

        d.setHours(0, 0, 0, 0);

        if (

            disablePastDates &&
            d < today

        ) {

            return true;

        }

        if (

            disableFutureDates &&
            d > today

        ) {

            return true;

        }

        if (

            minDate &&
            d < new Date(minDate)

        ) {

            return true;

        }

        if (

            maxDate &&
            d > new Date(maxDate)

        ) {

            return true;

        }

        return false;

    }, [

        disablePastDates,

        disableFutureDates,

        minDate,

        maxDate,

        today

    ]);

    const previousMonth = () => {

        if (currentMonth === 0) {

            setCurrentMonth(11);

            setCurrentYear(

                year => year - 1

            );

        }
        else {

            setCurrentMonth(

                month => month - 1

            );

        }

    };

    const nextMonth = () => {

        if (currentMonth === 11) {

            setCurrentMonth(0);

            setCurrentYear(

                year => year + 1

            );

        }
        else {

            setCurrentMonth(

                month => month + 1

            );

        }

    };

    const selectDate = (day) => {

        const date = new Date(

            currentYear,

            currentMonth,

            day

        );

        if (isDisabled(date))
            return;

        setSelectedDate(date);

        onChange?.(date);

    };

    const confirm = () => {

        onConfirm?.(selectedDate);

        onClose?.();

    };

    const calendar = useMemo(() => {

        if (!isOpen)
            return null;

        const cells = [];

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {

            cells.push(null);

        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {

            cells.push(day);

        }

        // Fill remaining cells (6 x 7 = 42)
        while (cells.length < 42) {

            cells.push(null);

        }

        return cells;

    }, [

        firstDay,
        daysInMonth

    ]);

    const isSelected = (day) => {

        if (!day || !selectedDate)
            return false;

        return (

            selectedDate.getFullYear() === currentYear &&

            selectedDate.getMonth() === currentMonth &&

            selectedDate.getDate() === day

        );

    };

    return createPortal(

        <div

            className="vk-overlay"

            onPointerDown={(e) => {

                if (e.target === e.currentTarget) {

                    onClose?.();

                }

            }}

        >

            <div

                className="vk-container vk-datepicker"

                onPointerDown={(e) => e.stopPropagation()}

            >

                {/* Header */}

                <div className="vk-header">

                    <div className="vk-title">

                        <FiCalendar />

                        <span>{label}</span>

                    </div>

                    <button

                        type="button"

                        className="vk-close-button"

                        onClick={onClose}

                    >

                        <FiX />

                    </button>

                </div>

                {/* Month Navigation */}

                <div className="dp-month-header">

                    <button

                        type="button"

                        className="dp-nav"

                        onClick={previousMonth}

                    >

                        <FiChevronLeft />

                    </button>

                    <div className="dp-month-title">

                        {MONTHS[currentMonth]} {currentYear}

                    </div>

                    <button

                        type="button"

                        className="dp-nav"

                        onClick={nextMonth}

                    >

                        <FiChevronRight />

                    </button>

                </div>

                {/* Week Days */}

                <div className="dp-weekdays">

                    {

                        WEEKDAYS.map(day => (

                            <div

                                key={day}

                                className="dp-weekday"

                            >

                                {day}

                            </div>

                        ))

                    }

                </div>

                {/* Calendar */}

                <div className="dp-grid">

                    {

                        calendar.map((day, index) => {

                            if (!day) {

                                return (

                                    <div

                                        key={index}

                                        className="dp-empty"

                                    />

                                );

                            }

                            const date = new Date(

                                currentYear,

                                currentMonth,

                                day

                            );

                            const disabled = isDisabled(date);

                            const selected = isSelected(day);

                            return (

                                <button

                                    key={day}

                                    type="button"

                                    disabled={disabled}

                                    className={

                                        `dp-day
                                        ${selected ? "dp-selected" : ""}
                                        ${disabled ? "dp-disabled" : ""}`

                                    }

                                    onClick={() =>

                                        selectDate(day)

                                    }

                                >

                                    {day}

                                </button>

                            );

                        })

                    }

                </div>

                {/* Footer */}

                <div className="vk-footer">

                    <button

                        type="button"

                        className="vk-footer-button vk-cancel"

                        onClick={onClose}

                    >

                        Cancel

                    </button>

                    <button

                        type="button"

                        className="vk-footer-button vk-confirm"

                        onClick={confirm}

                    >

                        <FiCheck />

                        <span style={{ marginLeft: 6 }}>

                            Confirm

                        </span>

                    </button>

                </div>

            </div>

        </div>,

        document.body

    );

}