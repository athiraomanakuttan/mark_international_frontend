// components/ConfirmDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
};

export const ConfirmDialog = ({ open, message, onClose, onConfirm }: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmation</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-700">{message}</p>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-red-600 text-white" onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
