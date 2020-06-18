<template>
    <input type="text" class="rule-editor" @keydown="onKeyDown" @blur="$emit('close')" ref="editor"
        placeholder="enter new rule"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" :value="value"/>
</template>

<script>
export default {
    name: 'RuleEditor',
    props: ['value'],
    methods: {
        onKeyDown(event) {
            switch(event.keyCode) {
                case 13:
                    event.preventDefault()
                    this.$emit('input', event.target.value)
                case 27:
                    this.$emit('close')
                    break;
            }
        }
    },
    mounted() {
        this.$refs.editor.focus()
    }
}
</script>

<style lang="scss">
    .rule-editor {
        outline-width: 1px;
        outline-style: solid;
        outline-offset: -1px;
        background-color: white;
        border: 0;
        outline: 0;
        &:focus {
            outline: 1px solid green;
            outline-offset: -1px;
        }
    }
</style>