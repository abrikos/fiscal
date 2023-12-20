<script setup lang="ts">
import { useAuthStore } from '~/store/authStore';
const { authenticateUser, loggedUser } = useAuthStore(); // use authenticateUser action from  auth store
const router = useRouter()
//if(loggedUser) router.push('/cabinet')
const user = ref({email: 'abrikoz@gmail.com', password: '29db'})
async function submit(){
    await authenticateUser(user.value,'password')
}

</script>

<template lang="pug">
div.d-flex.align-center.flex-column
    v-card(width="600" )
        v-card-text
            v-text-field(v-model="user.email" label="Email" )
            v-text-field(v-model="user.password" label="Пароль" type="password" )
        v-card-actions
            v-btn(@click="submit") Войти
            LoginTelegram
            v-spacer
            v-btn(@click="router.push('/password-restore')") Восстановить пароль

</template>

<style scoped>

</style>