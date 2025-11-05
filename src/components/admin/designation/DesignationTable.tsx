import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { DesignationResponse } from '@/types/designation-types';

interface DesignationTableProps {
  designations: DesignationResponse[];
  onEdit: (designation: DesignationResponse) => void;
  onDelete: (designationId: string) => void;
  isLoading?: boolean;
}

const DesignationTable: React.FC<DesignationTableProps> = ({
  designations,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const getStatusBadge = (status: number) => {
    return (
      <Badge variant={status === 1 ? 'default' : 'secondary'}>
        {status === 1 ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!designations.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No designations found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {designations.map((designation) => (
            <TableRow key={designation.id}>
              <TableCell className="font-medium">
                {designation.name}
              </TableCell>
              <TableCell>
                {designation.description || '-'}
              </TableCell>
              <TableCell>
                {getStatusBadge(designation.status)}
              </TableCell>
              <TableCell>
                {designation.createdByName}
              </TableCell>
              <TableCell>
                {formatDate(designation.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(designation)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(designation.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DesignationTable;