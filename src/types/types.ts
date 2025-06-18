import { LucideIcon } from 'lucide-react';

export interface SubItemType {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface MenuItemType {
  id: string;
  icon: LucideIcon;
  label: string;
  type: 'single' | 'dropdown';
  href?: string;
  subItems?: SubItemType[];
}


export type UserRole = 'admin' | 'staff';
