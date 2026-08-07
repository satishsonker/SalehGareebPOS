import React, { useState, useEffect } from 'react'
import "./SubOrderConfig.css"
import { getMasterDataByTypes } from '../../../services/api/masterDataApi';
import StepHeading from './StepHeading';
export default function SubOrderConfig({ order }) {
    const [activeSubOrderIndex, setActiveSubOrderIndex] = useState(null);
    const [activeLengthIndex, setActiveLengthIndex] = useState(0);
    const [activeNecklineIndex, setActiveNecklineIndex] = useState(0);
    const [activeSleeveIndex, setActiveSleeveIndex] = useState(0);
    const [sleeveList, setSleeveList] = useState([]);
    const [necklineList, setNecklineList] = useState([]);
    const [lengthList, setLengthList] = useState([])
    useEffect(() => {
        getMasterDataByTypes(['length_inch', 'neckline', 'sleeve'])
            .then((response) => {
                setLengthList(response?.data?.data?.filter((item) => item.masterDataType?.toLowerCase() === 'length_inch') || []);
                setNecklineList(response?.data?.data?.filter((item) => item.masterDataType?.toLowerCase() === 'neckline') || []);
                setSleeveList(response?.data?.data?.filter((item) => item.masterDataType?.toLowerCase() === 'sleeve') || []);
            }).catch((error) => {
                console.error('Error fetching work types:', error);
            });
    }, []);


    const handleItemClick = (index) => {
        setActiveSubOrderIndex(index);
    };
    if ((!order?.workTypes && order?.workTypes?.length <= 0) || order?.orderDetails?.length <= 0)
        return <div className="alert-banner">Please select work types to create sub-orders</div>
    return (
        <>
            <div className="co-sub-order">
                {order?.orderDetails?.map((item, index) => (
                    <div key={index} className={`co-sub-order-item ${activeSubOrderIndex === index ? 'active' : ''}`} onClick={() => handleItemClick(index)}>
                        <span className="co-sub-order-item__number">{item.orderNumber || `Sub Order - ${index + 1}`}</span>
                        <span className="co-sub-order-item__price">{item?.price || 0} AED</span>
                    </div>
                ))}
            </div>

            <div className="co-sub-order">
                {necklineList?.map((item, index) => (
                    <div key={index} className={`co-sub-order-item ${activeNecklineIndex === index ? 'active' : ''}`} onClick={() => setActiveNecklineIndex(index)}>
                        <span className="co-sub-order-item__number">{item.displayValue}</span>
                        <span className="co-sub-order-item__price">{item?.remark}</span>
                    </div>
                ))}
            </div>

            <div className="co-sub-order">
                {lengthList?.map((item, index) => (
                    <div key={index} className={`co-sub-order-item ${activeLengthIndex === index ? 'active' : ''}`} onClick={() => setActiveLengthIndex(index)}>
                        <span className="co-sub-order-item__number">{item.displayValue}</span>
                        <span className="co-sub-order-item__price">{item?.remark}</span>
                    </div>
                ))}
            </div>
            <StepHeading showStep={false} step="Sleeve" title="Select Sleeve" />
            <div className="co-sub-order">
                {sleeveList?.map((item, index) => (
                    <div key={index} className={`co-sub-order-item ${activeSleeveIndex === index ? 'active' : ''}`} onClick={() => setActiveSleeveIndex(index)}>
                        <span className="co-sub-order-item__number">{item.displayValue}</span>
                        <span className="co-sub-order-item__price">{item?.remark}</span>
                    </div>
                ))}
            </div>
        </>
    )
}
