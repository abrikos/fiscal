import {defineStore} from 'pinia';

interface UserPayloadInterface {
    email: string;
    password: string;
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        loggedUser: null,
        loading: false,
        redirect: ''
    }),
    actions: {
        setRedirect(path: string) {
            this.redirect = path
        },
        async getUser() {
            if(!this.loggedUser) {
                const {data}: any = await useNuxtApp().$GET('/user/checkAuth');
                this.loggedUser = data.value
                return data.value
            }else{
                return this.loggedUser
            }
        },
        async authenticateUser(body: UserPayloadInterface, strategy: string) {
            // useFetch from nuxt 3
            const {data, pending}: any = await useNuxtApp().$POST(`/user/login/${strategy}`, body);
            if (!data.value) return
            this.loggedUser = data.value
            this.loading = pending;
            const router = useRouter();
            await router.push(this.redirect || '/cabinet')
        },
        async signupUser({email, password}: UserPayloadInterface) {
            // useFetch from nuxt 3
            const {data, pending}: any = await useNuxtApp().$PUT('/user/signup', {email, password,});
            this.loading = pending;
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