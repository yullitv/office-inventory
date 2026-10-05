import { Anchor, Button, Table } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'react-router';
import type { Loan } from '../api/types';
import { DueDate } from './DueDate';
import { ReturnLoanModal } from './modals/ReturnLoanModal';

export function LoansTable({ loans }: { loans: Loan[] }) {
  return (
    <Table.ScrollContainer minWidth={600}>
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Річ</Table.Th>
            <Table.Th>У кого</Table.Th>
            <Table.Th>Повернути до</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loans.map((loan) => (
            <LoanRow key={loan.id} loan={loan} />
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

function LoanRow({ loan }: { loan: Loan }) {
  const [opened, { open, close }] = useDisclosure();

  return (
    <Table.Tr bg={loan.isOverdue ? 'var(--mantine-color-red-light)' : undefined}>
      <Table.Td>
        <Anchor component={Link} to={`/items/${loan.itemId}`}>
          {loan.itemName}
        </Anchor>
      </Table.Td>
      <Table.Td>{loan.employeeName}</Table.Td>
      <Table.Td>
        <DueDate dueDate={loan.dueDate} isOverdue={loan.isOverdue} />
      </Table.Td>
      <Table.Td>
        <Button size="xs" variant="light" onClick={open}>
          Повернути
        </Button>
        <ReturnLoanModal
          target={{ loanId: loan.id, itemName: loan.itemName, employeeName: loan.employeeName }}
          opened={opened}
          onClose={close}
        />
      </Table.Td>
    </Table.Tr>
  );
}
