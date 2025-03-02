import runPluginAccount from '@/plugins/account/run'
import runPluginSettings from '@/plugins/settings/run'
import runPluginExtensions from '@/plugins/extensions/run';
import runPluginNotifications from '@/plugins/notifications/run';
import runPluginSearch from '@/plugins/search/run';

function runHooks(...imports) 
{
    return [
        runPluginAccount, 
        runPluginSettings, 
        runPluginExtensions,
        runPluginNotifications,
        runPluginSearch,
        ...imports
    ];
}

export {
    runHooks
}