import { settingAccount } from './settings/account';

export default class 
{
    constructor(app, router, stores) 
    {
        this.app = app;
        this.router = router;
        this.stores = stores;

        this.router.addRoute({
            path: '/account/login',
            name: 'Account - Login',
            component: () => import('./pages/login/view.vue'),
        });

        this.router.addRoute({
            path: '/account/register',
            name: 'Account - Register',
            component: () => import('./pages/register/view.vue'),
        });

        this.router.addRoute({
            path: '/account/recovery',
            name: 'Account - Forgot Password',
            component: () => import('./pages/recovery/view.vue'),
        });

        
        settingAccount(this.stores);
        // settingsCompany(settingStore, this.stores);
        // settingsRoles(settingStore, this.stores);

        // this.routes(router)
        // this.navbar()

        // session().then((data) => 
        // {
        //     const color = data.organization.color;
            
        //     document.documentElement.style.setProperty('--brand-default', color);
        //     document.documentElement.style.setProperty('--brand-hover', color.replace(', 1)', ', 0.85)'));
        //     document.documentElement.style.setProperty('--brand-active', color.replace(', 1)', ', 0.7)'));
        //     document.documentElement.style.setProperty('--brand-stroke', color.replace(', 1)', ', 0.4)'));
        //     document.documentElement.style.setProperty('--brand-fill', color.replace(', 1)', ', 0.2)'));

        //     this.markReady()
        // })
        // .catch(() => 
        // {
        //     router.beforeEach((to) => 
        //     {
        //         if (!logged()) 
        //         {
        //             if (!['/account/login', '/account/recovery', '/account/register'].includes(to.fullPath)) 
        //             {
        //                 router.replace('/account/login')
        //                 return
        //             }
        //         }
        //     })

        //     this.markReady()
        // })
    }

}
