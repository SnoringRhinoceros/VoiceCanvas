import "./Slider.css";
import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function Slider ({name, propName}){
  // State to hold the slider value
  const [sliderValue, setSliderValue] = useState(50); // Default to 50
  const dispatch = useDispatch();

  // Function to handle value change
  const handleSliderChange = (event) => {
    setSliderValue(event.target.value);
    dispatch({type: propName, payload: event.target.value});
  };

  return (
    <div style={{ width: '300px', padding: '20px', textAlign: 'center' }}>
      <h3>{name}: {sliderValue}</h3>
      <input
        type="range"
        min="0"
        max="100"
        value={sliderValue}
        onChange={handleSliderChange}
        style={{ width: '100%' }}
      />
    </div>
  );
};