import { Alert, Button, Center, Loader, Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import { getErrorMessage } from '../utils/errors';

export function LoadingState() {
  return (
    <Center py="xl">
      <Loader />
    </Center>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <Alert color="red" title="Не вдалося завантажити дані">
      <Stack gap="xs" align="flex-start">
        <Text size="sm">{getErrorMessage(error)}</Text>
        {onRetry && (
          <Button size="xs" variant="light" color="red" onClick={onRetry}>
            Спробувати ще раз
          </Button>
        )}
      </Stack>
    </Alert>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Stack align="center" gap="xs" py="xl">
      <Text fw={500}>{title}</Text>
      {description && (
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      )}
      {action}
    </Stack>
  );
}
