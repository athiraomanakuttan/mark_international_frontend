'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileToggleButton from './MobileToggleButton';
import Overlay from './Overlay';

const VerticalNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
    
      <MobileToggleButton isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} />
      {isOpen && <Overlay onClick={() => setIsOpen(false)} />}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}/>
    </>
  );
};

export default VerticalNavbar;
