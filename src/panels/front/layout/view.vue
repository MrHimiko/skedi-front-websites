<script setup>
// Front panel layout
</script>

<template>
  <div class="front-layout">
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #0f0f0f;
  color: #fff;
}


.content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
</style>