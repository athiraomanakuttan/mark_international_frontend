import { AttendanceService } from '@/service/attendanceService';
import React from 'react';

interface LeaveDetailsModalProps {
  leave: any;
  onClose: () => void;
  onDeleted?: (leaveId: string) => void;
}

const LeaveDetailsModal: React.FC<LeaveDetailsModalProps> = ({ leave, onClose, onDeleted }) => {
  if (!leave) return null;

  const isPending = leave.status === 'pending';

  const handleDelete = async () => {
    const res = await AttendanceService.deleteLeaveRequest(leave.id);
    if (res.success) {
      if (onDeleted) onDeleted(leave.id);
      onClose();
    } else {
      alert(res.message || 'Failed to delete leave request');
    }
  };

  return (
    <div className="modal">
      <h2>Leave Details</h2>
      <p><strong>Date:</strong> {leave.formattedLeaveDate}</p>
      <p><strong>Reason:</strong> {leave.reason}</p>
      <p><strong>Status:</strong> {leave.status}</p>
      <div>
        <strong>Documents:</strong>
        <ul>
          {leave.documents && leave.documents.length > 0 ? (
            leave.documents.map((doc: any, idx: number) => (
              <li key={idx}>
                <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.title}</a>
              </li>
            ))
          ) : (
            <li>No documents attached</li>
          )}
        </ul>
      </div>
      {isPending && (
        <button onClick={handleDelete}>Delete Leave Request</button>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default LeaveDetailsModal;
