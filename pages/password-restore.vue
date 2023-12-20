<script setup lang="ts">
const router = useRouter()
const email = ref('abrikoz@gmail.com')
const loading = ref()
const result = ref()
async function submit(){
    loading.value = true
    const {data} = await useNuxtApp().$POST(`/user/request-restore-password`, {email})
    loading.value = false
    result.value = data.value
}
</script>

<template lang="pug">
div
    v-card(v-if="result")
        v-card-title Если такой адрес зарегистрирован, то интсрукции по восстановлению пароля отправлены на него
    v-card(vif="!result")
        v-card-text
            v-text-field(v-model="email" label="Email" )
        v-card-actions
            v-btn(@click="submit" :loading="loading") Восстановить

</template>

<style scoped>

</style>