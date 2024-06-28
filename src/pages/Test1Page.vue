<script setup lang="ts">
import { onMounted } from 'vue';
import * as d3 from 'd3';
import blockies from 'blockies-identicon';


onMounted(() => {
    console.log('Test1Page');
    // Datos de ejemplo: lista de textos
    const texts = ["hello", "world", "d3", "blockies", "typescript"];

    // Seleccionamos el contenedor donde añadiremos los íconos
    const container = d3.select("#icons");

    // Para cada texto, generamos un ícono usando Blockies
    texts.forEach(text => {
        // Generar un ícono de Blockies a partir del texto
        const icon = blockies.create({
            seed: text,
            size: 8, // Tamaño de los bloques
            scale: 10 // Escala del tamaño del ícono
        });

        // Añadir el ícono al contenedor utilizando D3.js
        container.append("div")
            .style("display", "inline-block")
            .style("margin", "10px")
            .node().appendChild(icon);
    });

});

</script>

<template>
<div id="icons"></div>
</template>

<style lang="scss">
</style>
