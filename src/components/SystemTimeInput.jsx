import 'react';

const SystemTimeInput = ({ value, onChange, onDone, autoFocus }) => {
  return (
    <div className="time-inputs-edit">
      <input 
        type="time" 
        value={value?.[0] || ''} 
        onChange={(e) => onChange('start', e.target.value)}
        autoFocus={autoFocus}
      />
      <input 
        type="time" 
        value={value?.[1] || ''} 
        onChange={(e) => onChange('end', e.target.value)}
      />
      <button onClick={(e) => { e.stopPropagation(); onDone(); }}>Done</button>
    </div>
  );
};

export default SystemTimeInput;
