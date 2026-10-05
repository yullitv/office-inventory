import { Alert, Button, Group, Modal, Select, Stack, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEmployees, useIssueLoan } from '../../api/hooks';
import type { Item } from '../../api/types';
import { getErrorMessage } from '../../utils/errors';
import { dateFromToday, todayDateOnly } from '../../utils/format';

type Props = {
  item: Item;
  opened: boolean;
  onClose: () => void;
};

export function IssueLoanModal({ item, opened, onClose }: Props) {
  return (
    <Modal opened={opened} onClose={onClose} title={`Видати: ${item.name}`}>
      <IssueLoanForm item={item} onDone={onClose} />
    </Modal>
  );
}

function IssueLoanForm({ item, onDone }: { item: Item; onDone: () => void }) {
  const employees = useEmployees();
  const issueLoan = useIssueLoan();

  const form = useForm({
    initialValues: {
      employeeId: null as string | null,
      dueDate: dateFromToday(7),
      note: '',
    },
    validate: {
      employeeId: (value) => (value ? null : 'Оберіть співробітника'),
      dueDate: (value) => {
        if (!value) return 'Вкажіть дату повернення';
        return value < todayDateOnly() ? 'Дата не може бути в минулому' : null;
      },
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    issueLoan.mutate(
      {
        itemId: item.id,
        employeeId: Number(values.employeeId),
        dueDate: values.dueDate,
        note: values.note.trim() || null,
      },
      {
        onSuccess: (loan) => {
          notifications.show({
            color: 'green',
            message: `${loan.itemName} видано: ${loan.employeeName}`,
          });
          onDone();
        },
      },
    );
  });

  const employeeOptions = (employees.data ?? []).map((employee) => ({
    value: String(employee.id),
    label: `${employee.fullName} · ${employee.department}`,
  }));

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        {issueLoan.error && <Alert color="red">{getErrorMessage(issueLoan.error)}</Alert>}
        <Select
          label="Співробітник"
          withAsterisk
          searchable
          data={employeeOptions}
          placeholder="Почніть вводити імʼя"
          nothingFoundMessage="Нікого не знайдено"
          disabled={employees.isLoading}
          error={employees.error ? getErrorMessage(employees.error) : undefined}
          {...form.getInputProps('employeeId')}
        />
        <TextInput
          label="Повернути до"
          type="date"
          withAsterisk
          min={todayDateOnly()}
          {...form.getInputProps('dueDate')}
        />
        <Textarea label="Примітка" autosize minRows={2} {...form.getInputProps('note')} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onDone}>
            Скасувати
          </Button>
          <Button type="submit" loading={issueLoan.isPending}>
            Видати
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
