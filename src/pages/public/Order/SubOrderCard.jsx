import React from 'react'
import './SubOrderCard.css'
export default function SubOrderCard({ orderDetail, index }) {

    const getWorkTypesAndDetails = () => {
        var workTypeModel = { "1": { name: "", data: [] }, "2": { name: "", data: [] }, "3": { name: "", data: [] }, "4": { name: "", data: [] }, "5": { name: "", data: [] }, "6": { name: "", data: [] }, "7": { name: "", data: [] } };
        orderDetail?.workDescription?.map((ele) => {
            workTypeModel[ele?.workTypeCode] = workTypeModel[ele?.workTypeCode] || [];
            workTypeModel[ele?.workTypeCode].name = ele?.workType;
            workTypeModel[ele?.workTypeCode].data.push(ele?.name);
        });
        return workTypeModel;
    }
    return (
        <>
            <div className='sub-order-card'>
                <div className='sub-order-card-item'>
                    <span className='sub-order-card-item__orderno'>{orderDetail?.orderNo}</span>
                    {Object.entries(getWorkTypesAndDetails())?.map((ele, index) => {
                        if (ele[1].name === '')
                            return <></>
                        return <div key={index} className='sub-order-card-item_workTye'>
                            <span className='sub-order-card-item_workTye__index'>{index + 1}</span>
                            <span className='sub-order-card-item_workType__name'>{ele[1].name}</span>
                            <span className='sub-order-card-item_workType__value'>{ele[1].data?.join(" | ")}</span>
                        </div>
                    })}
                </div>
                <div className='sub-order-card-action'></div>
            </div>
        </>
    )
}
