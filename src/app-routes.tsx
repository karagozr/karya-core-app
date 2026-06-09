import { HomePage, TasksPage } from './pages';
import { withNavigationWatcher } from './contexts/navigation-hooks';
import { InventoryFormPage } from './pages/invetory/inventory-form-page';
import { InventoryListPage } from './pages/invetory/inventory-list-page';
import { InventoryReportPage } from './pages/invetory/inventory-report';
import { UserProfilPage } from './core/pages/user-profil-page';

const routeData = [
    {
        path: '/tasks/list',
        element: TasksPage
    },
    {
        path: '/profile',
        element: UserProfilPage
    },
    {
        path: '/home',
        element: HomePage
    },
    {
        path: '/inventory/list',
        element: InventoryListPage
    },
    {
        path: '/inventory/form',
        element: InventoryFormPage
    },
    {
        path: '/inventory/report',
        element: InventoryReportPage
    }
];

export const routes = routeData.map(route => {
    return {
        ...route,
        element: withNavigationWatcher(route.element, route.path)
    };
});
