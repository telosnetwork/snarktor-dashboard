<script setup lang="ts">
import { onMounted, watch, reactive, watchEffect, inject, Ref, ref } from 'vue';
import { DataProcessor, getDataProcessor } from 'src/data';
import { config } from 'src/config';
import { Layout, NodeListLayout } from '../types';
import { calculateBestRadius, clearCanvas, renderListOfNodes, renderTree } from 'src/render';

// Load config from localStorage if available, otherwise use default
const storedConfig = localStorage.getItem('config');
const activeConfig = storedConfig ? JSON.parse(storedConfig) : config;
const reactiveConfig = reactive(activeConfig);

// Watch for changes in reactiveConfig and store it in localStorage
watch(reactiveConfig, (newConfig) => {
    localStorage.setItem('config', JSON.stringify(newConfig));
}, { deep: true });

const prepareLayout = (dataProvider: DataProcessor): Layout => {
    const aggregated_svg = document.querySelector('svg.aggregated.trees') as SVGSVGElement;
    const submitted_svg = document.querySelector('svg.submitted.trees') as SVGSVGElement;
    const received_svg = document.querySelector('svg.received.nodes') as SVGSVGElement;

    const aggregated_bounds = aggregated_svg.getBoundingClientRect();
    const submitted_bounds = submitted_svg.getBoundingClientRect();
    const received_bounds = received_svg.getBoundingClientRect();
        
    return {
        received: {
            height: received_bounds.height,
            width: received_bounds.width,
            count: dataProvider.getBaseProofs().length,
            h_offset: 0, // to be set later
            v_offset: 0, // to be set later
        },
        aggregated: {
            height: aggregated_bounds.height,
            width: aggregated_bounds.width,
            count: dataProvider.getAggregatedProofs().length,
            h_offset: 0, // to be set later
            v_offset: 0, // to be set later
        },
        submitted: {
            height: submitted_bounds.height,
            width: submitted_bounds.width,
            count: dataProvider.getSubmittedProofs().length,
            h_offset: 0, // to be set later
            v_offset: 0, // to be set later
        }
    }
}

const renderReceivedProofs = (dataProvider: DataProcessor, layout: Layout) => {
    const list = dataProvider.getBaseProofs();
    const selector = 'svg.received.nodes';
    clearCanvas(selector);
    renderListOfNodes(list, selector, activeConfig, {
        nodeRadius: 16,
        ... activeConfig.received
    } as NodeListLayout);
}

const renderAggregatedTrees = (dataProvider: DataProcessor, layout: Layout) => {
    console.log('renderAggregatedTrees()');
    const selector = 'svg.aggregated.trees';
    clearCanvas(selector);

    for (let i=0; i<layout.aggregated.count; i++) {
        const tree = dataProvider.getAggregatedProofs()[i];

        if (activeConfig.rows === 1) {
            // This prints all trees in a single row
            const width = layout.aggregated.width / layout.aggregated.count;
            const height = layout.aggregated.height;
            renderTree(tree, selector, activeConfig, {
                width,
                height,
                h_offset: i * width,
                v_offset: 0,
                leavesUpwards: activeConfig.leavesUpwards,
                nodeRadius: calculateBestRadius(tree, activeConfig)
            });
        }
        if (activeConfig.rows === 2) {
            // This prints all trees in two rows
            const width = layout.aggregated.width / Math.ceil(layout.aggregated.count/2);
            const height = layout.aggregated.height / 2;
            renderTree(tree, selector, activeConfig, {
                width,
                height,
                h_offset: (i % 2) * width,
                v_offset: Math.floor(i / 2) * height,
                leavesUpwards: activeConfig.leavesUpwards,
                nodeRadius: calculateBestRadius(tree, activeConfig)
            });
        }
    }
}

const renderSubmittedTrees = (dataProvider: DataProcessor, layout: Layout) => {
    const selector = 'svg.submitted.trees';
    clearCanvas(selector);
    for (let i=0; i<layout.submitted.count; i++) {
        const tree = dataProvider.getSubmittedProofs()[i].ser_merkle_node;
        if (activeConfig.rows === 1) {
            // This prints all trees in a single row
            const width = layout.submitted.width / layout.submitted.count;
            const height = layout.submitted.height;
            renderTree(tree, selector, activeConfig, {
                width,
                height,
                h_offset: i * width,
                v_offset: 0,
                leavesUpwards: activeConfig.leavesUpwards,
                nodeRadius: calculateBestRadius(tree, activeConfig)
            });
        }
        if (activeConfig.rows === 2) {
            // This prints all trees in two rows
            const width = layout.submitted.width / Math.ceil(layout.submitted.count/2);
            const height = layout.submitted.height / 2;
            renderTree(tree, selector, activeConfig, {
                width,
                height,
                h_offset: (i % 2) * width,
                v_offset: Math.floor(i / 2) * height,
                leavesUpwards: activeConfig.leavesUpwards,
                nodeRadius: calculateBestRadius(tree, activeConfig)
            });
        }
    }
}

const loadData = async () => {
  const dataProvider = await getDataProcessor(activeConfig);
  const layout = prepareLayout(dataProvider);
  renderReceivedProofs(dataProvider, layout);
  renderAggregatedTrees(dataProvider, layout);
  renderSubmittedTrees(dataProvider, layout);
};

let intervalId = null;
const autoRefresh = (refreshSeconds) => {

    if (intervalId) {
        clearInterval(intervalId);
    }

    if (refreshSeconds > 0) {
        intervalId = setInterval(() => {
        loadData();
        }, refreshSeconds * 1000);
    }
}

watch(reactiveConfig, (config) => {
    autoRefresh(config.refreshInterval);
});

const loadDataTrigger = inject('loadDataTrigger') as Ref<number>;
const showSettingsTrigger = inject('showSettingsTrigger') as Ref<boolean>;
const showExtraSettingsTrigger = ref(false);

watchEffect(() => {
  if (loadDataTrigger.value > 0) {
    loadData();
  }
});

onMounted(() => {
    loadData();
    autoRefresh(activeConfig.refreshInterval);
});

</script>


<template>
    <div class="c-dashboard">

        <!-- Settings -->
        <q-expansion-item v-model="showSettingsTrigger">

            <q-card class="settings-container">
                <q-card-section>
                    <div class="c-dashboard__title">Settings</div>
                    <div class="q-my-md">
                        <form>
                            <label>
                                Refresh interval (seconds)
                                <div class="row q-mb-md">
                                    <q-input 
                                        v-model.number="reactiveConfig.refreshInterval" 
                                        type="number" 
                                        style="max-width: 200px" 
                                        outlined
                                        clearable
                                        clear-icon="close"
                                    />
                                </div>
                            </label>

                            <div>
                                <q-toggle left-label v-model="reactiveConfig.showUUIDOnAllNodes" label="Show ID on all nodes" />
                            </div>
                            <div>
                                <q-toggle left-label v-model="reactiveConfig.leavesUpwards" label="Reverse leaf direction" />
                            </div>
                            <div>
                                <q-toggle left-label v-model="reactiveConfig.useGeneratedData" label="Use randomly generated sample data" />
                            </div>
                            <div>
                                <q-toggle left-label v-model="showExtraSettingsTrigger" label="Show advanced settings" class="" />
                            </div>

                            <q-expansion-item expand-separator v-model="showExtraSettingsTrigger" style="margin-left: 0px !important;">

                                <div class="row q-mb-md q-pt-md">
                                    <label>
                                        Rows (1 or 2 only)
                                        <q-input 
                                            v-model.number="reactiveConfig.rows"
                                            type="number" 
                                            min="1" max="2"
                                            style="max-width: 200px" 
                                            outlined
                                        />
                                    </label>
                                </div>

                                <div class="q-mb-md">
                                    <label>
                                        API URL
                                        <q-input 
                                            v-model="reactiveConfig.dataUrl"
                                            style="max-width: 450px" 
                                            outlined
                                        />
                                    </label>
                                </div>

                                <div class="settings-subtitle">Text Settings</div>

                                <div class="row q-mb-md">
                                    <label class="q-mr-md">
                                        Horizontal offset
                                        <q-input 
                                            v-model.number="reactiveConfig.text_h_offset"
                                            type="number" 
                                            style="max-width: 166px" 
                                            outlined
                                        />
                                    </label>
                                    <label class="q-mr-md">
                                        Vertical offset
                                        <q-input 
                                            v-model.number="reactiveConfig.text_v_offset"
                                            type="number" 
                                            style="max-width: 166px" 
                                            outlined
                                        />
                                    </label>
                                    <label>
                                        UUID truncate length
                                        <q-input 
                                            v-model.number="reactiveConfig.truncateId"
                                            type="number" 
                                            style="max-width: 166px" 
                                            outlined
                                        />
                                    </label>
                                </div>

                                <div class="settings-subtitle">Tree Margin</div>

                                <div class="row q-mb-md">
                                    <label class="q-mr-md">
                                        Top
                                        <q-input 
                                            v-model.number="reactiveConfig.treeMargin.top"
                                            type="number" 
                                            style="max-width: 120px" 
                                            outlined
                                        />
                                    </label>
                                    <label class="q-mr-md">
                                        Right
                                        <q-input 
                                            v-model.number="reactiveConfig.treeMargin.right"
                                            type="number" 
                                            style="max-width: 120px" 
                                            outlined
                                        />
                                    </label>
                                    <label class="q-mr-md">
                                        Bottom
                                        <q-input 
                                            v-model.number="reactiveConfig.treeMargin.bottom"
                                            type="number" 
                                            style="max-width: 120px" 
                                            outlined
                                        />
                                    </label>
                                    <label class="q-mr-md">
                                        Left
                                        <q-input 
                                            v-model.number="reactiveConfig.treeMargin.left"
                                            type="number" 
                                            style="max-width: 120px" 
                                            outlined
                                        />
                                    </label>
                                </div>

                                <div class="settings-subtitle">Node</div>

                                <div class="row q-mb-md">
                                    <label class="q-mr-md">
                                        Max radius
                                        <q-input 
                                            v-model.number="reactiveConfig.radiusLimits.max"
                                            type="number" 
                                            style="max-width: 120px" 
                                            outlined
                                        />
                                    </label>
                                    <label class="q-mr-md">
                                        Min radius
                                        <q-input 
                                            v-model.number="reactiveConfig.radiusLimits.min"
                                            type="number" 
                                            style="max-width: 120px" 
                                            outlined
                                        />
                                    </label>
                                    <label class="q-mr-md">
                                        Max leaves
                                        <q-input 
                                            v-model.number="reactiveConfig.radiusLimits.maxLeafs"
                                            type="number" 
                                            style="max-width: 120px" 
                                            outlined
                                        />
                                    </label>
                                    <label class="q-mr-md">
                                        Min leaves
                                        <q-input 
                                            v-model.number="reactiveConfig.radiusLimits.minLeafs"
                                            type="number" 
                                            style="max-width: 120px" 
                                            outlined
                                        />
                                    </label>
                                </div>

                                <div class="settings-subtitle">Received Proofs</div>

                                <div class="row q-mb-md">
                                    <label class="q-mr-md">
                                        Horizontal offset
                                        <q-input 
                                            v-model.number="reactiveConfig.received.h_offset"
                                            type="number" 
                                            style="max-width: 120px" 
                                            outlined
                                        />
                                    </label>
                                    <label class="q-mr-md">
                                        Vertical offset
                                        <q-input 
                                            v-model.number="reactiveConfig.received.v_offset"
                                            type="number" 
                                            style="max-width: 120px" 
                                            outlined
                                        />
                                    </label>
                                    <label class="q-mr-md">
                                        Horizontal spacing
                                        <q-input 
                                            v-model.number="reactiveConfig.received.h_spacing"
                                            type="number" 
                                            style="max-width: 120px" 
                                            outlined
                                        />
                                    </label>
                                    <label class="q-mr-md">
                                        Vertical spacing
                                        <q-input 
                                            v-model.number="reactiveConfig.received.v_spacing"
                                            type="number" 
                                            style="max-width: 120px" 
                                            outlined
                                        />
                                    </label>
                                </div>

                            
                                <div class="q-mb-md row"></div>
                            </q-expansion-item>

                        </form>
                     </div>
                </q-card-section>
            </q-card>

        </q-expansion-item>
        <!-- <q-btn class="q-py-md q-ml-md" style="max-height: 50px;" color="white" text-color="black" label="Refresh" @click="loadData" /> -->
  
        <div class="c-dashboard__title">Received Proofs</div>
        <svg class="received nodes proof-container" style="background-color: white;"></svg>

        <div class="c-dashboard__title">Aggregated Proofs</div>
        <svg class="aggregated trees proof-container"></svg>


        <div class="c-dashboard__title">Submitted Proofs</div>
        <svg class="submitted trees proof-container" style="background-color: white;"></svg>

    </div>
</template>


<style lang="scss">
.c-dashboard {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 15px;
    &__title {
        font-size: 1.5rem;
        font-weight: 500;
        padding: 10px 0;
        line-height: 29px;
    }
}
svg {
    border: 1px solid black;
    &.trees {
        height: 400px;
    }
    &.nodes {
        height: 100px;
    }
}
.settings-subtitle, .q-item__label {
    font-size: 20px;
    padding: 10px 0;
}
.proof-container {
    background-color: rgba(88, 89, 91, 0);
    background-image: linear-gradient(#f0f0f0 18%, #fff);
    box-shadow: 2px 0 24px -2px rgba(92, 92, 92, 0.30);
}
.settings-container {
    background-color: rgba(88, 89, 91, 0);
    background-image: linear-gradient(#f0f0f0 18%, #fff);
    box-shadow: 2px 0 24px -2px rgba(92, 92, 92, 0.30);
    border: 1px solid black;
}
label, .q-checkbox__label, text, .block, .q-toggle__label {
    font-size: 16px;
    line-height: 21px;
    font-weight: 500;
}
.q-expansion-item--collapsed,
.q-item--clickable {
    display: none;
}

</style>
