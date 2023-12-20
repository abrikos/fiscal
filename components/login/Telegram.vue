<script setup>
import { useAuthStore } from '~/store/authStore.ts';
const { authenticateUser } = useAuthStore(); // use authenticateUser action from  auth store
const holder = ref(null)
function login(data){
    authenticateUser(data, 'telegram')
}

onMounted(()=>{
    window.onTelegramAuth = async function (user) {
        login(user)
    }
    const tgScript = document.createElement('script')
    tgScript.async = true
    tgScript.src = "https://telegram.org/js/telegram-widget.js?22"
    tgScript.setAttribute('data-telegram-login', 'AbrikosGames_bot')
    tgScript.setAttribute('data-onauth', 'window.onTelegramAuth(user)')
    tgScript.setAttribute('data-request-access', 'write')
    tgScript.setAttribute('data-size', 'large')
    document.getElementById('holder').appendChild(tgScript);
})

</script>

<template lang="pug">
div#holder
</template>

<style scoped>

</style>
