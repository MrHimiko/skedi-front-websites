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

        // Event page route (existing)
        this.router.addRoute({
            path: '/',
            name: 'Home',
            component: () => import('./pages/home/view.vue'),
            props: true
        });


        // Organization page route
        this.router.addRoute({
            path: '/:organizationSlug',
            name: 'OrganizationPage',
            component: () => import('./pages/organization/view.vue'),
            props: true
        });

        // Team page route  
        this.router.addRoute({
            path: '/:organizationSlug/team/:teamSlug',
            name: 'TeamPage',
            component: () => import('./pages/team/view.vue'),
            props: true
        });

        // Event page route (existing)
        this.router.addRoute({
            path: '/:organizationSlug/schedule/:eventSlug',
            name: 'EventPage',
            component: () => import('./pages/event/view.vue'),
            props: true
        });

        console.log('All routes:', this.router.getRoutes());
    }
}