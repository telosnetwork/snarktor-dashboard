<script setup lang="ts">
import { onMounted } from 'vue';
import { DataProcessor, getDataProcessor } from 'src/data';
import { config } from 'src/config';
import { Layout, NodeListLayout } from '../types';
import { calculateBestRadius, clearCanvas, renderListOfNodes, renderTree } from 'src/render';



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
    renderListOfNodes(list, selector, {
        nodeRadius: 16,
        ... config.received
    } as NodeListLayout);
}

const renderAggregatedTrees = (dataProvider: DataProcessor, layout: Layout) => {
    console.log('renderAggregatedTrees()');
    const selector = 'svg.aggregated.trees';
    clearCanvas(selector);

    for (let i=0; i<layout.aggregated.count; i++) {
        const tree = dataProvider.getAggregatedProofs()[i];

        if (config.rows === 1) {
            // This prints all trees in a single row
            const width = layout.aggregated.width / layout.aggregated.count;
            const height = layout.aggregated.height;
            renderTree(tree, selector, {
                width,
                height,
                h_offset: i * width,
                v_offset: 0,
                leavesUpwards: config.leavesUpwards,
                nodeRadius: calculateBestRadius(tree)
            });
        }
        if (config.rows === 2) {
            // This prints all trees in two rows
            const width = layout.aggregated.width / Math.ceil(layout.aggregated.count/2);
            const height = layout.aggregated.height / 2;
            renderTree(tree, selector, {
                width,
                height,
                h_offset: (i % 2) * width,
                v_offset: Math.floor(i / 2) * height,
                leavesUpwards: config.leavesUpwards,
                nodeRadius: calculateBestRadius(tree)
            });
        }
    }
}

const renderSubmittedTrees = (dataProvider: DataProcessor, layout: Layout) => {
    const selector = 'svg.submitted.trees';
    clearCanvas(selector);
    for (let i=0; i<layout.submitted.count; i++) {
        const tree = dataProvider.getSubmittedProofs()[i];
        if (config.rows === 1) {
            // This prints all trees in a single row
            const width = layout.submitted.width / layout.submitted.count;
            const height = layout.submitted.height;
            renderTree(tree, selector, {
                width,
                height,
                h_offset: i * width,
                v_offset: 0,
                leavesUpwards: config.leavesUpwards,
                nodeRadius: calculateBestRadius(tree)
            });
        }
        if (config.rows === 2) {
            // This prints all trees in two rows
            const width = layout.submitted.width / Math.ceil(layout.submitted.count/2);
            const height = layout.submitted.height / 2;
            renderTree(tree, selector, {
                width,
                height,
                h_offset: (i % 2) * width,
                v_offset: Math.floor(i / 2) * height,
                leavesUpwards: config.leavesUpwards,
                nodeRadius: calculateBestRadius(tree)
            });
        }
    }
}


onMounted(async () => {
    const dataProvider = await getDataProcessor();
    const layout = prepareLayout(dataProvider);
    console.log('dataProvider', dataProvider);
    renderReceivedProofs(dataProvider, layout);
    renderAggregatedTrees(dataProvider, layout);
    renderSubmittedTrees(dataProvider, layout);
});

</script>



<template>
<div class="c-dashboard">
    <div class="c-dashboard__title">Received Proofs</div>
    <svg class="received nodes"></svg>

    <div class="c-dashboard__title">Aggregated Proofs</div>
    <svg class="aggregated trees"></svg>

    <div class="c-dashboard__title">Submitted Proofs</div>
    <svg class="submitted trees"></svg>
</div>
</template>


<style lang="scss">
.c-dashboard {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 15px;
    &__title {
        font-size: 1.5em;
        font-weight: bold;
        padding: 10px 0;
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
</style>
