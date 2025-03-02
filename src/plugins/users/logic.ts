import { SidebarStore } from '@/components/global/sidebar/store'

export default class 
{
    constructor(markReady, router) 
    {
        this.sidebar()
        this.pages(router);

        markReady();
    }

    pages(router) 
    {
        router.addRoute(
        {
            path: '/users/invite',
            name: 'Invite',
            component: () => import('./pages/invite/view.vue')
        })

        router.addRoute(
        {
            path: '/users/staff',
            name: 'Users - Staff',
            component: () => import('./pages/staff/view.vue')
        })
    }

    sidebar() 
    {
        const sidebarStore = SidebarStore()

        sidebarStore.addToBottom(
        {
            order: 200,
            label: 'Staff',
            link: '/users/staff',
            icon: 'group'
        })

        sidebarStore.addToBottom(
        {
            order: 300,
            label: 'Invite',
            link: '/users/invite',
            icon: 'group_add'
        })
    }
}
