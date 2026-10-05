import { Alert, Anchor, Card, Paper, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useDashboard } from '../api/hooks';
import type { ItemState } from '../api/types';
import { LoansTable } from '../components/LoansTable';
import { ErrorState, LoadingState } from '../components/states';
import { itemStateColors, itemStateLabels } from '../utils/format';

const stateOrder: ItemState[] = ['available', 'on_loan', 'in_repair', 'lost'];

export function DashboardPage() {
  const dashboard = useDashboard();

  if (dashboard.isPending) return <LoadingState />;
  if (dashboard.isError) {
    return <ErrorState error={dashboard.error} onRetry={() => dashboard.refetch()} />;
  }

  const { counts, overdue, dueSoon, inRepair } = dashboard.data;
  const nothingToDo = overdue.length === 0 && dueSoon.length === 0 && inRepair.length === 0;

  return (
    <Stack gap="lg">
      <Title order={2}>Що потребує уваги</Title>

      <SimpleGrid cols={{ base: 2, sm: 5 }}>
        <StatCard label="Усього речей" value={counts.total} to="/items" />
        {stateOrder.map((state) => (
          <StatCard
            key={state}
            label={itemStateLabels[state]}
            value={counts[state]}
            color={itemStateColors[state]}
            to={`/items?state=${state}`}
          />
        ))}
      </SimpleGrid>

      {nothingToDo && (
        <Alert color="green" title="Усе під контролем">
          Немає прострочених видач і речей у ремонті.
        </Alert>
      )}

      {overdue.length > 0 && (
        <Section title={`Прострочені (${overdue.length})`} color="red">
          <LoansTable loans={overdue} />
        </Section>
      )}

      {dueSoon.length > 0 && (
        <Section title={`Повернути сьогодні або завтра (${dueSoon.length})`}>
          <LoansTable loans={dueSoon} />
        </Section>
      )}

      {inRepair.length > 0 && (
        <Section title={`У ремонті (${inRepair.length})`} color="orange">
          <Table>
            <Table.Tbody>
              {inRepair.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Anchor component={Link} to={`/items/${item.id}`}>
                      {item.name}
                    </Anchor>
                  </Table.Td>
                  <Table.Td c="dimmed">{item.description}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Section>
      )}
    </Stack>
  );
}

function StatCard({
  label,
  value,
  color,
  to,
}: {
  label: string;
  value: number;
  color?: string;
  to: string;
}) {
  return (
    <Card withBorder component={Link} to={to}>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="xl" fw={700} c={color}>
        {value}
      </Text>
    </Card>
  );
}

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color?: string;
  children: ReactNode;
}) {
  return (
    <Paper withBorder p="md">
      <Title order={4} c={color} mb="sm">
        {title}
      </Title>
      {children}
    </Paper>
  );
}
