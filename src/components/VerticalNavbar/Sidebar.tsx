import React, { useState } from 'react';
import SidebarItem from './SidebarItem';
import { adminMenuItems, staffMenuItems } from './menuData'; 
import { MenuItemType, UserRole } from '@/types/types';

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: Props) => {
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const userRole = "admin"
  const menuItems: MenuItemType[] = userRole === 'admin' ? adminMenuItems : staffMenuItems;

  const toggleMenu = (id: string) =>
    setExpandedMenus((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <nav
      className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-800 to-gray-900 text-white z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 w-72 shadow-2xl`}
    >
      <div className="flex flex-col h-full">
        {/* Branding */}
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md" style={{ backgroundColor: '#405189' }}>
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Mark International</h1>
              <p className="text-xs text-gray-300 capitalize">{userRole} Panel</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isExpanded={!!expandedMenus[item.id]}
              toggleMenu={toggleMenu}
              setIsOpen={setIsOpen}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
