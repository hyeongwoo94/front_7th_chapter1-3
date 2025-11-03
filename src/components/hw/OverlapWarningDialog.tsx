import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';

import { Event } from '../../types.ts';

interface OverlapWarningDialogProps {
  open: boolean;
  overlappingEvents: Event[];
  onCancel: () => void;
  onConfirm: () => void;
}

const OverlapWarningDialog = ({
  open,
  overlappingEvents,
  onCancel,
  onConfirm,
}: OverlapWarningDialogProps) => {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText>다음 일정과 겹칩니다:</DialogContentText>
        {overlappingEvents.map((event) => (
          <Typography key={event.id} sx={{ ml: 1, mb: 1 }}>
            {event.title} ({event.date} {event.startTime}-{event.endTime})
          </Typography>
        ))}
        <DialogContentText>계속 진행하시겠습니까?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>취소</Button>
        <Button color="error" onClick={onConfirm}>
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OverlapWarningDialog;
