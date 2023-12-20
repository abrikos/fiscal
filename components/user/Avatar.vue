<script setup lang="ts">
const props = defineProps({
    user: {type: Object, required: true}
})
const {user} = props
const valid = ref()
try {
    const url = new URL(user.avatarImage)
    valid.value = !!url
}catch (e) {
    
}
</script>

<template lang="pug">
img.avatar(:src="valid ? user.avatarImage : '/avatar.png'" onerror="this.src='/avatar.png'")
</template>

<style scoped lang="sass">
.avatar
    width: 30px
    height: 30px
    border-radius: 15px
    border: 1px solid gray
    margin: 2px
</style>