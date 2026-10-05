import { Badge } from '@mantine/core';
import type { Item } from '../api/types';
import { itemStateColors, itemStateLabels } from '../utils/format';

export function ItemStateBadge({ item }: { item: Item }) {
  return (
    <Badge color={itemStateColors[item.state]} variant="light">
      {itemStateLabels[item.state]}
    </Badge>
  );
}
