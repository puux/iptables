<template>
    <BaseDialog :name="name" width="400px"
        @close="$modal.hide(name)"
        @ok="$emit('ok', selected, $refs.input.value, $refs.list.value)"
        title="Select or create new chain"
        :buttons="buttons">

        <div class="selected-item">
            <div>Choose existing chain</div>
            <v-select
                :reduce="chan => chan.chain.id"
                v-model="channel"
                label="title"
                :options="chainList"
                placeholder="select chain"
                max-height="200px"
                append-to-body/>
        </div>
        <div class="selected-item">
            <div>Create new chain</div>
            <div><input placeholder="chain name" ref="input"></div>
        </div>
    </BaseDialog>
</template>

<script>
import BaseDialog from './BaseDialog';

export default {
    name: 'SelectChainDialog',
    components: {
        BaseDialog
    },
    props: {
        name: {
            default: 'select-chain',
            type: String
        },
        chainList: {
            default: [],
            type: Array
        }
    },
    data() {
        return {
            buttons: [{title: 'Cancel', cmd: 'close'}, {title: 'Create', cmd: 'ok'}],
            selected: 0,
            channel: ''
        }
    }
}
</script>

<style lang="scss">
.input-dialog .dialog-body {
    display: flex;
    flex-direction: column;
    label {
        display: flex;
        align-items: center;
        padding: 3px;
    }
    .selected-item {
        & > * {
            box-sizing: border-box;
            width: 100%;
        }
        padding-left: 15px;
    }
}
</style>