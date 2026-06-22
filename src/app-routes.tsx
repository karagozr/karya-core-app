import { HomePage, TasksPage } from './pages';
import { withNavigationWatcher } from './contexts/navigation-hooks';
import { InventoryFormPage } from './pages/invetory/inventory-form-page';
import { InventoryListPage } from './pages/invetory/inventory-list-page';
import { InventoryReportPage } from './pages/invetory/inventory-report';
import { UserProfilPage } from './core/pages/user-profil-page';
import { InventoryCategoryListPage } from './pages/inventory-category/inventory-category-list-page';
import { InventoryMainCategoryListPage } from './pages/inventory-main-category/inventory-main-category-list-page';

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
    },
    {
        path: '/inventory-category/list',
        element: InventoryCategoryListPage
    },
    {
        path: '/inventory-main-category/list',
        element: InventoryMainCategoryListPage
    }
];

export const routes = routeData.map(route => {
    return {
        ...route,
        element: withNavigationWatcher(route.element, route.path)
    };
});
