<script setup>
    import './style.css';

    import { ref } from 'vue';

    import { form } from '@utils/form';

    import TabsComponent from '@global/tabs/view.vue';

    import Input from '@form/input/view.vue';
    import Textarea from '@form/textarea/view.vue';
    import Select from '@form/select/view.vue';
    import Button from '@form/button/view.vue';
    import Toggle from '@form/toggle/view.vue';
    import Color from '@form/color/view.vue'; 
    import Date from '@form/date/view.vue'; 
    import Editor from '@form/editor/view.vue'; 
    import Options from '@form/options/view.vue'; 
    import Separator from '@global/separator/view.vue'; 
    import Holder from '@global/holder/view.vue'; 
    import Repeater from '@/components/repeater/view.vue'; 

    const components = {
        Input,
        Textarea,
        Select,
        Button,
        Toggle,
        Options,
        Color,
        Date,
        Editor,
        Separator,
        Repeater,
        Holder
    };

    defineProps({
        values: Function,
        endpoint: String,
        type: String,
        as: String,
        callback: Function,
        survey: {
            type: Boolean
        },
        actions: {
            type: Boolean,
            default: true
        },
        tabs: {
            type: Array,
            required: true
        }
    });

    const activeTab = ref(0);
    const activeValues = ref(null);

    function changeTab(event, object, index) 
    {
        activeTab.value = index;
    }

    function setTab(index) 
    {
        activeTab.value = index;
    }

    function getValue(key, values) 
    {
        if(activeValues.value === null) 
        {
            activeValues.value = values ? values() : {};
        }
        
        return key in activeValues.value ? activeValues.value[key] : null;
    }
</script>

<template>
    <form @submit="event => endpoint ? form.toAPI(event, type, endpoint, callback) : form.getData(event, callback)" 
        :class="['c-builder', (tabs.length > 1 ? 'tabs' : ''), as]">
        
        <!-- Content -->
        <div class="content">
            <div>
                <!-- Tabs -->
                <div v-if="!survey && tabs.length > 1" class="tabs">
                    <tabs-component :onClick="changeTab" as="column" :active="tabs[activeTab]?.title" :tabs="tabs"></tabs-component>
                </div>

                <!-- Components -->
                <div class="components">
                    <!-- Tabs -->
                    <div v-for="(tab, tabIndex) in tabs" :key="tabIndex" class="grid gap-2xl grid-12">
                        <!-- Tab -->
                        <div v-show="activeTab === tabIndex" v-for="(item, itemIndex) in tab.components" :key="itemIndex" 
                            :style="'grid-column: span ' + (item.width ? item.width : 6)">
                            
                            <!-- Top -->
                            <div v-if="item.label || item.description" class="top flex-between">
                                <div class="left">
                                    <label class="text-xs" v-if="item.label">{{ item.label }}</label>
                                    <p class="text-xs text-secondary" v-if="item.description">{{ item.description }}</p>
                                </div>
                                <div class="right">
                                    <span class="text-xs text-secondary" v-if="item.required">Required</span>
                                </div>
                            </div>

                            <div v-if="item.type === 'empty'"></div>
                            
                            <!-- Component -->
                            <div v-if="item.type !== 'empty'">
                                <component 
                                    :as="as === 'form' ? 'bg1' : null"
                                    :is="item.component ? item.component : components[item.type]" 
                                    :name="item.name" 
                                    :value="getValue(item.name, values)" 
                                    v-bind="item.properties"
                                />
                            </div>
                        </div>

                        <div v-if="survey && activeTab === tabIndex" v-show="activeTab === tabIndex" class="flex-center" style="grid-column: span 12;">
                            <div class="flex gap-xl">
                                <div class="c-button stroke pointer" @click="setTab(tabIndex - 1)" v-if="tabIndex !== 0" as="stroke">Previous</div>
                                <div class="c-button brand pointer" @click="setTab(tabIndex + 1)">{{ tab.next ?? 'Next' }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div v-if="!survey && actions" class="actions grid grid-2 gap-2xl">
            <div>
                <div class="c-button tertiary pointer i-popup-close" as="stroke">Close</div>
            </div>
            <div>
                <Button type="submit" label="Save"></Button>
            </div>
        </div>
    </form>
</template>
