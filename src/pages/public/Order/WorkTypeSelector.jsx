import React, { useState, useEffect } from "react";
import "./WorkTypeSelector.css";
import { FiCheck, FiX } from "react-icons/fi";
import { getWorkTypeDescriptions } from "../../../services/api/workTypeApi";
import Modal from "../../../components/Modal/Modal";
import { commonLogic } from "../../../utils/commonLogic";
import SubOrderDetailSkeleton from "./SubOrderDetailSkeleton";

export default function WorkTypeSelector({ options }) {
    const [workDescriptionList, setWorkDescriptionList] = useState([]);
    const [currentClickedWorkType, setCurrentClickedWorkType] = useState(0);
    const [filteredWorkDescByWorkCode, setFilteredWorkDescByWorkCode] = useState([]);
    const [error, setError] = useState({ message: "" });

    const selectedSubOrder = options.order?.orderDetails?.[options.order?.selectedSubOrderIndex];

    const getActiveClassForDesc = ele =>
        selectedSubOrder?.workDescriptions?.some(x => x.id === ele.id) ? "active" : "";

    useEffect(() => {
        getWorkTypeDescriptions()
            .then(res => setWorkDescriptionList(res.data))
            .catch(() => console.log("Unable to fetch work type description list from api or cache"));
    }, []);

    useEffect(() => {
        setFilteredWorkDescByWorkCode(
            workDescriptionList?.filter(
                x => x.workTypeCode?.toString() === currentClickedWorkType?.toString()
            ) || []
        );
    }, [currentClickedWorkType, workDescriptionList]);

    const handleWorkTypeClick = workType => {
        setCurrentClickedWorkType(workType?.code?.toString());
    };

    const isWorkTypeSelected = workTypeCode => {
        if (workTypeCode === 0 || workTypeCode?.toString() === "0") return true;
        return selectedSubOrder?.workTypes?.some(
            workType => workType?.code?.toString() === workTypeCode?.toString()
        );
    };

    const handleConfirm = () => {
        options.setWorkTypeSelectorModalOpen(false);
    };

    const handleWorkDescSelection = desc => {
        const model = { ...options.order };
        const detailIndex = model?.selectedSubOrderIndex;
        let descriptions = [...(model?.orderDetails?.[detailIndex]?.workDescriptions || [])];

        if (descriptions.some(x => x.id === desc.id)) {
            descriptions = descriptions.filter(x => x.id !== desc.id);
        } else {
            descriptions.push(desc);
        }

        if (descriptions.length > 0) setError({ message: "" });
        model.orderDetails[detailIndex].workDescriptions = descriptions;
        options.setOrder(model);
    };

    const NO_DATA_MESSAGE = message => (
        <>
            <div className="col-title">Work Type Steps</div>
            <div className="work-desc-message">{message}</div>
        </>
    );

    if (options.order?.orderDetails?.length <= 0) {
        return <SubOrderDetailSkeleton count={3} />;
    }

    if (
        options.order?.orderDetails?.length > 0 &&
        (options.order?.selectedSubOrderIndex === undefined ||
            options.order?.selectedSubOrderIndex < 0)
    ) {
        return NO_DATA_MESSAGE("Please select any sub order");
    }

    return (
        <Modal
            isOpen={options.workTypeSelectorModalOpen}
            onClose={() => options.setWorkTypeSelectorModalOpen(false)}
            title={`Work Type - ${selectedSubOrder?.orderNo ?? "New Order"}`}
            size="xlarge"
            type="default"
            showCloseButton
            closeOnOverlayClick
            footer={
                <div className="review-order-footer">
                    <div className="op-footer__right">
                        <button
                            type="button"
                            className="op-btn op-btn--danger"
                            onClick={() => options.setWorkTypeSelectorModalOpen(false)}
                        >
                            <FiX size={15} />
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="op-btn op-btn--save"
                            onClick={handleConfirm}
                        >
                            <FiCheck size={15} />
                            Confirm
                        </button>
                    </div>
                </div>
            }
        >
            <div className="worktype-selector">
                <section className="wt-panel wt-work-panel">
                    <div className="wt-panel-header">
                        <div>
                            <div className="wt-panel-title">WORK TYPES</div>
                            <div className="wt-panel-subtitle">Select work type</div>
                        </div>
                        <div className="wt-count">
                            {selectedSubOrder?.workTypes?.length || 0} SELECTED
                        </div>
                    </div>
                    <div className="wt-work-list">
                        {options.workTypeList?.filter(x => x.code !== "0")?.map(workType => {
                            const selected = isWorkTypeSelected(workType.code);
                            const current =
                                currentClickedWorkType?.toString() === workType.code?.toString();

                            return (
                                <button
                                    type="button"
                                    key={workType.id}
                                    className={`wt-work-card ${selected ? "selected" : ""} ${current ? "current" : ""}`}
                                    onClick={() => handleWorkTypeClick(workType)}
                                >
                                    <div className="wt-work-code">
                                        {selected ? <FiCheck size={13} /> : workType.code}
                                    </div>
                                    <div className="wt-work-info">
                                        <div className="wt-work-short">
                                            {commonLogic.workTypeCodesAbbr(workType.code)}
                                        </div>
                                        <div className="wt-work-name">
                                            {workType.code === "0"
                                                ? "Select all"
                                                : workType.name?.replace("Emboardery", "Emb.")}
                                        </div>
                                    </div>
                                    {selected && (
                                        <div className="wt-work-check">
                                            <FiCheck size={14} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <div className="wt-bottom-layout">
                    <section className="wt-panel wt-description-panel">
                        <div className="wt-panel-header">
                            <div>
                                <div className="wt-panel-title">SELECT WORK DESCRIPTIONS</div>
                                <div className="wt-panel-subtitle">
                                    {currentClickedWorkType
                                        ? commonLogic.workTypeCodesAbbr(currentClickedWorkType)
                                        : "Click a work type first"}
                                </div>
                            </div>
                            <div className="wt-count">
                                {selectedSubOrder?.workDescriptions?.length || 0} SELECTED
                            </div>
                        </div>
                        <div className="wt-description-list">
                            {isWorkTypeSelected(currentClickedWorkType) ? (
                                filteredWorkDescByWorkCode?.length > 0 ? (
                                    filteredWorkDescByWorkCode.map((ele, index) => (
                                        <button
                                            type="button"
                                            key={ele?.id ?? index}
                                            onClick={() => handleWorkDescSelection(ele)}
                                            className={`wt-description-item ${getActiveClassForDesc(ele)}`}
                                        >
                                            <span>{ele?.name}</span>
                                            {getActiveClassForDesc(ele) && <FiCheck size={13} />}
                                        </button>
                                    ))
                                ) : (
                                    <div className="wt-empty">No descriptions available</div>
                                )
                            ) : (
                                <div className="wt-empty">
                                    Click on a work type to view descriptions
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="wt-panel wt-options-panel">
                        <div className="wt-current-type">
                            <span>CURRENT WORK TYPE</span>
                            <strong>
                                {commonLogic.workTypeCodesAbbr(currentClickedWorkType) || "Select"}
                            </strong>
                        </div>

                        <div className="wt-option-section">
                            <div className="wt-option-title">NeckLine</div>
                            <div className="wt-option-list">
                                {options?.neckLineList?.map(mode => (
                                    <button
                                        key={mode?.code}
                                        type="button"
                                        className={`wt-option-btn ${selectedSubOrder?.neckline === mode?.code ? "active" : ""}`}
                                        onClick={() => {
                                            const orderDetails = [...options.order.orderDetails];
                                            orderDetails[options.order.selectedSubOrderIndex] = {
                                                ...orderDetails[options.order.selectedSubOrderIndex],
                                                neckline: mode?.code
                                            };

                                            options.setOrder({
                                                ...options.order,
                                                orderDetails
                                            });
                                        }
                                        }
                                    >
                                        {mode?.displayValue}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="wt-option-section">
                            <div className="wt-option-title">Length</div>
                            <div className="wt-option-list">
                                {options?.lengthList?.map(mode => (
                                    <button
                                        key={mode?.code}
                                        type="button"
                                        className={`wt-option-btn ${selectedSubOrder?.length === mode?.code ? "active" : ""}`}
                                        onClick={() => {
                                            const orderDetails = [...options.order.orderDetails];
                                            orderDetails[options.order.selectedSubOrderIndex] = {
                                                ...orderDetails[options.order.selectedSubOrderIndex],
                                                length: mode?.code
                                            };

                                            options.setOrder({
                                                ...options.order,
                                                orderDetails
                                            });
                                        }
                                        }
                                    >
                                        {mode?.displayValue}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="wt-option-section">
                            <div className="wt-option-title">Sleeves</div>
                            <div className="wt-option-list">
                                {options?.sleeveList?.map(mode => (
                                    <button
                                        key={mode?.code}
                                        type="button"
                                        className={`wt-option-btn ${selectedSubOrder?.sleeves === mode?.code ? "active" : ""}`}
                                        onClick={() => {
                                            const orderDetails = [...options.order.orderDetails];
                                            orderDetails[options.order.selectedSubOrderIndex] = {
                                                ...orderDetails[options.order.selectedSubOrderIndex],
                                                sleeves: mode?.code
                                            };

                                            options.setOrder({
                                                ...options.order,
                                                orderDetails
                                            });
                                        }
                                        }
                                    >
                                        {mode?.displayValue}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </Modal>
    );
}