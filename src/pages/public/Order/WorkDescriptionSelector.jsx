import React, { useState, useEffect } from 'react'
import "./WorkDescriptionSelector.css";
import { getWorkTypeDescriptions } from '../../../services/api/workTypeApi';
import Modal from '../../../components/Modal/Modal';
import { FiCheck, FiSave, FiX } from 'react-icons/fi';
export default function WorkDescriptionSelector({ order, setOrder }) {
    const [workDescriptionList, setWorkDescriptionList] = useState([]);
    const [workTypeList, setWorkTypeList] = useState([]);
    const [workDescSelectorOpen, setWorkDescSelectorOpen] = useState(false);
    const [selectedWorkTypeCode, setSelectedWorkTypeCode] = useState(0);
    const [selectedWorkDescriptions, setSelectedWorkDescriptions] = useState([])
    const [error, setError] = useState({ message: '' });
   
    useEffect(() => {
        getWorkTypeDescriptions()
            .then(res => {
                setWorkDescriptionList(res.data);

                setWorkTypeList(
                    [...new Map(
                        res?.data?.map(x => [
                            x.workTypeId,
                            {
                                name: x.workType,
                                code: x.workTypeCode
                            }
                        ])
                    ).values()]
                );
            }).catch(err => {
                console.log('enable to fetch work type description list from api or cache')
            });
    }, [])

    useEffect(() => {
        var data = order?.orderDetails[order.selectedSubOrderIndex]?.workDescriptions?.filter(x => x.code === selectedWorkTypeCode);
        if (data) {
            setSelectedWorkDescriptions([...data]);
        }
    }, [order?.selectedSubOrderIndex])


    const isWorkTypeExistInSuborder = (ele) => {
        if (order?.selectedSubOrderIndex === undefined)
            return;
        var index = order?.orderDetails[order?.selectedSubOrderIndex]?.workTypes?.indexOf(parseInt(ele?.code));
        return index > -1 ? true : false;
    }

    const handleWorkDescSave = () => {
        if (selectedWorkDescriptions?.length < 1) {
            setError({ message: 'Please select at least one description' });
            return;
        }

        var model = order;
        if (model?.orderDetails[order?.selectedSubOrderIndex] !== undefined) {
            model.orderDetails[order?.selectedSubOrderIndex].workDescriptions = selectedWorkDescriptions;
            setOrder({ ...model });
            setWorkDescSelectorOpen(false);
            setSelectedWorkDescriptions([]);
            setSelectedWorkTypeCode(0);
        }
    }
    const handleWorkTypeSelection = (workTypeCode) => {
        setSelectedWorkDescriptions(order.orderDetails[order?.selectedSubOrderIndex].workDescriptions ?? []);
        setWorkDescSelectorOpen(true);
        setSelectedWorkTypeCode(workTypeCode);
    }

    const handleWorkDescSelection = (desc) => {
        let uniqueWorkDescriptions = [
            ...new Map(
                [
                    ...selectedWorkDescriptions,
                    ...(order.orderDetails[order?.selectedSubOrderIndex].workDescriptions ?? [])
                ].map(item => [item.id, item])
            ).values()
        ];
        if (uniqueWorkDescriptions.filter(x => x.id === desc.id).length > 0)
            uniqueWorkDescriptions = uniqueWorkDescriptions.filter(x => x.id !== desc.id);
        else
            uniqueWorkDescriptions.push(desc);
        if (uniqueWorkDescriptions.length > 0) {
            setError({ message: '' });
        }
        setSelectedWorkDescriptions([...uniqueWorkDescriptions]);
    }

    const getActiveClassForDesc = (ele) => {
        return selectedWorkDescriptions?.filter(x => x.id === ele.id).length > 0 ? 'active' : ''
    }

    const getActiveClassForWorkType = (ele) => {
        return countDescriptionByWorkType(ele?.code) > 0 ? 'active' : ''
    }

    const countDescriptionByWorkType = (workTypeCode) => {
        return order?.orderDetails[order.selectedSubOrderIndex]?.workDescriptions?.filter(x => x.workTypeCode === workTypeCode).length;
    }

    const getWorkDescByWorkType = (code) => {
        return (order?.orderDetails[order?.selectedSubOrderIndex]?.workDescriptions || [])
            .filter(x => x.workTypeCode === code)
            .map((ele, index) => {
                return <span key={index}>{ele?.name}</span>
            });
    }

    const NO_DATA_MESSAGE = (message) => {
        return <div className='workdesc-steps-panel'>
            <div className='col-title'>Work Description</div>
            <div className='work-desc-message'>{message}</div>
        </div>
    }

    if (order?.orderDetails?.length <= 0)
        return NO_DATA_MESSAGE('Please create at least one sub order')
    if (order?.orderDetails[order?.selectedSubOrderIndex]?.workTypes?.length <= 0)
        return NO_DATA_MESSAGE('Please select at least one Work Type')
    if (order?.selectedSubOrderIndex === undefined || order?.selectedSubOrderIndex < 0)
        return NO_DATA_MESSAGE('Please select any sub order')
    return (
        <>
            <div className='workdesc-steps-panel'>
                <div className='col-title'>Work Description</div>
                {workTypeList?.map((ele, index) => {
                    if (order?.selectedSubOrderIndex === undefined || !isWorkTypeExistInSuborder(ele))
                        return <></>
                    return <div key={index} className={`desc-step-item ${getActiveClassForWorkType(ele)}`} onClick={e => handleWorkTypeSelection(ele?.code)}>
                        <div className='desc-work-desc-meta'>
                            <span className='desc-step-num'>{index + 1}</span>
                            <div>
                                <div className='desc-step-name'>{ele?.name}</div>
                            </div>
                            <span className='desc-step-meta'>{countDescriptionByWorkType(ele?.code)>0 &&<FiCheck color='green' />} {countDescriptionByWorkType(ele?.code)}</span>
                        </div>
                        {/* <div className='desc-work-desc-selected'>
                            {getWorkDescByWorkType(ele.code)}
                        </div> */}
                    </div>
                }
                )}
            </div>

            <Modal
                isOpen={workDescSelectorOpen}
                onClose={() => setWorkDescSelectorOpen(false)}
                title={`Work description - ${order?.orderDetails[order?.selectedSubOrderIndex]?.orderNo ?? 'New Order'}`}
                size="mid"
                type="default"
                showCloseButton
                closeOnOverlayClick
                footer={
                    <div className="op-footer">
                        <div style={{ visibility: 'hidden' }}></div>
                        <div className="op-footer__right">
                            <button className="op-btn op-btn--danger" onClick={() => { setWorkDescSelectorOpen(false); }}>
                                <FiX size={15} /> Cancel
                            </button>
                            <button className="op-btn op-btn--save" onClick={e => handleWorkDescSave()}>
                                <FiSave size={15} /> Confirm
                            </button>
                        </div>
                    </div>
                }
            >
                <div className='drop-message'>{workTypeList.find(x => x.code === selectedWorkTypeCode)?.name}</div>
                <div className="op-body" style={{ marginTop: '10px' }}>
                    {error.message && <div className='message-alert-danger'>{error.message}</div>}
                    <div className="work-section">
                        {workDescriptionList?.filter(x => x.workTypeCode === selectedWorkTypeCode)?.map((ele, index) => {
                            return <div key={index} onClick={e => handleWorkDescSelection(ele)} className={`work-section_item ${getActiveClassForDesc(ele)}`}>
                                {ele?.name}
                            </div>
                        })}
                    </div>
                </div>
            </Modal>
           
        </>
    )
}
