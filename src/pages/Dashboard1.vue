<script setup lang="ts">
import { onMounted } from 'vue';
import * as d3 from 'd3';
import blockies from 'blockies-identicon';
import { DataProcessor } from 'src/data';
import { DataGenerator } from 'src/data_generator';
import { config } from 'src/config';
import { Proof, turtles, turtleColors } from 'src/types';


const clearCanavas = () => {
    d3.select('svg').selectAll('g').remove();
    
    d3.select('svg')
        .attr('width', config.width)
        .attr('height', config.height)
        .append('g')
        .attr('transform', `translate(${config.margin.left},-${config.margin.bottom})`);
};

const turtleColor = (turtleName: string) => {
    return turtleColors[turtles.indexOf(turtleName)]; 
};

const renderTree = (data: Proof, leavesUpwards: boolean) => {
    console.log('---------  renderTree  ---------');
    const treeClass = `tree-${data.id}`;

    const svg = d3.select('svg')
        .attr('width', config.width)
        .attr('height', config.height)
        .append('g')
        .attr('transform', `translate(${config.margin.left},${leavesUpwards ? config.margin.bottom : -config.margin.bottom})`);

    const treeLayout = d3.tree().size([
        config.width - config.margin.left - config.margin.right,
        config.height - config.margin.top - config.margin.bottom,
    ]);

    const root = d3.hierarchy(data, (d: Proof) => d.tree);

    treeLayout(root);

    // Determinar la función de y basado en leavesUpwards
    const y = (d: { y: any; }) => leavesUpwards ? d.y : config.height - d.y;

    // Draw curved links
    const link = svg.selectAll(`.link.${treeClass}`)
        .data(root.links())
        .enter().append('path')
        .attr('class', 'link')
        .attr('class', treeClass)
        .attr('fill', 'none')
        .attr('stroke', '#555')
        .attr('d', d3.linkVertical()
            .x((d: { x: any; }) => d.x)
            .y((d: { y: any; }) => y(d)));

    // Create nodes
    const node = svg.selectAll(`.node.${treeClass}`)
        .data(root.descendants())
        .enter().append('g')
        .attr('class', 'node')
        .attr('class', treeClass)
        .attr('transform', (d: { x: any; y: any; }) => `translate(${d.x},${y(d)})`);

    // Append circles with colors based on circuit_digest
    // node.append('circle')
    //     .attr('r', config.circleRadio + 1)
    //     .attr('fill', (d: {data: Proof}) => turtleColor(d.data.payload.turtle));

    // Añadir íconos de Blockies basados en d.data.id
    node.each(function(d: any) {
        const icon = blockies.create({ seed: d.data.id, size: 8, scale: 4 });

        // Crear un clipPath circular
        d3.select(this).append('clipPath')
            .attr('id', `clip-${d.data.id}`)
            .append('circle')
            .attr('r', 16)
            .attr('cx', 0)
            .attr('cy', 0);

        // Añadir la imagen con el clipPath aplicado
        d3.select(this).append('image')
            .attr('xlink:href', icon.toDataURL())
            .attr('width', 32)
            .attr('height', 32)
            .attr('x', -16)
            .attr('y', -16)
            .attr('clip-path', `url(#clip-${d.data.id})`);
    });

};


onMounted(() => {
    clearCanavas();
    
    const source = new DataGenerator();
    const data = new DataProcessor(source);
    data.newData.subscribe(() => {
        data.print();
        if (data.aggregated.length > 0) {
            clearCanavas();
            renderTree(data.aggregated[0], false);
        }
    });
    
    // Generar una prueba estática
    // source.stop();
    // source.iterate(10);

});

</script>



<template>
<div>
    <svg id="tree-svg"></svg>
</div>
</template>


<style lang="scss">
svg {
    border: 1px solid black;
}
</style>
