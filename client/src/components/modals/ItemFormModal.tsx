import {
  Alert,
  Autocomplete,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useCategories, useCreateItem, useUpdateItem } from '../../api/hooks';
import type { Item, ItemStatus } from '../../api/types';
import { getErrorMessage } from '../../utils/errors';
import { itemStateLabels } from '../../utils/format';

type Props = {
  opened: boolean;
  onClose: () => void;
  item?: Item;
};

export function ItemFormModal({ opened, onClose, item }: Props) {
  return (
    <Modal opened={opened} onClose={onClose} title={item ? 'Редагувати річ' : 'Нова річ'}>
      <ItemForm item={item} onDone={onClose} />
    </Modal>
  );
}

const statusOptions: { value: ItemStatus; label: string }[] = [
  { value: 'available', label: itemStateLabels.available },
  { value: 'in_repair', label: itemStateLabels.in_repair },
  { value: 'lost', label: itemStateLabels.lost },
];

function ItemForm({ item, onDone }: { item?: Item; onDone: () => void }) {
  const categories = useCategories();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem(item?.id ?? 0);
  const mutation = item ? updateItem : createItem;

  const form = useForm({
    initialValues: {
      name: item?.name ?? '',
      category: item?.category ?? '',
      inventoryNumber: item?.inventoryNumber ?? '',
      description: item?.description ?? '',
      status: item?.status ?? ('available' as ItemStatus),
    },
    validate: {
      name: (value) => (value.trim() ? null : 'Вкажіть назву'),
      category: (value) => (value.trim() ? null : 'Вкажіть категорію'),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    const input = {
      name: values.name.trim(),
      category: values.category.trim(),
      inventoryNumber: values.inventoryNumber.trim() || null,
      description: values.description.trim() || null,
      status: values.status,
    };

    mutation.mutate(input, {
      onSuccess: () => {
        notifications.show({ color: 'green', message: item ? 'Зміни збережено' : 'Річ додано' });
        onDone();
      },
    });
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        {mutation.error && <Alert color="red">{getErrorMessage(mutation.error)}</Alert>}
        <TextInput label="Назва" withAsterisk {...form.getInputProps('name')} />
        <Autocomplete
          label="Категорія"
          withAsterisk
          data={categories.data ?? []}
          {...form.getInputProps('category')}
        />
        <TextInput label="Інвентарний номер" {...form.getInputProps('inventoryNumber')} />
        <Textarea label="Опис" autosize minRows={2} {...form.getInputProps('description')} />
        <Select
          label="Стан"
          data={statusOptions}
          allowDeselect={false}
          disabled={Boolean(item?.currentLoan)}
          description={
            item?.currentLoan ? 'Річ на руках: стан змінюється під час повернення' : undefined
          }
          {...form.getInputProps('status')}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onDone}>
            Скасувати
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Зберегти
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
