import runPluginNotifications from '@/plugins/notifications/run';


function runHooks(...imports) 
{
    return [
        runPluginNotifications,
    ];
}

export {
    runHooks
}