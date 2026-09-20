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
        if (workType.code === '0') {
            var totalWorkCodes = workTypeList?.filter(c => c.code !== '0')?.length;
            if (model.orderDetails[index].workTypes?.filter(c => c.code !== '0').length === totalWorkCodes) {
                model.orderDetails[index].workTypes = [];
                setOrder({ ...model });
                return;
            }
            if (!model.orderDetails[index].workTypes || model.orderDetails[index].workTypes?.length < totalWorkCodes) {
                model.orderDetails[index].workTypes = workTypeList?.filter(c => c.code !== '0') || [];
                setOrder({ ...model });
                return;
            }
        }
        var savedWorkTypes = model.orderDetails[index]?.workTypes || [];
        if (savedWorkTypes.filter(c => c.code === workType.code)?.length > 0) {
            savedWorkTypes = savedWorkTypes?.filter(c => c.code !== workType.code);
             model.orderDetails[index].workDescriptions = model.orderDetails[index].workDescriptions?.filter(c => c.workTypeCode !== workType.code.toString());
        } else {
            savedWorkTypes.push(workType);
        }
        model.orderDetails[index].workTypes = savedWorkTypes;
        setOrder({ ...model });
    }

    const isWorkTypeSelected = (workTypeCode, index) => {
        return order?.orderDetails?.[index]?.workTypes?.filter(workType => workType.code === workTypeCode)?.length > 0;
    }

    const getWorkTypeSelectedClass = (workTypeCode, index) => {
       var className= "subOrderDetailList-item__workTypeBadge ";
        if(isWorkTypeSelected(workTypeCode, index))
            className=className+'active ';
        if(order?.orderDetails?.[index]?.workDescriptions?.filter(workType => workType.workTypeCode === workTypeCode.toString())?.length > 0)
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