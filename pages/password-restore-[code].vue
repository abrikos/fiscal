<script setup lang="ts">
const {params} = useRoute()
const {data} = await useNuxtApp().$POST(`/user/process-restore-password`, params)
</script>

<template lang="pug">
v-card
    v-card-title Новый пароль отправлен на указанный e-mail
</template>

<style scoped>

</style>