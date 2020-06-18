<template>
    <BaseDialog :name="name"
        @opened="$refs.input.focus()"
        @close="$modal.hide(name)"
        @ok="$emit('ok', $refs.input.value)"
        title="Create custom chain"
        :buttons="buttons">
        <input placeholder="chain name" ref="input">
    </BaseDialog>
</template>

<script>
import BaseDialog from './BaseDialog';

export default {
    name: 'InputDialog',
    components: {
        BaseDialog
    },
    props: {
        name: {
            default: 'input-dialog',
            type: String
        }
    },
    data() {
        return {
            buttons: [{title: 'Cancel', cmd: 'close'}, {title: 'Create', cmd: 'ok'}]
        }
    }
}
</script>
