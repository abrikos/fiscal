<script setup lang="ts">
definePageMeta({
    middleware: 'auth-middleware' // this should match the name of the file inside the middleware directory
})
const input = ref()
const loading =ref()

async function upload(e: any) {
    loading.value = true
    const formData = new FormData()
    formData.append('file', e.target.files[0])
    await useNuxtApp().$POST('/upload', formData)
    loading.value = false
    input.value.value = null
}
</script>

<template lang="pug">
v-card
    input(type="file" ref="input" @change="upload" accept=".json" hidden)
    v-btn(@click="()=>input.click()" :loading="loading") Выбрать файл
</template>

<style scoped>

</style>