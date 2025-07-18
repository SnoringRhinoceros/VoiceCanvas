import React, { useState } from 'react';
import './Sidebar.css'; // Import the CSS file for styling
import {Slider} from "./Slider.jsx";
import { useSelector } from 'react-redux';

export function Settings(){
  const [isOpen, setIsOpen] = useState(false);

  // Function to open the sidebar
  const openSidebar = () => {
    setIsOpen(true);
  };

  const toggleSideBar = ()=>{
    setIsOpen(!isOpen);
  }

  // Function to close the sidebar
  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <div>
      {/* Button to open the sidebar */}
      <button className="openSidebarBtn" onClick={toggleSideBar}>Settings</button>

      <div className={`overlay ${isOpen ? 'open' : ''}`} onClick={closeSidebar}></div>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <a href="javascript:void(0)" className="closebtn" onClick={closeSidebar}>&times;</a>
        <h2>Settings</h2>
        
        <Slider name="Clarity" propName="setClarity"/>
        <Slider name="Lower Threshold" propName="setThreshold"/>
        
      </div>
    </div>
  );
};
