<template>
    <div class="checkbox" @mousedown="$emit('mousedown', $event)">
        <v-icon class="fa"
            scale="1"
            :name="currentValue ? 'regular/check-square' : 'regular/square'"
            @click="onClick"/>
    </div>
</template>

<script>

export default {
    name: 'CheckBox',
    props: ['value'],
    data() {
        return {
            currentValue: this.value
        }
    },
    methods: {
        onClick() {
            this.currentValue = !this.currentValue
            this.$emit('input', this.currentValue)
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

.checkbox {
    display: flex;
    justify-content: center;
    cursor: pointer;
    & > .far {
        height: 14px;
    }
}

</style>