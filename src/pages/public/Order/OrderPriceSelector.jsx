import React, { useEffect, useMemo, useState } from "react";
import "./OrderPriceSelector.css";
import {
    FiEdit2,
    FiSave,
    FiX,
    FiCheck,
    FiMinus,
    FiPlus,
    FiAlertCircle
} from "react-icons/fi";
import NumericKeypad from "../../../components/NumericKeypad/NumericKeypad";
import Modal from "../../../components/Modal/Modal";
import { getCachedOrderPrices } from "../../../services/api/orderPriceApi";
import { commonLogic } from "../../../utils/commonLogic";

const MAX_ORDER_QTY = 30;

const EMPTY_PRICE_MODEL = {
    price: 0,
    grade: "",
    crystalPackets: 0,
    isCustom: false,
    maxPktQty: 0
};

const CUSTOM_PRICE_OPTION = {
    price: "Custom Price",
    isCustom: true
};

const PRESET_SUBORDER_QTY = [1, 2, 3, 5, 10, -1];

const getPriceGradeColor = (grade = "") => {
    const value = String(grade).toUpperCase();

    if (value.includes("AA")) return "grade-purple";
    if (value.includes("B")) return "grade-green";
    if (value.includes("C")) return "grade-gray";

    return "grade-blue";
};

export default function OrderPriceSelector({
    order,
    setOrder,
    openPriceModel,
    setOpenPriceModel
}) {
    const [presetPrices, setPresetPrices] = useState([]);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [keypadMode, setKeypadMode] = useState(null);
    const [newSubOrderQty, setNewSubOrderQty] = useState(1);
    const [selectedPrice, setSelectedPrice] = useState({
        ...EMPTY_PRICE_MODEL
    });
    const [formError, setFormError] = useState({});

    const existingQty = order?.orderDetails?.length ?? 0;
    const maxAvailableQty = Math.max(0, MAX_ORDER_QTY - existingQty);

    useEffect(() => {
        let isMounted = true;

        const fetchOrderPrices = async () => {
            try {
                const response = await getCachedOrderPrices();
                const prices = response?.data?.data ?? [];
                const hasCustomPrice = prices.some(
                    item => item?.isCustom === true
                );

                const result = hasCustomPrice
                    ? prices
                    : [...prices, CUSTOM_PRICE_OPTION];

                if (isMounted) {
                    setPresetPrices(result);
                }
            } catch (error) {
                console.error("Error fetching order prices:", error);
            }
        };

        fetchOrderPrices();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        setNewSubOrderQty(prev => {
            if (maxAvailableQty <= 0) {
                return 0;
            }

            return Math.min(
                Math.max(prev || 1, 1),
                maxAvailableQty
            );
        });
    }, [maxAvailableQty]);

    const calculatedMaxCrystalPackets = useMemo(() => {
        const price = Number(selectedPrice?.price);

        if (!Number.isFinite(price) || price <= 0) {
            return 0;
        }

        return Number(
            commonLogic
                .calculateGradeAndMaxCrystalPacket(price)
                ?.maxCrystalPackets || 0
        );
    }, [selectedPrice?.price]);

    const openPriceKeypad = mode => {
        setKeypadMode(mode);
    };

    const closeKeypad = () => {
        setKeypadMode(null);
    };

    const handleAddQty = () => {
        if (maxAvailableQty <= 0) {
            return;
        }

        setNewSubOrderQty(prev =>
            Math.min((prev || 0) + 1, maxAvailableQty)
        );
    };

    const handleRemoveQty = () => {
        setNewSubOrderQty(prev =>
            Math.max(1, (prev || 1) - 1)
        );
    };

    const subOrderQtyClickHandle = qty => {
        if (maxAvailableQty <= 0) {
            return;
        }

        if (qty > 0) {
            setNewSubOrderQty(prev =>
                Math.min((prev || 0) + qty, maxAvailableQty)
            );
        } else if (qty < 0) {
            setNewSubOrderQty(prev =>
                Math.max(1, (prev || 1) + qty)
            );
        }
    };

    const handleAddCrystalQty = () => {
        if (calculatedMaxCrystalPackets <= 0) {
            return;
        }

        setSelectedPrice(prev => {
            const current = Number(prev.crystalPackets || 0);
            const next = Math.min(
                calculatedMaxCrystalPackets,
                current + 0.5
            );

            return {
                ...prev,
                crystalPackets: Number(next.toFixed(2)),
                maxPktQty: calculatedMaxCrystalPackets
            };
        });
    };

    const handleRemoveCrystalQty = () => {
        setSelectedPrice(prev => {
            const current = Number(prev.crystalPackets || 0);
            const next = Math.max(1, current - 0.5);

            return {
                ...prev,
                crystalPackets: Number(next.toFixed(2))
            };
        });
    };

    const handlePresetPriceSelect = price => {
        const numericPrice = Number(price?.price) || 0;
        const calculation =
            commonLogic.calculateGradeAndMaxCrystalPacket(numericPrice);
        const maxPktQty = Number(
            calculation?.maxCrystalPackets || 0
        );
        const crystalPackets = Math.min(
            Number(price?.crystalPackets) || 0,
            maxPktQty
        );

        setSelectedPrice({
            price: numericPrice,
            grade: price?.grade ?? calculation?.grade ?? "",
            crystalPackets,
            isCustom: false,
            maxPktQty
        });

        setFormError({});
        setShowCustomInput(false);
        closeKeypad();
    };

    const handlePriceOptionClick = price => {
        if (price?.isCustom) {
            setSelectedPrice(prev => ({
                ...prev,
                isCustom: true,
                price: prev.isCustom ? prev.price : 0
            }));

            setShowCustomInput(true);
            setFormError({});
            openPriceKeypad("price");
            return;
        }

        handlePresetPriceSelect(price);
    };

    const handleCustomPriceChange = (event, name) => {
        const value =
            event?.target?.value ??
            event ??
            "";

        setSelectedPrice(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePriceKeypadConfirm = input => {
        const value = Number.parseFloat(input?.value);

        if (!Number.isFinite(value) || value <= 0) {
            return;
        }

        const calculation =
            commonLogic.calculateGradeAndMaxCrystalPacket(value);
        const maxPktQty = Number(
            calculation?.maxCrystalPackets || 0
        );

        setSelectedPrice(prev => ({
            ...prev,
            [input.name]: value,
            isCustom: true,
            ...(input.name === "price"
                ? {
                      grade: calculation?.grade ?? "",
                      maxPktQty,
                      crystalPackets: Math.min(
                          Number(prev.crystalPackets) || 0,
                          maxPktQty
                      )
                  }
                : {})
        }));

        setFormError({});
        closeKeypad();
    };

    const handleCancelCustomPrice = () => {
        setShowCustomInput(false);
        setSelectedPrice({
            ...EMPTY_PRICE_MODEL
        });
        setFormError({});
        closeKeypad();
    };

    const handlePriceSave = () => {
        let errorMessage = "";

        if (Number(selectedPrice.price) <= 0) {
            errorMessage = "Please select or enter a price.";
        } else if (maxAvailableQty <= 0) {
            errorMessage = "Maximum sub order quantity reached.";
        } else if (newSubOrderQty <= 0) {
            errorMessage = "Please add sub order quantity.";
        } else if (newSubOrderQty > maxAvailableQty) {
            errorMessage = `Only ${maxAvailableQty} sub order${
                maxAvailableQty > 1 ? "s" : ""
            } available.`;
        } else if (Number(selectedPrice.crystalPackets) <= 0) {
            errorMessage = "Please add crystal quantity.";
        } else if (
            Number(selectedPrice.crystalPackets) >
            calculatedMaxCrystalPackets
        ) {
            errorMessage = `Maximum crystal quantity is ${calculatedMaxCrystalPackets}.`;
        }

        if (errorMessage) {
            setFormError({
                message: errorMessage
            });
            return;
        }

        setFormError({});

        setOrder(prevOrder => {
            const orderDetails = prevOrder?.orderDetails ?? [];
            const startIndex = orderDetails.length + 1;

            const subOrders = Array.from(
                {
                    length: newSubOrderQty
                },
                (_, index) => ({
                    orderNo: `12345-${startIndex + index}`,
                    subTotalAmount: Number(selectedPrice.price),
                    vatAmount: commonLogic.calculateVAT(Number(selectedPrice.price)).vatAmount,
                    totalAmount: commonLogic.calculateVAT(Number(selectedPrice.price)).amountWithVat,
                    price: Number(selectedPrice.price),
                    crystalPackets: Number(
                        selectedPrice.crystalPackets
                    ),
                    grade: selectedPrice.grade,
                    isCustom: selectedPrice.isCustom,
                    workDescriptions: []
                })
            );

            return {
                ...prevOrder,
                orderDetails: [
                    ...orderDetails,
                    ...subOrders
                ]
            };
        });

        setSelectedPrice({
            ...EMPTY_PRICE_MODEL
        });
        setShowCustomInput(false);
        setNewSubOrderQty(maxAvailableQty > 0 ? 1 : 0);
        closeKeypad();
        setOpenPriceModel(false);
    };

    const isPriceSelected = Number(selectedPrice.price) > 0;

    const isCrystalAtMax =
        calculatedMaxCrystalPackets > 0 &&
        Number(selectedPrice.crystalPackets) >=
            calculatedMaxCrystalPackets;

    const isCrystalAtMin =
        Number(selectedPrice.crystalPackets) <= 1;

    return (
        <>
            <Modal
                isOpen={openPriceModel}
                onClose={() => {
                    closeKeypad();
                    setOpenPriceModel(false);
                }}
                title="Price Selector"
                size="xlarge"
                type="default"
                showCloseButton
                closeOnOverlayClick
                footer={
                    <div className="op-footer">
                        <div />
                        <div className="op-footer__right">
                            <button
                                type="button"
                                className="op-btn op-btn--danger"
                                onClick={() => {
                                    closeKeypad();
                                    setOpenPriceModel(false);
                                }}
                            >
                                <FiX size={15} />
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="op-btn op-btn--save"
                                onClick={handlePriceSave}
                                disabled={maxAvailableQty <= 0}
                            >
                                <FiSave size={15} />
                                Confirm Price
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="op-body">
                    <div className="ops-layout">
                        <section className="ops-panel ops-price-panel">
                            <div className="ops-topbar">
                                <div className="ops-topbar-title">
                                    Select Price
                                </div>
                                <div className="ops-topbar-right">
                                    <div className="ops-summary-inline">
                                        <div className="ops-summary-inline-item">
                                            <span>SUB ORDERS : </span>
                                            <strong>
                                                {newSubOrderQty}
                                            </strong>
                                        </div>
                                        <div className="ops-summary-inline-item">
                                            <span>PRICE : </span>
                                            <strong>
                                                AED{" "}
                                                {Number(
                                                    selectedPrice.price || 0
                                                ).toLocaleString()}
                                            </strong>
                                        </div>
                                        <div className="ops-summary-inline-item">
                                            <span>CRYSTAL : </span>
                                            <strong>
                                                {Number(
                                                    selectedPrice.crystalPackets ||
                                                        0
                                                ).toFixed(2)}
                                            </strong>
                                        </div>
                                    </div>
                                    <div className="ops-available">
                                        <span>Max Qty/Order</span>
                                        <strong>
                                            {maxAvailableQty-newSubOrderQty}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="ops-price-grid">
                                {presetPrices.map(price => {
                                    const numericPrice =
                                        Number(price?.price);

                                    const isNumericPrice =
                                        Number.isFinite(numericPrice);

                                    const isActive = price?.isCustom
                                        ? selectedPrice.isCustom
                                        : !selectedPrice.isCustom &&
                                          Number(
                                              selectedPrice.price
                                          ) === numericPrice;

                                    return (
                                        <button
                                            type="button"
                                            key={
                                                price?.isCustom
                                                    ? "custom"
                                                    : `${price?.price}-${price?.grade}`
                                            }
                                            className={`ops-price-card ${
                                                isActive ? "active" : ""
                                            } ${
                                                price?.isCustom
                                                    ? "custom"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handlePriceOptionClick(
                                                    price
                                                )
                                            }
                                        >
                                            <div className="ops-price-card-top">
                                                <div className="ops-price-value">
                                                    {isNumericPrice
                                                        ? numericPrice.toLocaleString()
                                                        : price?.price}
                                                </div>
                                                {isActive && (
                                                    <div className="ops-price-check">
                                                        <FiCheck />
                                                    </div>
                                                )}
                                            </div>

                                            {isNumericPrice ? (
                                                <div className="ops-price-details">
                                                    <span
                                                        className={`ops-grade ${getPriceGradeColor(
                                                            price?.grade
                                                        )}`}
                                                    >
                                                        {price?.grade || "—"}
                                                    </span>
                                                    <span className="ops-price-pkt">
                                                        {price?.crystalPackets ??
                                                            0}{" "}
                                                        pkt
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="ops-custom-label">
                                                    <FiEdit2 />
                                                    Custom Price
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {showCustomInput && (
                                <div className="ops-custom-panel">
                                    <div className="ops-custom-panel-header">
                                        <div>
                                            <div className="ops-custom-panel-title">
                                                Custom Price
                                            </div>
                                            <div className="ops-custom-panel-subtitle">
                                                Enter your required price
                                            </div>
                                        </div>
                                        <FiEdit2 />
                                    </div>

                                    <div className="ops-custom-panel-row">
                                        <button
                                            type="button"
                                            className={`ops-custom-input ${
                                                keypadMode === "price"
                                                    ? "focused"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                openPriceKeypad("price")
                                            }
                                        >
                                            <span>AED</span>
                                            <strong>
                                                {Number(
                                                    selectedPrice.price
                                                ) > 0
                                                    ? Number(
                                                          selectedPrice.price
                                                      ).toLocaleString()
                                                    : "Enter price"}
                                            </strong>
                                        </button>

                                        <button
                                            type="button"
                                            className="ops-custom-cancel"
                                            onClick={
                                                handleCancelCustomPrice
                                            }
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {formError?.message && (
                                <div className="ops-error">
                                    <FiAlertCircle />
                                    <span>{formError.message}</span>
                                </div>
                            )}
                        </section>

                        <section className="ops-panel ops-config-panel">
                            <div
                                className={`ops-selected ${
                                    isPriceSelected ? "active" : ""
                                }`}
                            >
                                <div className="ops-selected-left">
                                    <div className="ops-selected-label">
                                        <FiCheck />
                                        SELECTED PRICE
                                    </div>
                                    <div
                                        className={`ops-selected-price ${
                                            selectedPrice.isCustom
                                                ? "custom"
                                                : ""
                                        }`}
                                    >
                                        {isPriceSelected
                                            ? `AED ${Number(
                                                  selectedPrice.price
                                              ).toLocaleString()}`
                                            : "Select a price"}
                                    </div>
                                </div>
                                <div className="ops-selected-right">
                                    {isPriceSelected
                                        ? selectedPrice.grade || "—"
                                        : "—"}
                                </div>
                            </div>

                            <div className="ops-control">
                                <div className="ops-control-header">
                                    <span className="ops-control-label">
                                        Sub Order Quantity
                                    </span>
                                    <span className="ops-control-value">
                                        {newSubOrderQty}
                                    </span>
                                </div>

                                <div className="ops-counter">
                                    <button
                                        type="button"
                                        className="ops-counter-btn ops-counter-btn-red"
                                        onClick={handleRemoveQty}
                                        disabled={newSubOrderQty <= 1}
                                    >
                                        <FiMinus />
                                    </button>

                                    <div className="ops-counter-value">
                                        {newSubOrderQty}
                                    </div>

                                    <button
                                        type="button"
                                        className="ops-counter-btn ops-counter-btn-green"
                                        onClick={handleAddQty}
                                        disabled={
                                            newSubOrderQty >=
                                                maxAvailableQty ||
                                            maxAvailableQty <= 0
                                        }
                                    >
                                        <FiPlus />
                                    </button>
                                </div>

                                <div className="ops-quick-actions">
                                    {PRESET_SUBORDER_QTY.map(
                                        (qty, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className={`ops-quick-btn ops-counter-btn-${qty > 0 ? "green" : "red"}`}
                                                onClick={() =>
                                                    subOrderQtyClickHandle(
                                                        qty
                                                    )
                                                }
                                            >
                                                {qty > 0
                                                    ? `+${qty}`
                                                    : "−1"}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="ops-control">
                                <div className="ops-control-header">
                                    <span className="ops-control-label">
                                        Crystal Packets
                                    </span>
                                    <span className="ops-control-value">
                                        Max{" "}
                                        {calculatedMaxCrystalPackets}
                                    </span>
                                </div>

                                <div className="ops-counter">
                                    <button
                                        type="button"
                                        className="ops-counter-btn ops-counter-btn-red"
                                        onClick={
                                            handleRemoveCrystalQty
                                        }
                                        disabled={isCrystalAtMin}
                                    >
                                        <FiMinus />
                                    </button>

                                    <div className="ops-counter-value">
                                        {Number(
                                            selectedPrice.crystalPackets ||
                                                0
                                        ).toFixed(2)}
                                    </div>

                                    <button
                                        type="button"
                                        className="ops-counter-btn ops-counter-btn-green"
                                        onClick={handleAddCrystalQty}
                                        disabled={
                                            isCrystalAtMax ||
                                            calculatedMaxCrystalPackets <=
                                                0
                                        }
                                    >
                                        <FiPlus />
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </Modal>

            <NumericKeypad
                isOpen={keypadMode === "price"}
                name="price"
                value={selectedPrice.price?.toString() || ""}
                onChange={e =>
                    handleCustomPriceChange(e, "price")
                }
                onConfirm={handlePriceKeypadConfirm}
                onClose={closeKeypad}
                label="Custom Price (AED)"
            />

            <NumericKeypad
                isOpen={keypadMode === "crystalPackets"}
                name="crystalPackets"
                value={
                    selectedPrice.crystalPackets?.toString() || ""
                }
                onChange={e =>
                    handleCustomPriceChange(
                        e,
                        "crystalPackets"
                    )
                }
                onConfirm={handlePriceKeypadConfirm}
                onClose={closeKeypad}
                label="Crystal Packets"
            />
        </>
    );
}