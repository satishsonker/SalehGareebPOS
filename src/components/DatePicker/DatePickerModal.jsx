import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiX
} from "react-icons/fi";
import "./DatePickerModal.css";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function pad(num) {
  return String(num).padStart(2, "0");
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function sameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCalendar(year, month) {
  const first = new Date(year, month, 1);

  const startDay = first.getDay();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      current: false
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      date: new Date(year, month, i),
      current: true
    });
  }

  while (cells.length < 42) {
    const day = cells.length - (startDay + daysInMonth) + 1;

    cells.push({
      date: new Date(year, month + 1, day),
      current: false
    });
  }

  return cells;
}

export default function DatePickerModal({
  isOpen,
  value = "",
  onChange,
  onConfirm,
  onClose,
  label = "Select Date",
  disablePastDates = false,
  minDate,
  maxDate
}) {
  const today = new Date();

  const initial = value ? new Date(value) : today;

  const [selectedDate, setSelectedDate] = useState(initial);

  const [month, setMonth] = useState(initial.getMonth());

  const [year, setYear] = useState(initial.getFullYear());

  useEffect(() => {
    if (!isOpen) return;

    const d = value ? new Date(value) : new Date();

    setSelectedDate(d);
    setMonth(d.getMonth());
    setYear(d.getFullYear());
  }, [isOpen, value]);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "Enter") {
        confirm();
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  });

  const cells = useMemo(() => buildCalendar(year, month), [year, month]);

  function previousMonth() {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  }

  function disabled(date) {
    const compare = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (disablePastDates) {
      const t = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      if (compare < t) return true;
    }

    if (minDate) {
      if (compare < new Date(minDate)) return true;
    }

    if (maxDate) {
      if (compare > new Date(maxDate)) return true;
    }

    return false;
  }

  function confirm() {
    const val = formatDate(selectedDate);

    onChange?.(val);
    onConfirm?.(val);
    onClose?.();
  }

  if (!isOpen) return null;

  return createPortal(
    <div
      className="dpm-overlay"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dpm-modal">

        <div className="dpm-header">
          <span>{label}</span>

          <button
            className="dpm-close"
            onPointerDown={onClose}
          >
            <FiX />
          </button>
        </div>

        <div className="dpm-month">

          <button
            className="dpm-nav"
            onPointerDown={previousMonth}
          >
            <FiChevronLeft />
          </button>

          <div className="dpm-title">
            {MONTHS[month]} {year}
          </div>

          <button
            className="dpm-nav"
            onPointerDown={nextMonth}
          >
            <FiChevronRight />
          </button>

        </div>

        <div className="dpm-week">

          {WEEK_DAYS.map((d) => (
            <div
              key={d}
              className="dpm-weekday"
            >
              {d}
            </div>
          ))}

        </div>

        <div className="dpm-grid">

          {cells.map(({ date, current }, i) => {

            const isSelected = sameDate(date, selectedDate);

            const isDisabled = disabled(date);

            return (
              <button
                key={i}
                disabled={isDisabled}
                onPointerDown={() => setSelectedDate(date)}
                className={[
                  "dpm-day",
                  current ? "" : "other",
                  isSelected ? "selected" : "",
                  isDisabled ? "disabled" : ""
                ].join(" ")}
              >
                {date.getDate()}
              </button>
            );
          })}

        </div>

        <div className="dpm-footer">

          <div className="dpm-selected">
            {formatDate(selectedDate)}
          </div>

          <button
            className="dpm-confirm"
            onPointerDown={confirm}
          >
            <FiCheck />
            Confirm
          </button>

        </div>

      </div>
    </div>,
    document.body
  );
}