<template>
    <div class="navigate">
        <div v-for="(item,i) in history" :key="i" @click="$emit('goto', item)">{{ item.chain }} [{{ item.table }}]</div>
        <div @click="$emit('add')">+</div>
    </div>
</template>

<script>

export default {
    name: 'Navigator',
    props: ['history']
}

</script>