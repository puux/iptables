import Vue from 'vue'
import App from './App.vue'

// icons
import 'vue-awesome/icons/pen'
import 'vue-awesome/icons/trash'
import 'vue-awesome/icons/redo'
import 'vue-awesome/icons/clone'
import 'vue-awesome/icons/arrow-up'
import 'vue-awesome/icons/arrow-down'
import 'vue-awesome/icons/regular/square'
import 'vue-awesome/icons/regular/check-square'
import 'vue-awesome/icons/arrows-alt'
import Icon from 'vue-awesome/components/Icon'
Vue.component('v-icon', Icon)

// Notifications
import Notifications from 'vue-notification'
Vue.use(Notifications)

// Dialogs
import vmodal from 'vue-js-modal'
Vue.use(vmodal)

// Select box
import vSelect from "vue-select";
Vue.component("v-select", vSelect);
import "vue-select/dist/vue-select.css";

// split pannels
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
Vue.component("splitpanes", Splitpanes);
Vue.component("pane", Pane);

// filters
Vue.filter('pad', (value) => {
    var arr = String(Math.abs(value)).split(/(?=(?:...)*$)/);
    return (value < 0 ? '-' : '') + arr.join(" ");
});

Vue.filter('bytes', (value) => {
    let pref = ['', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb']
    let s = 1
    for(let p of pref) {
		if(value < s*1000)
            return (value < 1024 ? value : Math.round(10*value/s)/10) + ' ' + p;
        s *= 1024
    }

	return value + ' b';
});

Vue.filter('short', (value) => {
    let pref = ['', 'K', 'M', 'G', 'T', 'P']
    let s = 1
    for(let p of pref) {
		if(value < s*1000)
            return (value < 1000 ? value : Math.round(10*value/s)/10) + ' ' + p;
        s *= 1000
    }

	return value;
});

window.vm = new Vue({
    el: '#app',
    render: h => h(App)
})
