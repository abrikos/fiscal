<script setup lang="ts">
import {storeToRefs} from 'pinia'; // import storeToRefs helper hook from pinia
import {useAuthStore} from '~/store/authStore'; // import the auth store we just created
const {loggedUser} = storeToRefs(useAuthStore()); // make authenticated state reactive with storeToRefs

const password = ref()
const password2 = ref()
const tab = ref()
const canSubmit = () => {
    return password.value && password.value === password2.value
}

definePageMeta({
    middleware: 'auth-middleware' // this should match the name of the file inside the middleware directory
})

async function submit() {
    const user = loggedUser.value
    if (user) {
        await useNuxtApp().$POST('/user/update', user)
    }
}

async function changePassword() {
    await useNuxtApp().$POST('/user/password', {password: password.value})
    password2.value = undefined
    password.value = undefined
}
</script>

<template lang="pug">
div(v-if="loggedUser")
    h1 Кабинет
    div {{loggedUser}}
    v-tabs(v-model="tab")
        v-tab(value="1" ) Профиль
        v-tab(value="2" ) Смена пароля

    v-window(v-model="tab" )
        v-window-item(value="1" )
            v-card
                v-toolbar
                    v-toolbar-title Профиль
                    v-divider.mx-4(vertical inset v-if="loggedUser.strategy")
                    v-btn(v-if="loggedUser.strategy")
                        //img.strategy(src="/telegram.svg")
                        img.strategy(:src="`/${loggedUser.strategy}.svg`")
                v-card-text
                    v-text-field(v-model="loggedUser.email" label="Email" disabled v-if="!loggedUser.strategy")
                    v-text-field(v-model="loggedUser.name" label="Имя")
                    v-text-field(v-model="loggedUser.avatarImage" label="Фото")
                        template(v-slot:append-inner)
                            //v-fade-transition
                            UserAvatar(:user="loggedUser" )
                v-card-actions
                    v-btn(@click="submit") Сохранить
        v-window-item(value="2" )
            v-card(v-if="!loggedUser.strategy")
                v-toolbar
                    v-toolbar-title  Смена пароля
                v-card-text
                    v-text-field(v-model="password" label="Новый пароль" type="password")
                    v-text-field(v-model="password2" label="Подтверждение пароля" type="password" :rules="[() => password === password2 || 'Пароль и подтверждение должны совпадать']")
                v-card-actions
                    v-btn(@click="changePassword" v-if="canSubmit()") Сохранить

</template>

<style scoped lang="sass">
img.strategy
    //transform: translate(7px, 3px)
    height: 20px
</style>