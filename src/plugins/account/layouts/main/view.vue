<script setup>
    import './style.css'
</script>

<template>
    <div class="account-l-main">
        <div>
            <div>
                <slot name="content"></slot>
            </div>
        </div>
        <div>
            <img src="/images/account/background.webp"/>
        </div>
    </div>
</template>
