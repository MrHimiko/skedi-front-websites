import { initializeApp } from '@/app'
import { runHooks } from '@/hooks'

import RunFront from '@/panels/front/run';

/* User Plugins */
import RunFrontEvents from '@front_events/run';


initializeApp((app, router, stores) => 
{   
    const hooks = [
        RunFront, 
        RunFrontEvents,
    ];


    runHooks(...hooks).forEach((hook) => 
    {
        new hook(app, router, stores, 'front')
    })
});