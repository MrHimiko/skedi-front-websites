import '../public/css/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'
/* Directives */
import dropdown from '@directives/dropdown'
import popup from '@directives/popup'
import tooltip from '@directives/tooltip'
/* Logic */
import LogicSession from '@logic/session'
/* Stores */
import { ComponentStore } from '@stores/component';

const app = createApp(App)

export function initializeApp(callback) 
{
    app.use(createPinia())
    app.directive('dropdown', dropdown)
    app.directive('popup', popup)
    app.directive('tooltip', tooltip)
    
    const stores = {
        component: ComponentStore(),
    };
    
    // Keep only the session logic
    new LogicSession(app, router, stores).perform((...data) => 
    {
        callback(app, router, stores, ...data);
        
        router.addRoute({
            path: '/:pathMatch(.*)*',
            name: 'Not Found',
            component: () => import('@pages/404/view.vue'),
        });
    
        app.use(router)
        app.mount('#app')
    });
}

export default app;