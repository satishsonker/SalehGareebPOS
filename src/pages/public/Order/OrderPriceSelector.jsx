import React, { useState, useEffect } from 'react'
import "./OrderPriceSelector.css"
import { FiTag } from 'react-icons/fi';
import StepHeading from './StepHeading';
import { getOrderPrices } from '../../../services/api/orderPriceApi';
import NumericKeypad from '../../../components/NumericKeypad/NumericKeypad';
export default function OrderPriceSelector({ order, setOrder }) {
    const [presetPrices, setPresetPrices] = useState([]);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [keypadMode, setKeypadMode] = useState(null);
    const openPriceKeypad = () => setKeypadMode('price');
    const closeKeypad = () => setKeypadMode(null);
    const fetchOrderPrices = async () => {
        try {
            const prices = await getOrderPrices();
            setPresetPrices(prices.data.data);
        } catch (error) {
            console.error('Error fetching order prices:', error);
        }
    };
    useEffect(() => {
        fetchOrderPrices();
    }, []);



    const getPriceGradeColor = (grade) => {
        if (grade.indexOf('AA') > -1) return 'grade-purple';
        if (grade.indexOf('B') > -1) return 'grade-green';
        if (grade.indexOf('C') > -1) return 'grade-gray';
        return 'grade-blue';
    }

    const onCustomPriceChange = (val) => {
        setOrder({ ...order, customPrice: val });
    };

    const onCustomPriceConfirm = (input) => {
        const n = parseFloat(input?.value);
        if (!isNaN(n) && n > 0) {
            setOrder({ ...order, price: n, grade: 'AA', crystalPackets: 0 });
        }
    };

    const handlePresetPriceSelect = (p) => {
        setOrder({ ...order, price: p?.price, grade: p?.grade, crystalPackets: p?.crystalPackets, customPrice: '' });
    };



    return (
        <>
            <div className="co-col co-col--mid">
                <div className="co-card">
                    <div className="co-card__header">
                        <span className="co-card__title">
                            <FiTag className="co-card__title-icon" />
                            <StepHeading step={1} title="Select Price" />
                        </span>
                    </div>
                    {/* Selected price display */}
                    <div className={`co-price-display ${order?.price > 0 ? 'co-price-display--set' : ''}`}>
                        {order?.price
                            ? <><span className="co-price-display__label">{`${order?.customPrice === '' ? 'Selected Price' : 'Custom Price'}`}</span><span className="co-price-display__val">{order?.price.toLocaleString()} ب.د</span></>
                            : <span className="co-price-display__placeholder">No price selected</span>
                        }
                    </div>

                    <div className="co-price-grid">
                        {presetPrices?.map((p, index) => (
                            <button
                                key={index}
                                className={`co-price-btn ${order?.price === p.price && order.customPrice === '' ? 'co-price-btn--selected' : ''}`}
                                onClick={() => handlePresetPriceSelect(p)}
                            >
                                <div className='price'>{p?.price.toLocaleString()}</div>
                                <div className='inline-field'>
                                    <div className={'price-grade ' + getPriceGradeColor(p?.grade)}>{p?.grade.toLocaleString()}</div>
                                    <div className=''>- {p?.crystalPackets.toLocaleString()}pkt</div>
                                </div>
                            </button>
                        ))}
                    </div>
                    {showCustomInput ? (
                        <>
                            <label className="co-custom-label fw-bold">Custom Price (Above 5000 ب.د)</label>
                            <div className="co-custom-row">
                                <input
                                    className={`co-input co-input--center co-input--keypad ${keypadMode === 'price' ? 'co-input--keypad-open' : ''}`}
                                    readOnly
                                    placeholder="Enter custom amount"
                                    value={order?.customPrice}
                                    onClick={openPriceKeypad}
                                />
                                <button className="co-btn co-btn--ghost co-btn--sm" onClick={() => { setShowCustomInput(false); closeKeypad(); }}>Cancel</button>
                            </div>
                        </>
                    ) : (
                        <button
                            className={`co-custom-btn ${order?.price > 5000 && order.customPrice === '' ? 'co-custom-btn--selected' : ''}`}
                            onClick={() => { setShowCustomInput(true); setTimeout(openPriceKeypad, 50); }}
                        >
                            Custom (Above 5000 ب.د)
                        </button>
                    )}
                </div>
            </div>

            {/* Numeric keypad — custom price */}
            <NumericKeypad
                isOpen={keypadMode === 'price'}
                name="price"
                value={order?.customPrice || ''}
                onChange={onCustomPriceChange}
                onConfirm={onCustomPriceConfirm}
                onClose={closeKeypad}
                label="Custom Price (ب.د)"
            />
        </>
    )
}
