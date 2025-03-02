export function settingsRoles(settingStore)
{
    return;
    
    settingStore.add('roles', 'Account', 'Roles', 'Update your personal information such as your name.', 'account_circle', {
        type: 'PUT',
        endpoint: 'account/data',
        tabs: [
            {
                title: 'General',
                icon: 'settings',
                components: [
                    {
                        type: 'Input',
                        name: 'name',
                        label: 'Name',
                        required: true,
                        width: 12,
                        properties: 
                        {
                            placeholder: '312'
                        }
                    },
                    {
                        type: 'Editor',
                        name: 'name2',
                        label: 'Name',
                        required: true,
                        width: 12,
                        properties: 
                        {
                            placeholder: '312'
                        }
                    },
                    {
                        type: 'Separator',
                        width: 12,
                        properties: 
                        {
                            title: 'Session'
                        }
                    },
                    {
                        type: 'Button',
                        name: 'name2',
                        label: 'Name',
                        width: 6,
                        properties: 
                        {
                            label: 'Logout',
                            onClick: () => 
                            {
                                alert();
                            }
                        }
                    }
                ]
            },
            {
                title: 'Contact',
                icon: 'phone',
                components: [
                    {
                        type: 'Repeater',
                        width: 12,
                        properties: {
                            components: [
                                {
                                    type: 'Input',
                                    name: 'name',
                                    label: 'Name',
                                    required: true,
                                    width: 12,
                                    properties: 
                                    {
                                        placeholder: '312'
                                    }
                                },
                            ]
                        }
                    }
                ]
            },
            {
                title: 'Sessions',
                icon: 'devices',
                components: [
                    {
                        label: 'Session',
                        description: 'View and manage all of your sessions at one place',
                        component: SessionsComponent,
                        width: 12,
                    },
                    {
                        type: 'Empty',
                        width: 9,
                    }
                ]
            }
        ],
        values: () => 
        {
            const userStore = UserStore()

            return {
                name: userStore.getName()
            }
        },
        callback: (...data) => 
        {
            console.log(data)
        }
    });
}
