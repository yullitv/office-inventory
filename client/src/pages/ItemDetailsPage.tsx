import { Anchor, Badge, Button, Group, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/http';
import { useItem, useLoans } from '../api/hooks';
import { DueDate } from '../components/DueDate';
import { ItemActions } from '../components/ItemActions';
import { ItemStateBadge } from '../components/ItemStateBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/states';
import { formatDate, formatDateTime } from '../utils/format';

export function ItemDetailsPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const item = useItem(id);
  const history = useLoans({ itemId: id });

  if (item.isPending) return <LoadingState />;
  if (item.isError) {
    if (item.error instanceof ApiError && [400, 404].includes(item.error.status)) {
      return (
        <EmptyState
          title="Річ не знайдено"
          description="Можливо, її видалили"
          action={
            <Button component={Link} to="/items" variant="light">
              До списку речей
            </Button>
          }
        />
      );
    }
    return <ErrorState error={item.error} onRetry={() => item.refetch()} />;
  }

  const data = item.data;

  return (
    <Stack gap="lg">
      <Anchor component={Link} to="/items" size="sm">
        ← Усі речі
      </Anchor>

      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Group gap="sm">
            <Title order={2}>{data.name}</Title>
            <ItemStateBadge item={data} />
          </Group>
          <Text c="dimmed">
            {data.category}
            {data.inventoryNumber && ` · ${data.inventoryNumber}`}
          </Text>
          {data.description && <Text>{data.description}</Text>}
        </Stack>
        <ItemActions item={data} onDeleted={() => navigate('/items')} />
      </Group>

      {data.currentLoan && (
        <Paper withBorder p="md">
          <Text fw={500}>Зараз у {data.currentLoan.employeeName}</Text>
          <Group gap="xs">
            <Text size="sm">Повернути до:</Text>
            <DueDate dueDate={data.currentLoan.dueDate} isOverdue={data.currentLoan.isOverdue} />
          </Group>
        </Paper>
      )}

      <Title order={4}>Історія видач</Title>
      {history.isPending && <LoadingState />}
      {history.isError && <ErrorState error={history.error} onRetry={() => history.refetch()} />}
      {history.isSuccess && history.data.length === 0 && (
        <EmptyState title="Цю річ ще жодного разу не видавали" />
      )}
      {history.isSuccess && history.data.length > 0 && (
        <Table.ScrollContainer minWidth={700}>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Кому</Table.Th>
                <Table.Th>Видано</Table.Th>
                <Table.Th>Термін</Table.Th>
                <Table.Th>Повернуто</Table.Th>
                <Table.Th>Примітки</Table.Th>{' '}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {history.data.map((loan) => (
                <Table.Tr key={loan.id}>
                  <Table.Td>{loan.employeeName}</Table.Td>
                  <Table.Td>{formatDateTime(loan.issuedAt)}</Table.Td>
                  <Table.Td>{formatDate(loan.dueDate)}</Table.Td>
                  <Table.Td>
                    {loan.returnedAt ? (
                      formatDateTime(loan.returnedAt)
                    ) : (
                      <Badge color={loan.isOverdue ? 'red' : 'blue'} variant="light">
                        {loan.isOverdue ? 'Прострочено' : 'На руках'}
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {loan.note && (
                      <Text size="sm" c="dimmed">
                        {loan.note}
                      </Text>
                    )}
                    {loan.returnNote && (
                      <Text size="sm" c="dimmed">
                        Під час повернення: {loan.returnNote}
                      </Text>
                    )}
                  </Table.Td>{' '}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Stack>
  );
}
