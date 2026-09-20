import React, { useEffect, useState } from 'react';
import { FiCopy, FiTrash2, FiX } from 'react-icons/fi';
import Modal from '../../../components/Modal/Modal';
import './SubOrderActionModal.css'

export default function SubOrderActionModal({ isOpen, onClose, orderDetails, selectedIndex, setOrder }) {
    const selectedOrder = orderDetails[selectedIndex];
    const selectedPrice = Number(selectedOrder?.price);
    const [copyTargets, setCopyTargets] = useState([]);

    useEffect(() => {
        if (!isOpen || !selectedOrder) {
            setCopyTargets([]);
            return;
        }

        setCopyTargets(
            orderDetails
                .map((item, index) => Number(item?.price) === selectedPrice && index !== selectedIndex ? index : -1)
                .filter(index => index !== -1)
        );
    }, [isOpen, selectedIndex, selectedPrice]);

    const toggleCopyTarget = (index) => {
        if (index === selectedIndex) return;

        setCopyTargets(prev =>
            prev.includes(index)
                ? prev.filter(x => x !== index)
                : [...prev, index]
        );
    };

    const selectAllSamePrice = () => {
        const indexes = orderDetails
            .map((item, index) => Number(item?.price) === selectedPrice && index !== selectedIndex ? index : -1)
            .filter(index => index !== -1);

        setCopyTargets(prev => prev.length === indexes.length ? [] : indexes);
    };

    const copyConfiguration = () => {
        if (!selectedOrder || !copyTargets.length) return;

        const configuration = {
            workTypes: [...(selectedOrder?.workTypes ?? [])],
            workDescriptions: [...(selectedOrder?.workDescriptions ?? [])],
            neckline: selectedOrder?.neckline ?? '',
            lengthInch: selectedOrder?.lengthInch ?? '',
            sleeve: selectedOrder?.sleeve ?? ''
        };

        setOrder(prev => ({
            ...prev,
            orderDetails: prev.orderDetails.map((item, index) =>
                copyTargets.includes(index)
                    ? {
                        ...item,
                        workTypes: [...configuration.workTypes],
                        workDescriptions: [...configuration.workDescriptions],
                        neckline: configuration.neckline,
                        lengthInch: configuration.lengthInch,
                        sleeve: configuration.sleeve
                    }
                    : item
            )
        }));

        onClose();
    };

    const deleteSubOrder = (index) => {
        setOrder(prev => {
            const orderDetails = [...(prev?.orderDetails ?? [])];
            orderDetails.splice(index, 1);
            orderDetails?.map((ele, eleIndex) => {
                ele.orderNo = `${ele?.orderNo?.split('-')[0]}-${eleIndex + 1}`;
            })

            let newSelectedIndex = prev?.selectedSubOrderIndex ?? 0;

            if (index === newSelectedIndex) {
                newSelectedIndex = Math.min(index, orderDetails.length - 1);
            } else if (index < newSelectedIndex) {
                newSelectedIndex--;
            }

            return {
                ...prev,
                orderDetails,
                selectedSubOrderIndex: orderDetails.length ? newSelectedIndex : -1
            };
        });

        setCopyTargets(prev => prev.filter(x => x !== index).map(x => x > index ? x - 1 : x));

        if (index === selectedIndex) {
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Sub Order - ${selectedOrder?.orderNo ?? ''}`}
            size="xlarge"
            type="default"
            showCloseButton
            closeOnOverlayClick
            footer={
                <div className="op-footer">
                    <div></div>
                    <div className="op-footer__right">
                        <button className="op-btn op-btn--ghost" onClick={onClose}>
                            <FiX size={15} /> Cancel
                        </button>
                        <button className="op-btn op-btn--save" onClick={copyConfiguration} disabled={!copyTargets.length}>
                            <FiCopy size={15} /> Copy Configuration
                        </button>
                    </div>
                </div>
            }
        >
            <div className="suborder-action-modal">
                <div className="suborder-action-header">
                    <div>
                        <div className="suborder-action-title">{selectedOrder?.orderNo}</div>
                        <div className="suborder-action-price">Price: {selectedOrder?.price} AED</div>
                    </div>

                    <button className="op-btn op-btn--ghost" onClick={selectAllSamePrice}>
                        <FiCopy size={15} /> {copyTargets.length ? 'Unselect All' : 'Select Same Price'}
                    </button>
                </div>

                <div className="suborder-copy-info">
                    Select sub-orders to copy <strong>{selectedOrder?.orderNo}</strong> configuration.
                    Only sub-orders with the same price are highlighted.
                </div>

                <div className="suborder-action-list">
                    {orderDetails.map((item, index) => {
                        const isSelected = index === selectedIndex;
                        const isSamePrice = Number(item?.price) === selectedPrice;
                        const isCopyTarget = copyTargets.includes(index);

                        return (
                            <div
                                key={item?.orderNo ?? index}
                                className={`suborder-action-item ${isSelected ? 'selected' : ''} ${isSamePrice ? 'same-price' : ''} ${isCopyTarget ? 'copy-target' : ''}`}
                                onClick={() => !isSelected && toggleCopyTarget(index)}
                            >
                                <div className="suborder-action-item-left">
                                    <span className="suborder-action-number">{item?.orderNo}</span>
                                    <span className="suborder-action-price">{item?.price} AED</span>
                                </div>

                                <div className="suborder-action-tags">
                                    {isSelected && <span className="suborder-tag selected-tag">Source</span>}
                                    {isSamePrice && !isSelected && <span className="suborder-tag same-price-tag">Same Price</span>}
                                    {isCopyTarget && <span className="suborder-tag copy-tag">Copy</span>}

                                    {!isSelected && (
                                        <button
                                            type="button"
                                            className="suborder-delete-btn"
                                            title="Delete sub order"
                                            onClick={e => {
                                                e.stopPropagation();
                                                deleteSubOrder(index);
                                            }}
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="suborder-delete-section">
                    <span>
                        Select a sub-order above to copy configuration, or use the delete icon to remove it.
                    </span>
                </div>
            </div>
        </Modal>
    );
}