<template>
    <div class="tabs">
        <div v-for="(tab,i) in tabs" :key="i" class="tab" :active="activeTab == i" @click="$emit('input', activeTab = i)">{{tab}}</div>
    </div>
</template>

<script>
export default {
    name: 'Tabs',
    props: ['tabs'],
    data() {
        return {
            activeTab: 0
        }
    }
}
</script>

<style lang="scss">
.tabs {
    display: flex;
    user-select: none;
    .tab {
        padding: 5px;
        padding-bottom: 2px;
        color: gray;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        &:hover {
            color: black;
        }
        &[active] {
            color: black;
            border-bottom-color: green;
        }
    }
}
</style>