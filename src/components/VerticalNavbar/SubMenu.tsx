import { SubItemType } from '@/types/types';
import React from 'react';

interface Props {
  subItems: SubItemType[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SubMenu = ({ subItems, isOpen, setIsOpen }: Props) => (
  <ul className={`ml-8 mt-2 space-y-1 transition-all ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
    {subItems.map((sub, index) => {
      const Icon = sub.icon;
      return (
        <li key={index}>
          <a
            href={sub.href}
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-[#405189] text-sm text-gray-200"
          >
            <Icon size={16} className="text-gray-400" />
            <span>{sub.label}</span>
          </a>
        </li>
      );
    })}
  </ul>
);

export default SubMenu;
