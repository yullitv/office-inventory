import { Text } from '@mantine/core';
import { describeDueDate, formatDate } from '../utils/format';

export function DueDate({ dueDate, isOverdue }: { dueDate: string; isOverdue: boolean }) {
  return (
    <Text size="sm" c={isOverdue ? 'red' : undefined} fw={isOverdue ? 600 : undefined}>
      {formatDate(dueDate)}{' '}
      <Text span size="xs" c={isOverdue ? 'red' : 'dimmed'}>
        ({describeDueDate(dueDate)})
      </Text>
    </Text>
  );
}
