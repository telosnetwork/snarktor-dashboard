<script setup lang="ts">
import { onMounted } from 'vue';
import * as d3 from 'd3';
import {
    config,
    realDataExample1,
    preprocessData,
    dataProcessor,

    // datatypes
    ProcessedData,
    RawData,
} from '../data_real';

let timer = setInterval(() => {}, 10000);
const startProcessing = () => {
    console.log('Process ON', [config.initTime, config.endTime]);
    clearInterval(timer);
    const intervalInitTime = Date.now();
    timer = setInterval(() => {
        const diff = Math.floor((Date.now() - intervalInitTime) * config.speedFactor) ;
        const processUntilTime = config.initTime + diff;
        console.log('- interval Init -', diff, [config.initTime, processUntilTime, config.endTime]);
        dataProcessor.processNodes(processUntilTime);
        dataProcessor.print();
        if (processUntilTime >= config.endTime) {
            clearInterval(timer);
            console.log('Process Finished');
        }
    }, 1000);
};

onMounted(() => {
    // 1719415436 min
    // 1719416265 max
    console.log('---------  onMounted  ---------');
    config.initTime = dataProcessor.initialList[0].input_time;
    config.endTime = config.initTime + 100;
    dataProcessor.print();
    dataProcessor.buildTree();
    dataProcessor.print();

    // debemos averiguar cual es la cantidad máxima, mínima y promedio de children que tiene cada nodo dentro de dataProcessor.treeStructure
    const maxChildren = dataProcessor.treeStructure.reduce((acc, node) => {
        return Math.max(acc, node.children?.length || 0);
    }, 0);
    const minChildren = dataProcessor.treeStructure.reduce((acc, node) => {
        return Math.min(acc, node.children?.length || 0);
    }, Infinity);
    const avgChildren = dataProcessor.treeStructure.reduce((acc, node) => {
        return acc + (node.children?.length || 0);
    }, 0) / dataProcessor.treeStructure.length;
    console.log('maxChildren', maxChildren);
    console.log('minChildren', minChildren);
    console.log('avgChildren', avgChildren);



    // startProcessing();
    console.log('---------  end  ---------');
});

</script>



<template>
<div class="c-tree-view-component">
    <svg id="tree-svg" class="c-tree-view-component__svg" >
        <!-- Tree goes here -->
    </svg>
</div>
</template>


<style lang="scss">
.c-tree-view-component {
    font-family: Arial, sans-serif;
    &__svg {
        border: 1px solid #ccc;
    }
}
</style>
