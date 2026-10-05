import { Stack, Text, Title } from '@mantine/core';
import { useLoans } from '../api/hooks';
import { LoansTable } from '../components/LoansTable';
import { EmptyState, ErrorState, LoadingState } from '../components/states';

export function LoansPage() {
  const loans = useLoans({ active: true });

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>На руках</Title>
        <Text c="dimmed" size="sm">
          Усі речі, які зараз видані, від найближчого терміну повернення
        </Text>
      </div>

      {loans.isPending && <LoadingState />}
      {loans.isError && <ErrorState error={loans.error} onRetry={() => loans.refetch()} />}
      {loans.isSuccess && loans.data.length === 0 && (
        <EmptyState title="Зараз нічого не видано" description="Усі речі на своїх місцях" />
      )}
      {loans.isSuccess && loans.data.length > 0 && <LoansTable loans={loans.data} />}
    </Stack>
  );
}
