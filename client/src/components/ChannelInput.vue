<template>
    <div class="channel-input">
        <input @input="onChange" :value="currentValue" placeholder="Select channel or create new">
        <v-icon class="fa" :name="collapse ? 'arrow-up' : 'arrow-down'" @click="collapse = !collapse"/>
        <div class="list" v-if="collapse">
            <div class="item" v-for="(chan, i) in chainList" @click="onSelect(i)" :key="chan.id">{{ chan.title }}</div>
        </div>
    </div>
</template>

<script>

export default {
    name: 'ChannelInput',
    props: ['value', 'chainList'],
    data() {
        return {
            currentValue: this.value,
            collapse: false
        }
    },
    methods: {
        onChange(event) {
            this.currentValue = event.target.value
            this.$emit('input', this.currentValue)
        },
        onSelect(index) {
            this.currentValue = this.chainList[index].chain.id
            this.$emit('input', this.currentValue)
            this.collapse = false
        }
    },
    watch: {
        value(value) {
            this.currentValue = value
        }
    }
}

</script>

<style lang="scss">

.channel-input {
    display: flex;
    align-items: center;
    border: 1px solid gray;
    padding: 2px;
    position: relative;
    & > input {
        flex-grow: 1;
        border: 0;
        outline: 0;
        padding: 3px 4px;
    }
    & .fa {
        cursor: pointer;
        user-select: none;
        &:hover {
            color: red;
        }
    }
    & > .list {
        position: absolute;
        width: 100%;
        top: 25px;
        background-color: white;
        border: 1px solid gray;
        left: -1px;
        & > .item {
            padding: 3px;
            &:hover {
                background-color: silver;
            }
        }
    }
}

</style>