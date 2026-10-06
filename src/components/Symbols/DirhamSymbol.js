import React from 'react';

const DirhamSymbol = ({ amount, show = true, size = '9' }) => {
    const isValidAmount = amount !== undefined && amount !== null && amount !== '';
    const shouldShow = show && isValidAmount;

    return (
        <span>
            {shouldShow && (
                <span style={{ fontSize: `${size}px` }} className="uae-symbol">
                    د.إ
                </span>
            )}
            {isValidAmount && <span> {amount}</span>}
        </span>
    );
};

export default DirhamSymbol;
