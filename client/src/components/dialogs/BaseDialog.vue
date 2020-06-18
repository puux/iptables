<template>
    <modal :name="name" :classes="['input-dialog', 'std-dialog', className]" :width="width" height="auto" @opened="$emit('opened')">
        <div class="dialog-title">{{title}}</div>
        <div class="dialog-body">
            <slot></slot>
        </div>
        <div class="dialog-buttons">
            <button v-for="btn of buttons" :key="btn.cmd" @click="$emit(btn.cmd)">{{btn.title}}</button>
        </div>
    </modal>
</template>

<script>

export default {
    name: 'BaseDialog',
    props: {
        width: {
            default: '300px',
            type: String
        },
        name: {
            default: '',
            type: String
        },
        title: {
            default: '',
            type: String
        },
        buttons: {
            default: [],    // { title: '', cmd: '' }
            type: Array
        },
        className: {
            default: '',
            type: String
        }
    }
}
</script>

<style lang="scss">
.input-dialog {
    .dialog-title {
        text-align: center;
        font-weight: bold;
        padding: 5px;
        font-size: 14px;
    }
    .dialog-body {
        padding: 15px;
        & > input {
            width: 100%;
            box-sizing: border-box;
        }
    }
    .dialog-buttons {
        padding: 0 15px;
        padding-bottom: 15px;;
        text-align: right;
        & > button {
            margin-left: 5px;
        }
    }
}
</style>