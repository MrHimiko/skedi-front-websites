import runPluginNotifications from '@/plugins/notifications/run';


function runHooks(...imports) 
{
    return [
        runPluginNotifications,
        ...imports
    ];
}

export {
    runHooks
}