<template>
    <div class="items">
        <div class="item header">
            <div class="item-check"><CheckBox :value="selectedRules.length" @input="onGlobalSelect"/></div>
            <div class="item-id">ID</div>
            <div class="item-pack">pkts</div>
            <div class="item-bytes">bytes</div>
            <div class="item-rule">RULE</div>
        </div>
        <div class="items-scroller">
            <div class="item row" v-for="rule in preparedRules" :key="rule.id" :selected="rule.selected">
                <div class="item-check"><CheckBox v-if="rule.id" :value="rule.selected" @input="$emit('select', rule.id, $event)"/></div>
                <div class="item-id">{{ rule.id }}</div>
                <div class="item-pack">{{ rule.pkts | short }}</div>
                <div class="item-bytes">{{ rule.bytes | bytes }}</div>
                <select v-if="rule.id == 0 && editRule == rule.id" class="item-rule" @blur="editRule = -1" @input="onGlobalRuleChange">
                    <option v-for="(item,i) in chainGlobalRule" :key="i" :value="item" :selected="rules[0].rule == item">
                        {{item}}
                    </option>
                </select>
                <RuleEditor v-else-if="editRule == rule.id" class="item-rule"
                    @close="editRule = -1"
                    @input="onChangeRule(rule.id, $event)"
                    :value="rule.rule"/>
                <div v-else class="item-rule">
                    <span v-html="parseText(rule.rule)"
                        @mousedown="mouseDownRuleId = rule.rule.substring(0, 2) != '-N' ? (editRule = -1, mouseDownRuleId = rule.id) : -1"
                        @mouseup="rule.id == mouseDownRuleId && mouseDownRuleId >= 0 ? editRule = mouseDownRuleId : 0"
                        />
                        <a @click="$emit('goto', rule.customChain)" href="#" class="ipt-channel">{{rule.customChain}}</a>
                    
                    <div class="controls">
                        <!-- <v-icon @click="editRule = rule.id" class="fa" name="pen"/> -->
                        <!-- <v-icon @click="$emit('remove', rule.id)" v-if="rule.id && editRule == -1" class="fa" name="trash"/> -->
                        <v-icon @click="clone(rule)" class="fa" v-if="rule.id && editRule == -1" name="clone"/>
                        <v-icon @click="resetCounters(rule)" class="fa" name="redo"/>
                    </div>
                </div>
            </div>
            <div class="item row">
                <div class="item-check"></div>
                <div class="item-id">{{ lastRuleId }}</div>
                <div class="item-pack">{{ 0 }}</div>
                <div class="item-bytes">{{ 0 }}</div>
                <RuleEditor class="item-rule" v-model="newRuleText" @input="onAddRule"/>
            </div>
        </div>

        <div class="bottom-panel" v-if="selectedRules.length">
            <button @click="onMoveUp" v-if="selectedRules[0].id > 1"><v-icon class="fa" name="arrow-up"/> Up</button>
            <button @click="onMoveDown" v-if="selectedRules[selectedRules.length-1].id < rules.length-1"><v-icon class="fa" name="arrow-down"/> Down</button>
            <button @click="onRemoveSelected"><v-icon class="fa" name="trash"/> Remove</button>
            <button @click="onMoveToSelected"><v-icon class="fa" name="arrows-alt"/> Move to...</button>
        </div>
    </div>
</template>

<script>

import RuleEditor from './RuleEditor';
import CheckBox from './CheckBox';

export default {
    name: 'Table',
    props: ['rules', 'chainList', 'options'],
    components: {
        RuleEditor,
        CheckBox
    },
    data() {
        return {
            editRule: -1,
            newRuleText: '',
            mouseDownRuleId: -1,
        }
    },
    computed: {
        lastRuleId() {
            return (this.rules.length ? this.rules[this.rules.length-1].id : 0) + 1
        },
        chainGlobalRule() {
            let args = this.rules[0].rule.split(" ")
            return ['-P ' + args[1] + ' ACCEPT', '-P ' + args[1] + ' DROP']
        },
        selectedRules() {
            let list = []
            for(let rule of this.rules)
                if(rule.selected)
                    list.push(rule)
            return list
        },
        preparedRules() {
            let list = []
            for(let rule of this.rules) {
                let args = rule.rule.match(/-j ([A-Z\_0-9]+)/);
                list.push(Object.assign(rule, {
                    customChain: args && this.isUserChain(args[1]) ? args[1] : ''
                }))
            }
            return list
        }
    },
    methods: {
        prepare(ruleText) {
            let result = ruleText.replace(/\/\/(.*)/g, '-m comment --comment "$1"')
            return result
        },
        resetCounters(rule) {
            let text = this.prepare(rule.rule).replace(/\-A ([A-Z\-\_0-9]+)/, (str, chain) => {
                return '-R ' + chain + ' ' + rule.id
            }) + ' -c 0 0'
            this.$emit('command', [text])
        },
        clone(rule) {
            let text = this.prepare(rule.rule).replace(/\-A ([A-Z\-\_0-9]+)/, (str, chain) => {
                return '-I ' + chain + ' ' + (rule.id+1)
            })
            this.$emit('command', [text])
            this.$nextTick( () => this.editRule = rule.id + 1 )
        },
        onChangeRule(ruleId, text) {
            let r = this.prepare(text).replace(/\-A ([A-Z\-\_0-9]+)/, (str, chain) => {
                return '-R ' + chain + ' ' + ruleId
            })
            this.$emit('command', [r])
        },
        onAddRule(text) {
            let rule = this.prepare(text)
            if(!rule.startsWith("-A") && !rule.startsWith("-I"))
                rule = '-A %CHAIN% ' + rule
            this.$emit('command', [rule])
            this.$nextTick(() => this.newRuleText = '')
        },
        /**
         * Change default channel access
         */
        onGlobalRuleChange(event) {
            this.$emit('command', [event.target.value])
        },
        onMoveUp() {
            let ruleId = this.selectedRules[0].id - 1
            let ruleIdInsert = this.selectedRules[this.selectedRules.length-1].id + 1
            let rule = this.prepare(this.rules[ruleId].rule).replace(/\-A ([A-Z\-\_0-9]+)/, (str, chain) => {
                return '-I ' + chain + ' ' + ruleIdInsert
            })

            this.$emit('command', [rule, '-D %CHAIN% ' + ruleId])
            // this.$nextTick(() => {
            //     for(let i = ruleId; i < ruleIdInsert; i++)
            //         this.rules[i].selected = true
            // })
        },
        onMoveDown() {
            let ruleIdInsert = this.selectedRules[0].id
            let ruleId = this.selectedRules[this.selectedRules.length-1].id + 1
            let rule = this.prepare(this.rules[ruleId].rule).replace(/\-A ([A-Z\-\_0-9]+)/, (str, chain) => {
                return '-I ' + chain + ' ' + ruleIdInsert
            })

            this.$emit('command', [rule, '-D %CHAIN% ' + (ruleId + 1)])
            // this.$nextTick(() => {
            //     for(let i = ruleId + 1; i < ruleIdInsert-1; i++)
            //         this.rules[i].selected = true
            // })
        },
        /**
         * Remove all selected rules
         */
        onRemoveSelected() {
            let list = []
            for(let i = this.selectedRules.length-1; i >= 0; i--)
                list.push('-D %CHAIN% ' + this.selectedRules[i].id)
            this.$emit('command', list)
        },
        /**
         * Move selected rules to new channel
         */
        onMoveToSelected() {
            this.$emit('moveto', this.selectedRules)
        },
        /**
         * Is custom channel?
         */
        isUserChain(name) {
            for(let c of this.chainList) {
                if (c.chain.id == name)
                    return true
            }
            return false
        },
        onGlobalSelect(value) {
            for(let rule of this.rules)
                if(rule.id)
                    rule.selected = value
        },
        parseText (text) {
            return text
			// strings
			.replace(/(--log-prefix) "(.*)"/g, function(str, pref, comment){
				return pref + ' <span class="ipt-comment">"' + comment + "\"</span>";
			})
			// comment
			.replace(/(-m comment --comment) "(.*)"(.*)/g, function(str, param, comment, other){
				return other + ' <span class="ipt-comment">//' + comment + "</span>";
			})
			.replace(/(-m comment --comment) ([\w]+)(.*)/g, function(str, param, comment, other){
				return other + ' <span class="ipt-comment">//' + comment + "</span>";
			})
			// network interfaces
			.replace(/(-[o|i]) ([a-z0-9]+)/g, (str, dir, int) => {
                let lan = this.options.net.find((lan) => lan.eth == int)
                return dir + ' <b title="' + int + '">' + (lan ? lan.alias : int) + '</b>';
			})
			// networks
			.replace(/(\-d|\-s|\-\-to\-destination) ([0-9\.\/\:]+)/g, '$1 <span class="ipt-net">$2</span>')
			// ports
			.replace(/(--dport|--sport) ([0-9\.\/\:]+)/g, (str, param, port) => {
				return param + ' <span class="ipt-port" title="' + port + '">' + (this.options.ports.find((p) => p.port == port) || port) + '</span>';
			})
			// rule chain
			.replace(/-j (ACCEPT|DROP)($| )/g, '-j <span class="ipt-$1">$1</span>$2')
			.replace(/-j ([A-Z\_0-9]+)/g, (str, name) => {
				if(!this.isUserChain(name)) {
					return "-j " + name;
				}
				return '';
			});
        },
    }
}
</script>

<style lang="scss">
.items {
    font-family: 'Courier New', Courier, monospace;
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    .item-bytes, .item-id, .item-pack {
        user-select: none;
    }
    .new-rule-panel {
        padding: 4px;
        & > input {
            padding: 1px;
        }
    }
    input {
        padding-left: 2px;
        padding-top: 3px;
    }
    .items-scroller {
        overflow: auto;
        width: 100%;
        flex-grow: 1;
    }
    .bottom-panel {
        display: flex;
        padding: 5px;
        bottom: 0;
        z-index: 1;
        // box-shadow: 1px 0px 7px 4px #a0a0a0;
        & > button {
            display: flex;
            margin-right: 5px;
            & > .fa-icon {
                padding: 0 4px;
            }
        }
    }
}
</style>