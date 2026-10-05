import { AppShell, Button, Container, Group, Title } from '@mantine/core';
import { NavLink, Outlet } from 'react-router';

const links = [
  { to: '/', label: 'Головна' },
  { to: '/items', label: 'Речі' },
  { to: '/loans', label: 'На руках' },
];

export function Layout() {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between">
            <Title order={3}>Office Inventory</Title>
            <Group gap="xs">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.to === '/'}>
                  {({ isActive }) => (
                    <Button variant={isActive ? 'light' : 'subtle'}>{link.label}</Button>
                  )}
                </NavLink>
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
