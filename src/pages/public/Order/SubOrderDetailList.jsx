import React, { useState, useEffect } from "react";
import "./SubOrderDetailList.css";
import { FiEdit2, FiLayers, FiBox, FiTrash2, FiSettings } from "react-icons/fi";
import { commonLogic } from "../../../utils/commonLogic";

export default function SubOrderDetailList({ order, setOrder, setWorkTypeSelectorModalOpen, workTypeList }) {

    const [allWorkTypeCodes, setAllWorkTypeCodes] = useState([]);
    const handleDelete = (e, subOrderIndex) => {
        e.stopPropagation();
        var model = order;
        model.orderDetails.splice(subOrderIndex, 1);
        model.orderDetails.map((subOrder, index) => {
            subOrder.orderNo = `${order?.orderNo}-${index + 1}`;
        });
        setOrder({ ...model });
    };
    const handleconfigButton = (e, subOrderIndex) => {
        var model = order;
         model.selectedSubOrderIndex = subOrderIndex;
        setOrder({ ...model });
        setWorkTypeSelectorModalOpen(true);
    };

    const handleSubOrderClick = (index) => {

        var model = order;
        model.selectedSubOrderIndex = index;
        setOrder({ ...model });
    };

    const handleWorkTypeSelection = (e, workType, index) => {
        e.stopPropagation();
        var model = order;
        model.selectedSubOrderIndex = index;

        const workTypeCode = workType?.code;
        const normalizedWorkTypes = Array.isArray(model.orderDetails[index]?.workTypes)
            ? model.orderDetails[index].workTypes.map(item => ({
                ...item,
                workDescriptions: Array.isArray(item?.workDescriptions) ? [...item.workDescriptions] : []
            }))
            : [];

        if (workTypeCode === '0') {
            const allWorkTypes = (workTypeList || []).filter(c => c.code !== '0').map(item => ({
                ...item,
                workTypeId: item?.id ?? item?.workTypeId,
                workDescriptions: []
            }));

            const hasAllSelected = normalizedWorkTypes.filter(c => c.code !== '0').length === allWorkTypes.length;
            model.orderDetails[index].workTypes = hasAllSelected ? [] : allWorkTypes;
            setOrder({ ...model });
            return;
        }

        const existingIndex = normalizedWorkTypes.findIndex(item => String(item?.code ?? item?.workTypeCode) === String(workTypeCode));

        if (existingIndex >= 0) {
            normalizedWorkTypes.splice(existingIndex, 1);
        } else {
            normalizedWorkTypes.push({
                ...workType,
                workTypeId: workType?.id ?? workType?.workTypeId,
                workDescriptions: []
            });
        }

        model.orderDetails[index].workTypes = normalizedWorkTypes;
        setOrder({ ...model });
    }

    const isWorkTypeSelected = (workTypeCode, index) => {
        return order?.orderDetails?.[index]?.workTypes?.some(workType => String(workType.code ?? workType.workTypeCode) === String(workTypeCode));
    }

    const getWorkTypeSelectedClass = (workTypeCode, index) => {
       var className= "subOrderDetailList-item__workTypeBadge ";
        if(isWorkTypeSelected(workTypeCode, index))
            className=className+'active ';

        const selectedWorkType = order?.orderDetails?.[index]?.workTypes?.find(workType => String(workType.code ?? workType.workTypeCode) === String(workTypeCode));
        if((selectedWorkType?.workDescriptions ?? []).length > 0)
            className=className+'active_selected';
        return className;
    }

    return (
        <div className="subOrderDetailList">

            {order?.orderDetails?.map((subOrder, index) => (

                <div
                    className="subOrderDetailList-item"
                    key={subOrder.id || index}
                >
                    <div className="subOrderDetailList-item__number">
                        {index + 1}
                    </div>
                    <div className="subOrderDetailList-item__content" onClick={() => handleSubOrderClick(index)}>
                        <div className="subOrderDetailList-item__top">
                            <div className="subOrderDetailList-item__orderInfo">
                                <span className="subOrderDetailList-item__orderLabel">
                                    ORDER
                                </span>
                                <span className="subOrderDetailList-item__orderNo">
                                    {subOrder.orderNo}
                                </span>
                            </div>

                            <div className="subOrderDetailList-item__price">
                                <span className="currency">AED</span>
                                <span>{subOrder.price}</span>
                            </div>
                        </div>

                        <div className="subOrderDetailList-item__workTypes">
                            {workTypeList?.map((workType, innerIndex) => {
                                const code = typeof workType === "object" ? workType.code : workType;
                                return (
                                    <span
                                        onClick={(e) => handleWorkTypeSelection(e, workType, index)}
                                        className={getWorkTypeSelectedClass(code, index)}
                                        key={`${code}-${innerIndex}`}
                                    >
                                        {commonLogic.workTypeCodesAbbr(code)}
                                    </span>
                                );
                            })}
                        </div>
                        <div className="subOrderDetailList-item__meta">
                            {subOrder.crystalPackets && (
                                <div className="metaItem">
                                    <FiBox />
                                    <span className="metaLabel">
                                        Crystal
                                    </span>
                                    <strong>
                                        {subOrder.crystalPackets}
                                    </strong>
                                </div>
                            )}

                            {subOrder.grade && (
                                <div className="metaItem">
                                    <FiLayers />
                                    <span className="metaLabel">
                                        Grade
                                    </span>
                                    <strong>
                                        {subOrder.grade}
                                    </strong>
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        className="subOrderDetailList-item__configBtn"
                        onClick={(e) => handleconfigButton(e, index)}
                        title="Configure Work Descriptions"
                    >
                        <FiSettings />
                    </button>
                    <button
                        type="button"
                        className="subOrderDetailList-item__editBtn"
                        onClick={(e) => handleDelete(e, index)}
                        title="Delete Sub-Order"
                    >
                        <FiTrash2 />
                    </button>
                </div>
            ))}
        </div>
    );
}