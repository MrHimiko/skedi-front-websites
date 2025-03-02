import { SidebarStore } from '@/components/global/sidebar/store';

export default class
{
    constructor(markReady, router)
    {
        this.routes(router);
        this.sidebar()
        
        markReady();
    }

    routes(router)
    {
        router.addRoute({
            path: '/billing',
            name: 'Billing',
            component: () => import('./pages/home/view.vue'),
        });
    }

    sidebar()
    {
        const sidebarStore = SidebarStore();

        sidebarStore.addToBottom({
            label: 'Billing',
            link: '/billing',
            order: 400,
            icon: 'wallet'
        });
    }
}