export default class
{
    constructor(app, router, stores) 
    {
        this.app = app;
        this.router = router;
        this.stores = stores;
    
        this.routes()

        console.log('Routes after registration:', this.router.getRoutes());
    }

    routes()
    {

        this.router.addRoute({
            path: '/test',
            name: 'FrontHome',
            component: () => import('./pages/home/view.vue'),
        });


        this.router.addRoute({
            path: '/:organizationSlug/:eventSlug',
            name: 'EventPage',
            component: () => import('./pages/event/view.vue'),
        });

        console.log('All routes:', this.router.getRoutes());

    }

}