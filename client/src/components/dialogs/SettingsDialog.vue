<template>
    <BaseDialog className="settings" name="settings" title="App settings" :buttons="buttons" width="500px"
        @close="onCancel"
        @save="onSave">
        <div class="list-panel">
            <div v-for="(title,i) in tabs" :key="i" @click="tabIndex = i" :selected="tabIndex == i">{{title}}</div>
        </div>
        <div v-if="tabIndex == 0" class="params-panel">
            <div class="group">Paths</div>
            <div class="param">
                <div>Save rule path</div>
                <input v-model="currentOptions.savePath">
                <div>iptables path</div>
                <input v-model="currentOptions.iptables">
            </div>

            <div class="group">Appearance</div>
            <div class="param">
                <div>Theme</div>
                <select></select>
            </div>

            <div class="group">Security</div>
            <div class="param">
                <div>Login</div>
                <input v-model="currentOptions.user">
                <div>Password</div>
                <input v-model="currentOptions.pass">
            </div>
        </div>
        <div v-if="tabIndex == 1" class="params-panel">
            <div class="map header">
                <div>Network</div><div>Alias</div><div>Op</div>
            </div>
            <div class="scroller">
                <div class="map" v-for="(net,i) of currentOptions.net" :key="i">
                    <input placeholder="eth0" v-model="net.eth">
                    <input placeholder="Locale" v-model="net.alias">
                    <div class="icon-button"><v-icon class="fa" name="trash" @click="onRemoveNet(i)"/></div>
                </div>
            </div>
            <button @click="currentOptions.net.push({eth: '', alias: ''})">Add</button>
        </div>
        <div v-if="tabIndex == 2" class="params-panel">
        </div>
    </BaseDialog>
</template>

<script>
import BaseDialog from './BaseDialog';

export default {
    name: 'SettingsDialog',
    components: {
        BaseDialog
    },
    props: ['options'],
    data() {
        return {
            currentOptions: {},
            tabs: ['Global', 'Networks map', 'Ports map'],
            buttons: [{title: 'Cancel', cmd: 'close'}, {title: 'Save', cmd: 'save'}],
            tabIndex: 0
        }
    },
    methods: {
        onCancel() {
            this.currentOptions = JSON.parse(JSON.stringify(this.options))
            this.$modal.hide('settings')
        },
        onSave() {
            this.$emit('save', this.currentOptions)
            this.$modal.hide('settings')
        },
        onRemoveNet(index) {
            this.currentOptions.net.splice(index, 1)
        }
    },
    watch: {
        options(value) {
            this.currentOptions = JSON.parse(JSON.stringify(value))
        }
    }
}
</script>

<style lang="scss">
.settings {
    .dialog-body {
        flex-direction: row !important;
    }
    .list-panel {
        width: 120px;
        margin-right: 7px;
        & > div{
            padding: 3px;
            border-left: 2px solid transparent;
            &:hover {
                background-color: silver;
                cursor: pointer;
            }
            &[selected] {
                border-left-color: green;
            }
        }
    }
    .params-panel {
        flex-grow: 1;
        height: 200px;
        position: relative;
        .scroller {
            top: 23px;
            bottom: 0;
            right: 0;
            left: 0;
            position: absolute;
            overflow: auto;
        }
        .group {
            font-weight: bold;
            background-color: silver;
            padding: 2px 4px;
        }
        .param {
            padding: 3px 0;
            display: grid;
            grid-template-columns: 80px 1fr;
            & > div {
                display: flex;
                align-items: center;
            }
        }
        .map {
            display: grid;
            grid-template-columns: 90px 1fr 30px;
            grid-column-gap: 2px;
            margin-top: 2px;
            .icon-button {
                text-align: center;
                .fa {
                    cursor: pointer;
                }
            }
        }
        .header {
            & > div {
                padding: 3px 5px;
                font-weight: bold;
                background-color: gray;
            }
        }
        & > button {
            position: absolute;
            right: 0;
        }
    }
}
</style>