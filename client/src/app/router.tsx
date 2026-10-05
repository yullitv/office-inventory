import { createBrowserRouter } from 'react-router';
import { Layout } from '../components/Layout';
import { DashboardPage } from '../pages/DashboardPage';
import { ItemDetailsPage } from '../pages/ItemDetailsPage';
import { ItemsPage } from '../pages/ItemsPage';
import { LoansPage } from '../pages/LoansPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'items', element: <ItemsPage /> },
      { path: 'items/:id', element: <ItemDetailsPage /> },
      { path: 'loans', element: <LoansPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
