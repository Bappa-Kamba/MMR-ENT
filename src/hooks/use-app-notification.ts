import { useNotification } from "@/providers/NotificationProvider";

export function useAppNotification() {
  const { openNotificationWithIcon } = useNotification();
  return { openNotificationWithIcon };
}

export default useAppNotification;
