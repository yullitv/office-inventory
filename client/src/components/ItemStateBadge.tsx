import { Badge } from '@mantine/core';
import type { Item } from '../api/types';
import { getItemState, itemStateColors, itemStateLabels } from '../utils/format';

export function ItemStateBadge({ item }: { item: Item }) {
  const state = getItemState(item);
  return (
    <Badge color={itemStateColors[state]} variant="light">
      {itemStateLabels[state]}
    </Badge>
  );
}
