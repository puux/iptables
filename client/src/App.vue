<template>
    <div class="page" @test="onSaveRules" ref="app">
        <div class="menu">
            <div class="left-button"><v-icon class="fa" name="arrows-alt"/></div>
            <div class="left-button" @click="onSaveRules">SAVE</div>
            <div class="left-button" @click="onLoadRules">LOAD</div>
            <div class="left-button" @click="onSettingsDialog">SET</div>
            <div class="left-button">EXIT</div>
        </div>
        <div class="filters">
            <ChainList :list="chainList" :chain="selectedChain" :table="selectedTable" @select="selectChainTable"/>
            <Navigator :history="history" @goto="onGotoChain($event.chain)" @add="$modal.show('add-chain')"/>
            <splitpanes horizontal>
                <pane style="display: flex;">
                    <Table
                        :rules="ruleList"
                        :chainList="userChainList"
                        :options="options"
                        @command="onQueryCommand"
                        @moveto="onRuleMoveTo"
                        @select="onRuleSelect"
                        @goto="onGotoChain"
                        />
                </pane>
                <pane size="10"  style="display: flex; flex-direction: column;">
                    <div class="tab-controls">
                        <Tabs :tabs="['History', 'Syslog', 'TcpDump']" v-model="activeTabIndex"/>
                        <v-icon class="fa" name="trash" @click="clearLog"/>
                    </div>
                    <div v-if="activeTabIndex == 0" class="command-log">
                        <div v-for="(line, i) in cmdHistory" :key="i">{{line}}</div>
                    </div>
                    <div v-if="activeTabIndex == 1" class="command-log">
                        <div v-for="(line, i) in syslog" :key="i">{{line}}</div>
                    </div>
                </pane>
            </splitpanes>
        </div>
        
        <notifications group="infoline" />
        <SettingsDialog :options="options" @save="onSaveOptions"/>
        <InputDialog name="add-chain" title="Create custom chain" @ok="onAddChain"/>
        <SelectChainDialog :chainList="userChainList" @ok="onMoveToChain"/>
    </div>
</template>
 
<script>

import axios from "axios";

import ChainList from './components/ChainList';
import Navigator from './components/Navigator';
import Table from './components/Table';
import Tabs from './components/Tabs';
import InputDialog from './components/dialogs/InputDialog';
import SelectChainDialog from './components/dialogs/SelectChainDialog';
import SettingsDialog from './components/dialogs/SettingsDialog';

export default {
    name: "app",
    components: {
        ChainList,
        Navigator,
        Table,
        Tabs,
        InputDialog,
        SelectChainDialog,
        SettingsDialog
    },
    data() {
        return {
            chainList: [
                {
                    title: 'INPUT',
                    chain: {id: 'INPUT', table: 'filter'},
                    items: [
                        {title: 'filter', chain: {id: 'INPUT', table: 'filter'}},
                        {title: 'mangle', chain: {id: 'INPUT', table: 'mangle'}}
                    ]
                },
                {
                    title: 'OUTPUT',
                    chain: {id: 'OUTPUT', table: 'filter'},
                    items: [
                        {title: 'filter', chain: {id: 'OUTPUT', table: 'filter'}},
                        {title: 'nat', chain: {id: 'OUTPUT', table: 'nat'}},
                        {title: 'mangle', chain: {id: 'OUTPUT', table: 'mangle'}}
                    ]
                },
                {
                    title: 'FORWARD',
                    chain: {id: 'FORWARD', table: 'filter'},
                    items: [
                        {title: 'filter', chain: {id: 'FORWARD', table: 'filter'}},
                        {title: 'mangle', chain: {id: 'FORWARD', table: 'mangle'}}
                    ]
                },
                {
                    title: 'PREROUTING',
                    chain: {id: 'PREROUTING', table: 'nat'},
                    items: [
                        {title: 'nat', chain: {id: 'PREROUTING', table: 'nat'}},
                        {title: 'mangle', chain: {id: 'PREROUTING', table: 'mangle'}}
                    ]
                },
                {
                    title: 'POSTROUTING',
                    chain: {id: 'POSTROUTING', table: 'nat'},
                    items: [
                        {title: 'nat', chain: {id: 'PREROUTING', table: 'nat'}},
                        {title: 'mangle', chain: {id: 'PREROUTING', table: 'mangle'}}
                    ]
                },
                {
                    title: 'CUSTOM',
                    chain: null,
                    items: []
                },
            ],
            ruleList: [],
            //     { id: 1, pkts: 1000, bytes: 45, rule: '-A INPUT -i storm0 -p tcp -m tcp --dport HTTP -j DROP'},
            //     { id: 2, pkts: 1000, bytes: 45, rule: '-A INPUT -i storm0 -p tcp -m tcp --dport HTTP -j DROP'},
            //     { id: 3, pkts: 100, bytes: 45, rule: '-A INPUT -i storm0 -p tcp -m tcp --dport HTTP -j DROP'},
            //     { id: 4, pkts: 1000, bytes: 45, rule: '-A INPUT -i storm0 -p tcp -m tcp --dport HTTP -j ACCEPT'},
            //     { id: 5, pkts: 10, bytes: 45, rule: '-A INPUT -i BEELINE -m state --state RELATED,ESTABLISHED -j ACCEPT -m comment --comment "уже открытые соединения" '},
            //     { id: 6, pkts: 1000, bytes: 45000, rule: '-A FORWARD -i RT -p tcp -m state --state NEW -m tcp --dport 1146 -j DROP -m comment --comment Team '},
            //     { id: 7, pkts: 1000, bytes: 45000, rule: '-A FORWARD -o docker0 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT'},
            //     { id: 8, pkts: 1000, bytes: 45000, rule: '-A FORWARD -s 220.100.0.0/16 -j DROP'},
            //     { id: 9, pkts: 1000, bytes: 45000, rule: '-A FORWARD -s 220.100.0.0/16 -j DROP'},
            //     { id: 10, pkts: 1000, bytes: 45000, rule: '-A FORWARD -s 220.100.0.0/16 -j DROP'},
            //     { id: 11, pkts: 1000, bytes: 45000, rule: '-A FORWARD -s 220.100.0.0/16 -j DROP'},
            //     { id: 12, pkts: 1000, bytes: 45000, rule: '-A FORWARD -s 220.100.0.0/16 -j DROP'},
            //     { id: 13, pkts: 1000, bytes: 45000, rule: '-A FORWARD -s 220.100.0.0/16 -j DROP'},
            //     { id: 14, pkts: 1000, bytes: 45000, rule: '-A FORWARD -s 220.100.0.0/16 -j DROP'},
            //     { id: 15, pkts: 1000, bytes: 45000, rule: '-A FORWARD -o br-fe6c1e7349fc -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT'},
            //     { id: 16, pkts: 1000, bytes: 45000, rule: '-A FORWARD -i br-fe6c1e7349fc -o br-fe6c1e7349fc -j ACCEPT'},
            // ],
            selectedChain: 'INPUT',
            selectedTable: 'filter',
            history: [ { chain: 'INPUT', table: 'filter' } ],
            inputDlg: { show: true },

            activeTabIndex: 0,
            cmdHistory: [],
            syslog: [],

            moveRuleList: null,
            options: {net: [], ports: []}
        };
    },
    computed: {
        isUserChainSelected() {
            for(let chain of this.chainList) {
                if(chain.id == this.selectedChain)
                    return false;
            }
            return true;
        },
        userChainList() {
            return this.chainList[this.chainList.length-1].items
        }
    },
    methods: {
        clearLog() {
            if (this.activeTabIndex == 0)
                this.cmdHistory = []
            else if (this.activeTabIndex == 1)
                this.syslog = []
        },
        onSettingsDialog() {
            this.$modal.show('settings');
        },
        selectChainTable (chain) {
            this.selectedChain = chain.id
            this.selectedTable = chain.table
            this.history = [];
            this.addHistory();
            this.loadRules();
        },
        onRuleChange(ruleId, ruleText) {
            this.query("-t " + this.selectedTable + ruleText.replace("-A " + this.selectedChain, " -R " + this.selectedChain + " " + ruleId), () => this.loadRules())
        },
        onRuleRemove(ruleList) {
            let list = []
            for(let i = ruleList.length-1; i >= 0; i--)
                list.push("-t " + this.selectedTable + " -D " + this.selectedChain + " " + ruleList[i].id)
            this.query(list, () => this.loadRules())
        },
        onRuleInsert(ruleId, ruleText) {
            let cmd = "-t " + this.selectedTable + ruleText.replace("-A " + this.selectedChain, " -I " + this.selectedChain + " " + ruleId)
            this.query(cmd, () => this.loadRules())
        },
        onRuleMoveTo(ruleList) {
            this.moveRuleList = ruleList
            this.$modal.show('select-chain')
        },
        onQueryCommand(list) {
            let prepared = []
            for(let rule of list) {
                let cmd = '-t ' + this.selectedTable + ' ' + rule.replace('%CHAIN%', this.selectedChain);
                prepared.push(cmd);
                this.cmdHistory.push(cmd);
            }
            this.query(prepared, () => this.loadRules())
        },
        onSaveRules() {
            axios
                .post("http://localhost:1337/save", {}, { withCredentials: true })
                .then(response => {
                    if(response.data.error) {
                        this.handleError(response.data.error)
                    }
                    else {
                        this.handleSuccess("Rules saved")
                        this.loadRules()
                    }
                });
        },
        onLoadRules() {
            axios
                .post("http://localhost:1337/load", {}, { withCredentials: true })
                .then(response => {
                    if(response.data.error) {
                        this.handleError(response.data.error)
                    }
                    else {
                        this.handleSuccess("Rules loaded")
                        this.loadRules()
                    }
                });
        },
        handleError(text) {
            this.$notify({
                type: 'error',
                group: 'infoline',
                title: 'Error',
                duration: 10000,
                text
            });
        },
        handleSuccess(text) {
            this.$notify({
                type: 'success',
                group: 'infoline',
                title: 'Success',
                text
            });
        },
        addHistory() {
            this.history.push({chain: this.selectedChain, table: this.selectedTable});
        },
        onGotoChain(chain) {
            this.selectedChain = chain
            let c = this.history.find((c) => c.chain == chain)
            if(!c)
                this.addHistory()
            this.loadRules()
        },
        onAddChain(name) {
            let chainName = name.toUpperCase()
            this.query("-t " + this.selectedTable + " -N " + chainName, (data) => {
                this.selectedChain = chainName
                this.userChainList.push({
                    title: this.selectedChain + " [" + this.selectedTable + "]",
                    chain: {id: this.selectedChain, table: this.selectedTable}
                })
                this.addHistory()
                this.$modal.hide('add-chain')
                this.loadRules()
            })
        },
        onMoveToChain(selectedIndex, chainName, chainIndex) {
            let commands = []
            let targetChain, targetTable
            // create new chain if need
            if(selectedIndex == 1) {
                commands.push('-t ' + this.selectedTable + ' -N ' + chainName)
                targetChain = chainName
                targetTable = this.selectedTable
            }
            else {
                targetChain = this.userChainList[chainIndex].chain.id
                targetTable = this.userChainList[chainIndex].chain.table
            }
            // add rules to target chain
            for(let rule of this.moveRuleList)
                commands.push("-t " + targetTable + rule.rule.replace("-A " + this.selectedChain, " -A " + targetChain))
            // remove rules from old chain
            for(let i = this.moveRuleList.length-1; i >= 0; i--)
                commands.push("-t " + this.selectedTable + " -D " + this.selectedChain + " " + this.moveRuleList[i].id)
            // insert new rule to current channel
            commands.push("-t " + this.selectedTable + " -I " + this.selectedChain + " " + this.moveRuleList[0].id + " -j " + targetChain)
            
            this.query(commands, () => {
                this.selectedTable = targetTable
                this.onGotoChain(targetChain)
                this.$modal.hide('select-chain')
            })
        },
        onRuleSelect(id, value) {
            this.ruleList[id].selected = !!value
        },
        onSaveOptions(options) {
            this.options = options
            axios
                .post("http://localhost:1337/settings", { options }, { withCredentials: true })
                .then(response => {
                    if(response.data.error) {
                        this.handleError(response.data.error)
                    }
                    else {
                        this.loadRules()
                    }
                });
        },
        loadSettings() {
            axios
                .post("http://localhost:1337/settings", { }, { withCredentials: true })
                .then(response => {
                    if(response.data.error) {
                        this.handleError(response.data.error)
                    }
                    else {
                        this.options = response.data.data.options
                        for(let c of response.data.data.customChannels) {
                            this.userChainList.push({
                                title: c.chain + " [" + c.table + "]",
                                chain: {id: c.chain, table: c.table}
                            })
                        }
                        this.loadRules()
                    }
                });
        },
        loadRules() {
            this.query("-t " + this.selectedTable + " -S " + this.selectedChain + " -v", (data) => {
                let id = 0
                
                // save selections
                let selectedList = {}
                for(let rule of this.ruleList) {
                    if(rule.selected)
                        selectedList[rule.rule] = true
                }

                this.ruleList = []
                for(let rule of data) {
                    if(rule) {
                        let args = rule.match(/-c ([\d]+) ([\d]+)/)
                        let r = rule.replace(/ -c ([\d]+) ([\d]+)/, "")
                        this.ruleList.push({
                            id: id++,
                            pkts: args ? parseInt(args[1]) : 0,
                            bytes: args && args.length > 2 ? parseInt(args[2]) : 0,
                            rule: r,
                            selected: selectedList[r] || false
                        })
                    }
                }
            })
        },
        query(command, func) {
            axios
                .post("http://localhost:1337/query", { command }, { withCredentials: true })
                .then(response => {
                    if(response.data.error) {
                        this.handleError(response.data.error)
                    }
                    else if (func) {
                        console.log("receive", response.data)
                        func(response.data.data)
                    }
                });
        }
    },
    mounted() {
        this.loadSettings()
        //setInterval(() => this.loadRules(), 1000)

        var eventSrc = new EventSource("http://localhost:1337/syslog");
        eventSrc.addEventListener("message", (event) => {
            var data = JSON.parse(event.data);
            for(let l of data.lines)
                this.syslog.push(l);
        }, false);
        eventSrc.addEventListener("error", (event) => {
            // Сообщаем о проблеме с подключением
        }, false);
    }
};
</script>
 
<style lang="scss">
    @import 'style/app.scss';

    .vue-notification {
        box-shadow: 1px 1px 3px 0px #0000007d;
    }

    .tab-controls {
        display: flex;
        align-items: center;
        & > .tabs {
            flex-grow: 1;
        }
        & > .fa-icon {
            cursor: pointer;
            padding: 0 5px;
        }
    }
    .command-log {
        overflow: auto;
        flex-grow: 1;
        & > div {
            padding: 2px;
            &:hover { background-color: silver; }
        }
    }
</style>
