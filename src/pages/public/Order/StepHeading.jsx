import React from 'react';
import './StepHeading.css';
const StepHeading = ({ step, title,showStep=true }) => {
  return (
    <div className="co-step-heading">
      {showStep && <span className="co-step-heading__step">STEP {step} - </span>}
      {!showStep && <span className="co-step-heading__step">{step} </span>}
      <span className="co-step-heading__title">{title}</span>
    </div>
  );
};

export default StepHeading;