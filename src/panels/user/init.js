import { initializeApp } from '@/app'
import { runHooks } from '@/hooks'

import RunUser from '@/panels/user/run';

/* User Plugins */
import RunUserActivity from '@user_activity/run';
import RunUserAccount from '@user_account/run';
import RunUserDashboard from '@user_dashboard/run';
import RunUserTeams from '@user_teams/run';

/* User Extensions */
import RunUserBuilder from '@user_builder/run';

initializeApp((app, router, stores) => 
{   
    const hooks = [
        RunUser, 
        RunUserDashboard,
        RunUserActivity, 
        RunUserAccount,
        RunUserTeams
    ];

    if(stores.extension.has(1))
    {
        hooks.push(RunUserBuilder);
    }

    runHooks(...hooks).forEach((hook) => 
    {
        new hook(app, router, stores, 'user')
    })
});