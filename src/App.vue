<script setup lang="ts">
import { ref, provide } from 'vue';

const drawer = ref(false);
const loadDataTrigger = ref(0);
const showSettingsTrigger = ref(false);

// const toggleDrawer = () => {
//     drawer.value = !drawer.value;
// };

const emits = defineEmits(['load-data', 'show-settings']);

const emitLoadData = () => {
  loadDataTrigger.value++;
};
provide('loadDataTrigger', loadDataTrigger);

const emitShowSettings = () => {
    showSettingsTrigger.value = !showSettingsTrigger.value;
};

provide('loadDataTrigger', loadDataTrigger);
provide('showSettingsTrigger', showSettingsTrigger);

</script>

<template>
<q-layout>
    <q-header elevated> 
        <q-toolbar class="bg-navbar text-navbar" >
            <!-- <q-btn flat round icon="menu" @click="toggleDrawer" /> -->

            <img class='navbar-image' src="./assets/telos-logo.svg" alt="telos logo">

            <q-space />
                <div class="items-center justify-center gt-sm text-header">Live SNARKtor ZK Proof Aggregation Dashboard</div>
            <q-space />
            
            <img class='navbar-image' src="./assets/telos-snarktor.svg" alt="snarktor logo">
            <q-btn flat round dense icon="refresh" @click="emitLoadData"/>
            <q-btn flat round dense icon="settings" @click="emitShowSettings"/>
        </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" side="left" bordered>
        <q-list>
            <q-item to="/dashboard" active-class="q-item--active">
                <q-item-section>Dashboard</q-item-section>
            </q-item>
            <q-item to="/test1" active-class="q-item--active">
                <q-item-section>Test1</q-item-section>
            </q-item>
            <q-item to="/test2" active-class="q-item--active">
                <q-item-section>Test2</q-item-section>
            </q-item>
        </q-list>
    </q-drawer>

    <q-page-container>
        
        <!-- This is where all pages render -->
        <router-view />

    </q-page-container>

    <q-footer class="q-pb-sm">
      <q-toolbar>
        <!-- <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          <div>Title</div>
        </q-toolbar-title> -->
        <q-space />
            <div>

                <div class="column items-center">
                    <div class="text-footer center">Telos Snarktor Dashboard</div>
                </div>

                <div class="items-center q-mt-sm">
                    <img src="./assets/telos-snarktor.svg" alt="Telos Logo" style="width: 143px; height: 25px; margin-right:10px"/>
                    <img src="./assets/telos-zkevm.png" alt="Telos Logo" style="width: 146px; height: 32px; margin-top: -8px; margin-left:10px"/>
                </div>
                
            </div>
        <q-space />
      </q-toolbar>
    </q-footer>

</q-layout>
</template>

<style lang="scss">
@import '~quasar/src/css/index.sass';
@import 'src/css/app.scss';

.q-item--active {
  background-color: var(--q-primary);
  color: white;
}

.q-toolbar__title {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
}

.text-footer {
    color: #404142;
    font-family: "Silka";
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 24px;
}
.text-header {
    color: #404142;
    font-family: Silka;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 24px;
}

</style>
