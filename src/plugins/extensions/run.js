export default class 
{
    constructor(app, router, stores, panel) 
    {
        this.app = app;
        this.router = router;
        this.stores = stores;
        this.panel = panel;

        this.routes()
        this.sidebar()
    }

    routes() 
    {
        this.router.addRoute(
        {
            path: '/extensions',
            name: 'Extensions',
            component: () => import('./pages/extensions/'+this.panel+'.vue'),
            beforeEnter: (to, from, next) => 
            {
                this.stores.user.isLogged() ? next() : this.router.replace('/account/login?return=' + to.path);
            }
        })
    }

    sidebar() 
    {
        this.stores.menu.add('sidebar:bottom', 'Extensions', 'extension', '/extensions');
    }
}
