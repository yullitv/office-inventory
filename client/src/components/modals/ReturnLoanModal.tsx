import { Alert, Button, Group, Modal, Radio, Stack, Text, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useReturnLoan } from '../../api/hooks';
import type { ItemStatus } from '../../api/types';
import { getErrorMessage } from '../../utils/errors';

export type ReturnTarget = {
  loanId: number;
  itemName: string;
  employeeName: string;
};

type Props = {
  target: ReturnTarget;
  opened: boolean;
  onClose: () => void;
};

export function ReturnLoanModal({ target, opened, onClose }: Props) {
  return (
    <Modal opened={opened} onClose={onClose} title={`Повернення: ${target.itemName}`}>
      <ReturnLoanForm target={target} onDone={onClose} />
    </Modal>
  );
}

function ReturnLoanForm({ target, onDone }: { target: ReturnTarget; onDone: () => void }) {
  const returnLoan = useReturnLoan(target.loanId);

  const form = useForm({
    initialValues: {
      itemStatus: 'available' as ItemStatus,
      note: '',
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    returnLoan.mutate(
      { itemStatus: values.itemStatus, note: values.note.trim() || null },
      {
        onSuccess: () => {
          notifications.show({ color: 'green', message: `${target.itemName} повернуто` });
          onDone();
        },
      },
    );
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        {returnLoan.error && <Alert color="red">{getErrorMessage(returnLoan.error)}</Alert>}
        <Text size="sm">Повертає: {target.employeeName}</Text>
        <Radio.Group label="У якому стані річ?" {...form.getInputProps('itemStatus')}>
          <Stack gap="xs" mt="xs">
            <Radio value="available" label="Справна" />
            <Radio value="in_repair" label="Потребує ремонту" />
            <Radio value="lost" label="Загублена" />
          </Stack>
        </Radio.Group>
        <Textarea
          label="Примітка"
          autosize
          minRows={2}
          maxLength={500}
          {...form.getInputProps('note')}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onDone}>
            Скасувати
          </Button>
          <Button type="submit" loading={returnLoan.isPending}>
            Підтвердити
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
