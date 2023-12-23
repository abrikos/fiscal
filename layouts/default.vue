<script lang="ts" setup>
import { storeToRefs } from 'pinia'; // import storeToRefs helper hook from pinia
import { useAuthStore } from '~/store/authStore'; // import the auth store we just created
import { useTheme } from 'vuetify'
const theme = useTheme()

//const { getUser } = useAuthStore();
//await getUser()

const { logUserOut } = useAuthStore(); // use authenticateUser action from  auth store
const { loggedUser } = storeToRefs(useAuthStore()); // make authenticated state reactive with storeToRefs

const drawerLeft = ref(true)
const drawerRight = ref(false)
const nightMode = ref(true)


function toggleTheme () {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

</script>
<template lang="pug">
v-app
    NuxtLoadingIndicator
    v-app-bar(density="compact" )
        v-app-bar-title Аггрегатор чеков
        v-btn(to="/") Начало
        v-btn(to="/login" v-if="!loggedUser") Войти
        v-btn(to="/signup" v-if="!loggedUser") Регистрация
        v-btn(to="/upload" v-if="loggedUser") Загрузить JSON
        v-btn(to="/cabinet" v-if="loggedUser") {{loggedUser.name}}
            UserAvatar(:user="loggedUser")
        v-btn(@click="logUserOut" v-if="loggedUser" append-icon="mdi-logout" ) Выйти
        //template(v-slot:prepend)
            v-app-bar-nav-icon(@click.stop="drawerLeft = !drawerLeft")
        template(v-slot:append)
            v-btn(icon="mdi-dots-vertical" @click.stop="drawerRight = !drawerRight")
    v-navigation-drawer(v-model="drawerRight" temporary location="right" )
        v-list
            v-list-item
                v-switch(@click="toggleTheme" v-model="nightMode" label="Ночной режим" )
    v-main
        v-container(fluid="true")
            slot
    NuxtSnackbar
</template>

<style scoped lang="sass">

</style>