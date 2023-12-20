import {useAuthStore} from '~/store/authStore';
import {storeToRefs} from "pinia"; // import the auth store we just created
export default defineNuxtRouteMiddleware(async (to) => {
    const {getUser, setRedirect} = useAuthStore();
    const loggedUser = await getUser()
    if (!loggedUser && to?.name !== 'login') {
        setRedirect(to.fullPath)
        abortNavigation();
        return navigateTo('/login');
    }
});