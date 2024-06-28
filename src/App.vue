<script setup lang="ts">
import { ref } from 'vue';

const drawer = ref(false);

const toggleDrawer = () => {
    drawer.value = !drawer.value;
};
</script>

<template>
<q-layout>
    <q-header elevated>
        <q-toolbar>
            <!-- navbar title -->
            <q-toolbar-title>
                Snarktor Dashboard
            </q-toolbar-title>

            <!-- This is the top right burger icon to open/close side menu -->
            <q-btn
                flat
                round
                icon="menu"
                @click="toggleDrawer"
            />
        </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" side="right" bordered>
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
</q-layout>
</template>

<style lang="scss">
@import '~quasar/src/css/index.sass';

.q-item--active {
  background-color: var(--q-primary);
  color: white;
}
</style>
