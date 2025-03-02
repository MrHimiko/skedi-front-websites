import { SettingStore } from '@stores/setting'

const settingStore = SettingStore()

function getSettings() 
{
    return settingStore.get()
}

function getTabSettings(tab) 
{
    return settingStore.getByTab(tab)
}

function getTabs() 
{
    const settingTabs = settingStore.getTabs()

    const tabs = Object.entries(settingTabs).map(([name, data]) => 
    ({
        title: data.name,
        link: `/settings/${name.toLowerCase()}`, 
        count: data.count
    }))

    return [
        {
            title: 'All',
            link: '/settings',
            count: count()
        },
        ...tabs
    ]
}

function count()
{
    return settingStore.count();
}


export 
{
    getTabs,
    getSettings,
    getTabSettings
}
