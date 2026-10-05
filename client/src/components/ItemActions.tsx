import { Button, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { Item } from '../api/types';
import { DeleteItemModal } from './modals/DeleteItemModal';
import { IssueLoanModal } from './modals/IssueLoanModal';
import { ItemFormModal } from './modals/ItemFormModal';
import { ReturnLoanModal } from './modals/ReturnLoanModal';

type Props = {
  item: Item;
  onDeleted?: () => void;
};

export function ItemActions({ item, onDeleted }: Props) {
  const [issueOpened, issue] = useDisclosure();
  const [returnOpened, returnModal] = useDisclosure();
  const [editOpened, edit] = useDisclosure();
  const [deleteOpened, remove] = useDisclosure();

  return (
    <>
      <Group gap="xs" wrap="nowrap">
        {item.state === 'available' && (
          <Button size="xs" onClick={issue.open}>
            Видати
          </Button>
        )}
        {item.state === 'on_loan' && (
          <Button size="xs" variant="light" onClick={returnModal.open}>
            Повернути
          </Button>
        )}
        <Button size="xs" variant="default" onClick={edit.open}>
          Змінити
        </Button>
        <Button
          size="xs"
          variant="subtle"
          color="red"
          onClick={remove.open}
          disabled={item.state === 'on_loan'}
          title={item.state === 'on_loan' ? 'Спочатку поверніть річ' : undefined}
        >
          Видалити
        </Button>
      </Group>

      <IssueLoanModal item={item} opened={issueOpened} onClose={issue.close} />
      {item.currentLoan && (
        <ReturnLoanModal
          target={{
            loanId: item.currentLoan.id,
            itemName: item.name,
            employeeName: item.currentLoan.employeeName,
          }}
          opened={returnOpened}
          onClose={returnModal.close}
        />
      )}
      <ItemFormModal item={item} opened={editOpened} onClose={edit.close} />
      <DeleteItemModal
        item={item}
        opened={deleteOpened}
        onClose={remove.close}
        onDeleted={onDeleted}
      />
    </>
  );
}
