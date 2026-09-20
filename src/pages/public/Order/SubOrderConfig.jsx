import React, { useState, useEffect } from 'react'
import "./SubOrderConfig.css"
import { getMasterDataByTypes } from '../../../services/api/masterDataApi';
import StepHeading from './StepHeading';
import { FcEmptyTrash } from 'react-icons/fc';
export default function SubOrderConfig({ order, setOrder }) {
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

    const handleSelectConfigData = (type, displayValue) => {
        var model = { ...order };
        if (type === 'length') {
            if (model.orderDetails[order.selectedSubOrderIndex]) {
                model.orderDetails[order?.selectedSubOrderIndex].lengthInch = displayValue;
            }
        } else if (type === 'neckline') {
            if (model.orderDetails[order?.selectedSubOrderIndex]) {
                model.orderDetails[order?.selectedSubOrderIndex].neckline = displayValue;
            }
        }
        else if (type === 'sleeve') {
            if (model.orderDetails[order?.selectedSubOrderIndex]) {
                model.orderDetails[order?.selectedSubOrderIndex].sleeve = displayValue;
            }
        }
        setOrder({...model});
    }

    if ((!order?.workTypes && order?.workTypes?.length <= 0) || order?.orderDetails?.length <= 0)
        return <div className="alert-banner">Please select work types to create sub-orders</div>
    return (
        <>
        <div className='config-group'>
            <div className='g-label'>Neckline</div>
            <div className="chip-row">
                {necklineList?.map((item, index) => (
                    <div key={index} className={`opt-chip ${order?.orderDetails[order?.selectedSubOrderIndex]?.neckline === item.displayValue ? 'selected' : ''}`} onClick={() => handleSelectConfigData('neckline', item.displayValue)}>
                       {item.displayValue}
                        <span className="ar">{item?.remark}</span>
                    </div>
                ))}
            </div>
        </div>
          <div className='config-group'>
            <div className='g-label'>Length</div>
            <div className="chip-row">
                {lengthList?.map((item, index) => (
                    <div key={index} className={`opt-chip ${order?.orderDetails[order?.selectedSubOrderIndex]?.lengthInch === item.displayValue ? 'selected' : ''}`} onClick={() => handleSelectConfigData('length', item.displayValue)}>
                       {item.displayValue}
                        <span className="ar">{item?.remark}</span>
                    </div>
                ))}
            </div>
        </div>
          <div className='config-group'>
            <div className='g-label'>Sleeves</div>
            <div className="chip-row">
                {sleeveList?.map((item, index) => (
                    <div key={index} className={`opt-chip ${order?.orderDetails[order?.selectedSubOrderIndex]?.sleeve === item.displayValue ? 'selected' : ''}`} onClick={() => handleSelectConfigData('sleeve', item.displayValue)}>
                       {item.displayValue}
                        <span className="ar">{item?.remark}</span>
                    </div>
                ))}
            </div>
        </div>
        </>
    )
}
