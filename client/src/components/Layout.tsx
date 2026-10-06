import { AppShell, Button, Container, Group, Title } from '@mantine/core';
import { Link, Outlet, useMatch } from 'react-router';

const links = [
  { to: '/', label: 'Головна' },
  { to: '/items', label: 'Речі' },
  { to: '/loans', label: 'На руках' },
];

function NavButton({ to, label }: { to: string; label: string }) {
  const isActive = useMatch({ path: to, end: to === '/' }) !== null;

  return (
    <Button component={Link} to={to} variant={isActive ? 'light' : 'subtle'}>
      {label}
    </Button>
  );
}

export function Layout() {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Title order={3} visibleFrom="sm">
              Office Inventory
            </Title>
            <Group gap="xs" wrap="nowrap">
              {links.map((link) => (
                <NavButton key={link.to} to={link.to} label={link.label} />
              ))}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="lg">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
