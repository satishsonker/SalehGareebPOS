import React from 'react'

export default function Field({ label, children }) {
  return (
    <div className="co-field">
      <label className="co-field__label">{label}</label>
      {children}
    </div>
  );
}
