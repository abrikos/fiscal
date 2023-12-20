<script setup lang="ts">
const props = defineProps<{ str: string }>()

function copy(){
    navigator.clipboard.writeText(props.str);
}
</script>

<template lang="pug">
v-btn(icon="mdi-clipboard" @click="copy")
</template>

<style scoped lang="sass">

</style>