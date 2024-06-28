<script setup lang="ts">
import { onMounted } from 'vue';
import * as d3 from 'd3';

onMounted(() => {
    console.log('Test2Page mounted');

    const svg = d3.select("svg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    // Definición de los datos para los árboles
    const treeData1 = {
        name: "T1-Root1",
        children: [
            { name: "T1-Child1" },
            { name: "T1-Child2" }
        ]
    };

    const treeData2 = {
        name: "T2-Root2",
        children: [
            {
                name: "T2-Child1",
                children: [
                    { name: "T2-Grandchild1" },
                    { name: "T2-Grandchild2" }
                ]
            },
            { name: "T2-Child2" }
        ]
    };

    // Función para crear un árbol
    function createTree(tree, data, xOffset) {
        const treeLayout = d3.tree().size([height, width / 5]);

        const root = d3.hierarchy(data);
        treeLayout(root);

        // Dibujar los enlaces (links)
        svg.selectAll(`.${tree}.link`)
            .data(root.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("class", `${tree}`)
            .attr("d", d3.linkHorizontal()
                .x(d => d.y + xOffset)
                .y(d => d.x)
            );

        // Dibujar los nodos
        const node = svg.selectAll(`.${tree}.node`)
            .data(root.descendants())
            .enter().append("g")
            .attr("class", "node")
            .attr("class", `${tree}`)
            .attr("transform", d => `translate(${d.y + xOffset},${d.x})`);

        node.append("circle")
            .attr("r", 5);

        node.append("text")
            .attr("dy", ".35em")
            .attr("x", d => d.children ? -10 : 10)
            .style("text-anchor", d => d.children ? "end" : "start")
            .text(d => d.data.name);
    }

    // Crear los dos árboles
    createTree('t1',treeData1, 0);
    createTree('t2',treeData2, width / 2);
2
})


</script>

<template>
<svg width="1000" height="500"></svg>
</template>

<style lang="scss">
.node circle {
    fill: #999;
    stroke: #555;
    stroke-width: 2px;
}
.node text {
    font: 12px sans-serif;
}
.link {
    fill: none;
    stroke: #555;
    stroke-width: 2px;
}
</style>
