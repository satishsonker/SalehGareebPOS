import React, { useState } from "react";
import "./WorkTypeSelector.css";
import * as FaIcons from "react-icons/fa";
import Field from "../../../components/Field/Field";

export default function WorkTypeSelector({
    WorkTypeList = [],
    order,
    setOrder,
    activeIndex
}) {

    const [newSubOrderQty, setNewSubOrderQty] = useState(1)
    const [selectedWorkTypes, setSelectedWorkTypes] = useState(
        order?.orderDetails?.[activeIndex]?.workTypes ?? []
    );

    const selectableWorkTypes = WorkTypeList.filter(x => x.code !== 0);
    const allWorkTypeCodes = selectableWorkTypes.map(x => x.code);

    const [isAllSelected, setIsAllSelected] = useState(
        selectedWorkTypes.length === allWorkTypeCodes.length &&
        allWorkTypeCodes.length > 0
    );

    const handleWorkTypeClick = (workTypeCode) => {

        setOrder(prevOrder => {

            const orderDetails = [...prevOrder.orderDetails];

            const currentItem = {
                ...orderDetails[activeIndex]
            };

            let workTypes = [...(currentItem.workTypes || [])];

            if (workTypeCode === 0) {
                // Toggle Select All
                workTypes = isAllSelected ? [] : [...allWorkTypeCodes];
                setIsAllSelected(!isAllSelected);
            } else {
                if (workTypes.includes(workTypeCode)) {
                    workTypes = workTypes.filter(id => id !== workTypeCode);
                } else {
                    workTypes.push(workTypeCode);
                }
            }

            currentItem.workTypes = workTypes;
            setSelectedWorkTypes(workTypes);
            orderDetails[activeIndex] = currentItem;

            return {
                ...prevOrder,
                orderDetails,
                workTypes: workTypes
            };
        });
    };

    const isWorkTypeSelected = (workTypeCode) => {
        return workTypeCode === 0
            ? isAllSelected
            : selectedWorkTypes.includes(workTypeCode);
    };

    const handleAddQuantityChange = () => {
        var model = { ...order };
        for (let i = 0; i < newSubOrderQty; i++) {
           model.orderDetails.push({
                    price: model?.price,
                    priceGrade: model?.priceGrade,
                    workTypes: model?.workTypes || [],
                });
        };
        model.price = 0;
        model.priceGrade = '';
        model.workTypes = [];
        setIsAllSelected(false);
        setSelectedWorkTypes([]);
        setOrder(model);
        setNewSubOrderQty(1);
    };
    if(!order?.price || order?.price <= 0)
        return <div className="alert-banner">Please select a price to create sub-orders</div>
    return (
        <>
            <div className="work-section-grid">
                {WorkTypeList.map(workType => {

                    const IconComponent =
                        FaIcons[workType.icon?.trim()];

                    return (
                        <div
                            key={workType.id}
                            className={`work-section-grid-item ${isWorkTypeSelected(workType.code) ? "active" : ""
                                }`}
                            onClick={() => handleWorkTypeClick(workType.code)}
                        >
                            <span className="work-section-grid-item__code">
                                {workType.code === 0 ? (
                                    IconComponent ? (
                                        <IconComponent className="work-section-grid-item__icon" />
                                    ) : null
                                ) : (
                                    workType.code
                                )}
                            </span>

                            <span
                                className="work-section-grid-item__name"
                                title={workType.name}
                            >
                                {workType.name?.replace("Emboardery", "Emb.")}
                            </span>
                        </div>
                    );
                })}
            </div>
            <Field label={`Qty - create for 1 sub order`}>
            </Field>
            <div className="Justify-between">
                <button className="co-btn co-btn--add" onClick={e => setNewSubOrderQty(Math.max(1, newSubOrderQty - 1))}>-</button>
                <input
                    className="co-input co-input--center w75"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newSubOrderQty}
                    onChange={e => setNewSubOrderQty(parseInt(e.target.value) || 1)}
                />
                <button className="co-btn co-btn--add" onClick={e => setNewSubOrderQty(newSubOrderQty + 1)}>+</button>
            </div>
            <div className="alert-banner">
                Will create {newSubOrderQty} sub-orders @ {order?.price || 0}
            </div>

            <button className="co-btn co-btn--add text-center" onClick={handleAddQuantityChange}>create {newSubOrderQty} sub-orders @ {order?.price || 0}</button>
        </>
    );
}