import { initializeApp } from '@/app'
import { runHooks } from '@/hooks'

import RunUser from '@/panels/front/run';




initializeApp((app, router, stores) => 
{   
    const hooks = [
        RunUser, 
    ];


    runHooks(...hooks).forEach((hook) => 
    {
        new hook(app, router, stores, 'front')
    })
});