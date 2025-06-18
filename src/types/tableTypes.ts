
export interface TableColumn<T = any> {
  key: keyof T;
  header: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

export interface TableAction<T = any> {
  type: 'edit' | 'delete' | 'send' | 'view' | 'custom';
  label: string;
  onClick: (item: T, index: number) => void;
  icon?: React.ComponentType<{ size?: number }>;
  className?: string;
  condition?: (item: T) => boolean;
}

export interface ReusableTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  showSearch?: boolean;
  showPagination?: boolean;
  itemsPerPage?: number;
  className?: string;
  onRowClick?: ((item: T, index: number) => void) | null;
  loading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
}

export interface ActionButtonProps<T> {
  action: TableAction<T>;
  item: T;
  index: number;
}