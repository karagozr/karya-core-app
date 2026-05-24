import { HomePage, TasksPage, ProfilePage } from './pages';
import { withNavigationWatcher } from './contexts/navigation-hooks';
import { InventoryFormPage } from './pages/invetory/inventory-form-page';
import { InventoryListPage } from './pages/invetory/inventory-list-page';

const routeData = [
    {
        path: '/tasks/list',
        element: TasksPage
    },
    {
        path: '/tasks/form',
        element: ProfilePage
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
    }
];

export const routes = routeData.map(route => {
    return {
        ...route,
        element: withNavigationWatcher(route.element, route.path)
    };
});
