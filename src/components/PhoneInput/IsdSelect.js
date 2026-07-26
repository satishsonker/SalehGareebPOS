import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiChevronDown } from 'react-icons/fi';
import Flag from 'react-world-flags';
import { getMasterDataByType } from '../../services/api/masterDataApi';
import './IsdSelect.css';

//export let MIDDLE_EAST_COUNTRIES = [
  // { code: '+966', name: 'Saudi Arabia', short: 'SAU' },
  // { code: '+971', name: 'UAE',          short: 'ARE' },
  // { code: '+965', name: 'Kuwait',       short: 'KWT' },
  // { code: '+973', name: 'Bahrain',      short: 'BHR' },
  // { code: '+974', name: 'Qatar',        short: 'QAT' },
  // { code: '+968', name: 'Oman',         short: 'OMN' },
  // { code: '+962', name: 'Jordan',       short: 'JOR' },
  // { code: '+964', name: 'Iraq',         short: 'IRQ' },
  // { code: '+967', name: 'Yemen',        short: 'YEM' },
  // { code: '+961', name: 'Lebanon',      short: 'LBN' },
  // { code: '+963', name: 'Syria',        short: 'SYR' },
  // { code: '+970', name: 'Palestine',    short: 'PSE' },
  // { code: '+972', name: 'Israel',       short: 'ISR' },
  // { code: '+98',  name: 'Iran',         short: 'IRN' },
  // { code: '+20',  name: 'Egypt',        short: 'EGY' },
  // { code: '+249', name: 'Sudan',        short: 'SDN' },
  // { code: '+212', name: 'Morocco',      short: 'MAR' },
  // { code: '+213', name: 'Algeria',      short: 'DZA' },
  // { code: '+216', name: 'Tunisia',      short: 'TUN' },
  // { code: '+218', name: 'Libya',        short: 'LBY' },
//];

function IsdSelect({ value, onChange }) {
  const [middleEastCountries, setMiddleEastCountries] = useState([]);
  const [open,    setOpen]    = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const dropRef    = useRef(null);
  useEffect(() => {
   getMasterDataByType('COUNTRY')
         .then(res => {
           var countries = res.data.data.map(country => (
             {
               code: country.code,
               name: country.displayValue,
               short: country.remark
             }));
           setMiddleEastCountries([...countries]);
         })
         .catch(err => console.error('Failed to load middle east countries:', err));
  }, [])
  

  // Position the portal dropdown under the trigger button
  const calcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setDropPos({
      top:   r.bottom + window.scrollY + 4,
      left:  r.left   + window.scrollX,
      width: Math.max(r.width, 220),
    });
  }, []);

  const handleOpen = () => {
    calcPos();
    setOpen(o => !o);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        dropRef.current    && !dropRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', () => setOpen(false), { once: true });
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const select = (country) => {
    onChange(country);
    setOpen(false);
  };

  return (
    <div className="isd-wrap">
      <button
        ref={triggerRef}
        type="button"
        className={`isd-trigger ${open ? 'isd-trigger--open' : ''}`}
        onClick={handleOpen}
      >
        <Flag code={value?.short} className="isd-flag-img" fallback={<span>🏳</span>} />
        <span className="isd-code">{value?.code}</span>
        <FiChevronDown className={`isd-chevron ${open ? 'isd-chevron--up' : ''}`} size={13} />
      </button>

      {open && createPortal(
        <div
          ref={dropRef}
          className="isd-dropdown"
          style={{ top: dropPos.top, left: dropPos.left, minWidth: dropPos.width }}
        >
          {middleEastCountries.map(c => (
            <button
              key={c?.short}
              type="button"
              className={`isd-option ${value?.short === c?.short ? 'isd-option--active' : ''}`}
              onClick={() => select(c)}
            >
              <Flag code={c?.short} className="isd-option__flag-img" fallback={<span>🏳</span>} />
              <span className="isd-option__name">{c?.name}</span>
              <span className="isd-option__code">{c?.code}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

export default IsdSelect;
