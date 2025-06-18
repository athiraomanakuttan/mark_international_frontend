import React from 'react';
import { Menu, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  toggle: () => void;
}

const MobileToggleButton = ({ isOpen, toggle }: Props) => (
  <button
    onClick={toggle}
    className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-white hover:opacity-90 transition-all shadow-lg"
    style={{ backgroundColor: '#405189' }}
  >
    {isOpen ? <X size={24} /> : <Menu size={24} />}
  </button>
);

export default MobileToggleButton;
