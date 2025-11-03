import { Close } from '@mui/icons-material';
import { Alert, AlertTitle, IconButton, Stack } from '@mui/material';

interface NotificationsStackProps {
  notifications: { id: string; message: string }[];
  // eslint-disable-next-line no-unused-vars
  onClose: (_id: string) => void;
}

const NotificationsStack = ({ notifications, onClose }: NotificationsStackProps) => {
  if (notifications.length === 0) return null;

  return (
    <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          severity="info"
          sx={{ width: 'auto' }}
          action={
            <IconButton size="small" onClick={() => onClose(notification.id)}>
              <Close />
            </IconButton>
          }
        >
          <AlertTitle>{notification.message}</AlertTitle>
        </Alert>
      ))}
    </Stack>
  );
};

export default NotificationsStack;
