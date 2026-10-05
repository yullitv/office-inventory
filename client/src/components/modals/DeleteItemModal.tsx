import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDeleteItem } from '../../api/hooks';
import type { Item } from '../../api/types';
import { getErrorMessage } from '../../utils/errors';

type Props = {
  item: Item;
  opened: boolean;
  onClose: () => void;
  onDeleted?: () => void;
};

export function DeleteItemModal({ item, opened, onClose, onDeleted }: Props) {
  const deleteItem = useDeleteItem();

  const handleDelete = () => {
    deleteItem.mutate(item.id, {
      onSuccess: () => {
        notifications.show({ color: 'green', message: `${item.name} видалено` });
        onClose();
        onDeleted?.();
      },
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Видалити річ?">
      <Stack>
        {deleteItem.error && <Alert color="red">{getErrorMessage(deleteItem.error)}</Alert>}
        <Text size="sm">«{item.name}» зникне зі списку. Історія видач цієї речі збережеться.</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Скасувати
          </Button>
          <Button color="red" loading={deleteItem.isPending} onClick={handleDelete}>
            Видалити
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
