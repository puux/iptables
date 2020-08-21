<template>
    <BaseDialog :name="name" width="400px"
        @close="$modal.hide(name)"
        @ok="$emit('ok', channel)"
        title="Select or create new chain"
        :buttons="buttons">

        <div class="selected-item">
            <ChannelInput
                :chainList="chainList"
                v-model="channel"
            />
        </div>
    </BaseDialog>
</template>

<script>
import BaseDialog from './BaseDialog';
import ChannelInput from '../ChannelInput';

export default {
    name: 'SelectChainDialog',
    components: {
        BaseDialog,
        ChannelInput
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