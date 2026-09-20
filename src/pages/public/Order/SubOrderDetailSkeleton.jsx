import React from "react";
import "./SubOrderDetailSkeleton.css";

export default function SubOrderDetailSkeleton({ count = 3 }) {
    return (
        <div className="subOrderSkeletonList">
            {Array.from({ length: count }).map((_, index) => (
                <div className="subOrderSkeleton" key={index}>

                    {/* Left index */}
                    <div className="skeleton skeleton-index" />

                    {/* Main content */}
                    <div className="skeleton-content">

                        {/* Order + price */}
                        <div className="skeleton-top-row">
                            <div className="skeleton-order-info">
                                <div className="skeleton skeleton-order-label" />
                                <div className="skeleton skeleton-order-number" />
                            </div>

                            <div className="skeleton skeleton-price" />
                        </div>


                        {/* Work type badges */}
                        <div className="skeleton-work-types">

                            <div className="skeleton skeleton-chip chip-1" />
                            <div className="skeleton skeleton-chip chip-2" />
                            <div className="skeleton skeleton-chip chip-3" />
                            <div className="skeleton skeleton-chip chip-4" />
                            <div className="skeleton skeleton-chip chip-5" />
                            <div className="skeleton skeleton-chip chip-6" />

                        </div>


                        {/* Crystal / Grade */}
                        <div className="skeleton-meta">

                            <div className="skeleton skeleton-meta-icon" />

                            <div className="skeleton skeleton-meta-text" />

                            <div className="skeleton skeleton-grade" />

                        </div>

                    </div>


                    {/* Edit / delete button */}
                    <div className="skeleton skeleton-action" />

                </div>
            ))}
        </div>
    );
}