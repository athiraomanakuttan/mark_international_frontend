import React from 'react';
import { MenuItemType } from '@/types/types';
import SubMenu from './SubMenu';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
  item: MenuItemType;
  isExpanded: boolean;
  toggleMenu: (id: string) => void;
  setIsOpen: (open: boolean) => void;
}

const SidebarItem = ({ item, isExpanded, toggleMenu, setIsOpen }: Props) => {
  const Icon = item.icon;

  if (item.type === 'single') {
    return (
      <a
        href={item.href}
        onClick={() => setIsOpen(false)}
        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#405189] transition"
      >
        <Icon size={20} className="text-gray-300" />
        <span className="text-white font-medium">{item.label}</span>
      </a>
    );
  }

  return (
    <div>
      <button
        onClick={() => toggleMenu(item.id)}
        className="w-full flex justify-between items-center px-4 py-3 rounded-lg hover:bg-[#405189] transition"
      >
        <div className="flex items-center space-x-3">
          <Icon size={20} className="text-gray-300" />
          <span className="text-white font-medium">{item.label}</span>
        </div>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {item.subItems && (
        <SubMenu subItems={item.subItems} isOpen={isExpanded} setIsOpen={setIsOpen} />
      )}
    </div>
  );
};

export default SidebarItem;
