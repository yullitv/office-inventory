import { Button } from '@mantine/core';
import { Link } from 'react-router';
import { EmptyState } from '../components/states';

export function NotFoundPage() {
  return (
    <EmptyState
      title="Сторінку не знайдено"
      action={
        <Button component={Link} to="/" variant="light">
          На головну
        </Button>
      }
    />
  );
}
