<template>
    <div class="chain-list">
        <div v-for="(menu,i) in list" :key="i" @click="select(menu.chain)" :visible="!menu.chain || selectedChain && selectedChain.id == menu.chain.id" @mouseleave="selectedChain = null">
            <div class="chain-item" :class="{selected: menu.chain && chain == menu.chain.id}" @mouseenter="onMouseEnter(menu.chain)" @mouseleave="onMouseLeave">{{ menu.title }}</div>
            <div class="tables">
                <div v-for="(item,i) in menu.items" :key="i" @click.stop="select(item.chain)">{{ item.title }}</div>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    name: 'ChainList',
    props: ['list', 'chain', 'table'],
    data() {
        return {
            selectedChain: null,
            timer: 0
        }
    },
    methods: {
        onMouseEnter(chain) {
            this.timer = setTimeout(() => {
                this.selectedChain = chain
            }, 500)
        },
        onMouseLeave() {
            clearTimeout(this.timer)
        },
        select (chain) {
            if (chain)
                this.$emit('select', chain)
        }
    }
}

</script>

<style lang="scss">

</style>