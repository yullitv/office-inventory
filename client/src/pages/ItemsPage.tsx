import { Anchor, Button, Group, Select, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { Link, useSearchParams } from 'react-router';
import { useCategories, useItems } from '../api/hooks';
import type { ItemState } from '../api/types';
import { DueDate } from '../components/DueDate';
import { ItemActions } from '../components/ItemActions';
import { ItemStateBadge } from '../components/ItemStateBadge';
import { ItemFormModal } from '../components/modals/ItemFormModal';
import { EmptyState, ErrorState, LoadingState } from '../components/states';
import { itemStateLabels } from '../utils/format';

const stateOptions = Object.entries(itemStateLabels).map(([value, label]) => ({ value, label }));

export function ItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? undefined;
  const state = (searchParams.get('state') as ItemState | null) ?? undefined;
  const [debouncedQ] = useDebouncedValue(q, 300);
  const [createOpened, create] = useDisclosure();

  const items = useItems({ q: debouncedQ || undefined, category, state });
  const categories = useCategories();
  const hasFilters = Boolean(q || category || state);

  const setFilter = (key: string, value: string | null) => {
    setSearchParams(
      (params) => {
        if (value) params.set(key, value);
        else params.delete(key);
        return params;
      },
      { replace: true },
    );
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Речі</Title>
        <Button onClick={create.open}>Додати річ</Button>
      </Group>

      <Group grow>
        <TextInput
          placeholder="Пошук за назвою, категорією або інв. номером"
          value={q}
          onChange={(event) => setFilter('q', event.currentTarget.value)}
        />
        <Select
          placeholder="Усі категорії"
          data={categories.data ?? []}
          value={category ?? null}
          onChange={(value) => setFilter('category', value)}
          clearable
        />
        <Select
          placeholder="Будь-який стан"
          data={stateOptions}
          value={state ?? null}
          onChange={(value) => setFilter('state', value)}
          clearable
        />
      </Group>

      {items.isPending && <LoadingState />}
      {items.isError && <ErrorState error={items.error} onRetry={() => items.refetch()} />}
      {items.isSuccess && items.data.length === 0 && (
        <EmptyState
          title={hasFilters ? 'Нічого не знайдено' : 'Ще немає жодної речі'}
          description={hasFilters ? 'Спробуйте змінити пошук або фільтри' : undefined}
          action={
            hasFilters ? (
              <Button variant="light" onClick={() => setSearchParams({})}>
                Скинути фільтри
              </Button>
            ) : (
              <Button onClick={create.open}>Додати першу річ</Button>
            )
          }
        />
      )}
      {items.isSuccess && items.data.length > 0 && (
        <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Назва</Table.Th>
                <Table.Th>Категорія</Table.Th>
                <Table.Th>Стан</Table.Th>
                <Table.Th>У кого / до коли</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.data.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Anchor component={Link} to={`/items/${item.id}`}>
                      {item.name}
                    </Anchor>
                    {item.inventoryNumber && (
                      <Text size="xs" c="dimmed">
                        {item.inventoryNumber}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>{item.category}</Table.Td>
                  <Table.Td>
                    <ItemStateBadge item={item} />
                  </Table.Td>
                  <Table.Td>
                    {item.currentLoan ? (
                      <>
                        <Text size="sm">{item.currentLoan.employeeName}</Text>
                        <DueDate
                          dueDate={item.currentLoan.dueDate}
                          isOverdue={item.currentLoan.isOverdue}
                        />
                      </>
                    ) : (
                      <Text size="sm" c="dimmed">
                        —
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <ItemActions item={item} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <ItemFormModal opened={createOpened} onClose={create.close} />
    </Stack>
  );
}
