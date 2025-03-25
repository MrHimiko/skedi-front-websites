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
        
    }

    sidebar() 
    {
        this.stores.menu.add('sidebar:bottom', 'Extensions', 'extension', '/extensions');
    }
}
