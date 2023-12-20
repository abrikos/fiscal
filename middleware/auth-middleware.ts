import {useAuthStore} from '~/store/authStore';
export default defineNuxtRouteMiddleware(async (to) => {
    const {getUser, setRedirect} = useAuthStore();
    const loggedUser = await getUser()
    if (!loggedUser && to?.name !== 'login') {
        setRedirect(to.fullPath)
        abortNavigation();
        return navigateTo('/login');
    }
});