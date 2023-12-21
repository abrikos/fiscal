import {defineStore} from 'pinia';
import type {Ref} from "vue";

interface IUserPayloadInterface {
    email: string;
    password: string;
}

export const useAuthStore = defineStore('auth', {
    state: () => <{ loggedUser: unknown, loading: Ref<boolean> | unknown, redirect: string }>({
        loggedUser: undefined,
        loading: undefined,
        redirect: ''
    }),
    actions: {
        setRedirect(path: string) {
            this.redirect = path
        },
        async getUser() {
            if (!this.loggedUser) {
                const {data}: any = await useNuxtApp().$GET('/user/checkAuth');
                this.loggedUser = data.value
                return data.value
            } else {
                return this.loggedUser
            }
        },
        async authenticateUser(body: IUserPayloadInterface, strategy: string) {
            // useFetch from nuxt 3
            const {data, pending}: any = await useNuxtApp().$POST(`/user/login/${strategy}`, body);
            if (!data.value) return
            this.loggedUser = data.value
            this.loading = pending;
            const router = useRouter();
            await router.push(this.redirect || '/cabinet')
        },
        async signupUser({email, password}: IUserPayloadInterface) {
            // useFetch from nuxt 3
            const {data, pending} = await useNuxtApp().$PUT('/user/signup', {email, password,});
            this.loading = pending;
            if (!data.value) return
            this.loggedUser = data.value
            const router = useRouter();
            await router.push('/cabinet')
        },
        async logUserOut() {
            await useNuxtApp().$GET('/user/logout')
            this.loggedUser = null
            const router = useRouter();
            this.redirect = ''
            await router.push('/login')

        },
    },
});