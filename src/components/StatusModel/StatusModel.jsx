import React, { useEffect } from "react";
import "./StatusModel.css";

import {
    FiCheck,
    FiX,
    FiAlertTriangle,
    FiInfo,
    FiXCircle
} from "react-icons/fi";

export default function StatusModal({
    isOpen,
    onClose,
    type = "info",
    title,
    message,
    buttonText = "OK",
    onConfirm,
    autoClose = false,
    autoCloseDelay = 2500,
    showCloseButton = true
}) {

    useEffect(() => {

        if (!isOpen || !autoClose) return;
        const timer = setTimeout(() => {
            if (onConfirm) {
                onConfirm();
            }
            onClose?.();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
    }, [
        isOpen,
        autoClose,
        autoCloseDelay,
        onClose,
        onConfirm
    ]);


    if (!isOpen) return null;

    const config = {
        success: {
            icon: <FiCheck />,
            defaultTitle: "Success",
            className: "status-modal--success"
        },

        error: {
            icon: <FiXCircle />,
            defaultTitle: "Something went wrong",
            className: "status-modal--error"
        },

        validation: {
            icon: <FiAlertTriangle />,
            defaultTitle: "Validation Required",
            className: "status-modal--validation"
        },

        warning: {
            icon: <FiAlertTriangle />,
            defaultTitle: "Warning",
            className: "status-modal--warning"
        },

        info: {
            icon: <FiInfo />,
            defaultTitle: "Information",
            className: "status-modal--info"
        }

    };


    const current =
        config[type] || config.info;


    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose?.();
    };


    return (

        <div className="status-modal-overlay">
            <div
                className={`status-modal ${current.className}`}
                role="dialog"
                aria-modal="true"
            >
                {/* Close */}
                {showCloseButton && (
                    <button
                        type="button"
                        className="status-modal__close"
                        onClick={onClose}
                    >
                        <FiX />
                    </button>
                )}

                {/* Animated Icon */}
                <div className="status-modal__icon-wrap">
                    <div className="status-modal__pulse" />
                    <div className="status-modal__icon">
                        {current.icon}
                    </div>
                </div>

                {/* Content */}

                <div className="status-modal__content">
                    <h3 className="status-modal__title">
                        {title || current.defaultTitle}
                    </h3>
                    <div className="status-modal__message">
                        {message}
                    </div>
                </div>

                {/* Action */}

                <button
                    type="button"
                    className="status-modal__btn"
                    onClick={handleConfirm}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}