import {
  LayoutDashboard,
  Users,
  ClipboardList,
  UserPlus,
  FileText,
  Upload,
  Trash2,
  UserX,
  ArrowRightLeft,
  UserCog,
  Eye,
  BarChart3,
  Boxes,
} from 'lucide-react';
import { MenuItemType } from '@/types/types';

export const adminMenuItems: MenuItemType[] = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    type: 'single',
    href: '/dashboard',
  },
  {
    id: 'lead-management',
    icon: Boxes,
    label: 'Lead Management',
    type: 'dropdown',
    subItems: [
      { label: 'Dashboard', href: '/lead-management/dashboard', icon: LayoutDashboard },
      { label: 'Add Lead', href: '/lead-management/add-lead', icon: UserPlus },
      { label: 'Lead Report', href: '/lead-management/report', icon: FileText },
      { label: 'Import Leads', href: '/lead-management/import', icon: Upload },
      { label: 'Deleted Leads', href: '/lead-management/deleted', icon: Trash2 },
      { label: 'Unassigned Leads', href: '/lead-management/unassigned', icon: UserX },
      { label: 'Transfer Leads', href: '/lead-management/transfer', icon: ArrowRightLeft },
    ],
  },
  {
    id: 'staff-management',
    icon: UserCog,
    label: 'Staff Management',
    type: 'dropdown',
    subItems: [
      { label: 'Add Staff', href: '/staff-management/add-staff', icon: UserPlus },
      { label: 'View Staff', href: '/staff-management/view-staff', icon: Eye },
      { label: 'Designation', href: '/staff-management/designation', icon: UserCog },
      { label: 'Deleted Staff', href: '/staff-management/deleted', icon: Trash2 },
    ],
  },
  {
    id: 'report',
    icon: BarChart3,
    label: 'Report',
    type: 'dropdown',
    subItems: [
      { label: 'Staff Report', href: '/report/staff-report', icon: FileText },
      { label: 'Transfer Lead Report', href: '/report/transfer-lead-report', icon: ArrowRightLeft },
      { label: 'Total Lead Report', href: '/report/total-lead-report', icon: BarChart3 },
    ],
  },
];

export const staffMenuItems: MenuItemType[] = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    type: 'single',
    href: '/dashboard',
  },
  {
    id: 'lead-management',
    icon: Boxes,
    label: 'Lead Management',
    type: 'dropdown',
    subItems: [
      { label: 'Dashboard', href: '/lead-management/dashboard', icon: LayoutDashboard },
      { label: 'Add Lead', href: '/lead-management/add-lead', icon: UserPlus },
      { label: 'Lead Report', href: '/lead-management/report', icon: FileText },
    ],
  },
];