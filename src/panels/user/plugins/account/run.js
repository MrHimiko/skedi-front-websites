import { settingCompany } from './settings/company';

export default class
{
    constructor(app, router, stores)
    {
        this.app = app;
        this.router = router;
        this.stores = stores;

        this.stores.menu.add('sidebar:top', 'Builder', 'library_add', '/builder');

        settingCompany(this.stores);
    }
}