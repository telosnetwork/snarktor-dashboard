import * as d3 from 'd3';
import blockies from 'blockies-identicon';
import { config } from 'src/config';
import { NodeListLayout, ProofNode, TreeLayout } from './types';
import { analyzeTree } from './data';



export const renderTree = (data: ProofNode, evgSelector: string, layout: TreeLayout) => {
    console.log('renderTree', {data, evgSelector, layout, config});
    // This is a workaround to avoid the first node to be painted in black (I couldn't find the cause of this issue)
    const aux = blockies.create({ seed: '', size: 8, scale: 4 });

    console.log([
        layout.width - config.treeMargin.left - config.treeMargin.right,
        layout.height - config.treeMargin.top - config.treeMargin.bottom,
    ]);

    const treeClass = `tree-${data.proof_uuid}`;
    const svg = d3.select(evgSelector).append('g')
        .attr('transform', `translate(${config.treeMargin.left + layout.h_offset},${layout.v_offset + (layout.leavesUpwards ? config.treeMargin.bottom : -config.treeMargin.bottom) })`);
    const treeLayout = d3.tree().size([
        layout.width - config.treeMargin.left - config.treeMargin.right,
        layout.height - config.treeMargin.top - config.treeMargin.bottom,
    ]);

    const root = d3.hierarchy(data, (d: ProofNode) => d.left && d.right ? [d.left, d.right] : null);
    treeLayout(root);

    // Determine the y function based on leavesUpwards
    const y = (d: { y: any; }) => layout.leavesUpwards ? d.y : layout.height - d.y;

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

    // Add Blockies icons based on d.data.proof_uuid
    node.each(function(d: any, i: number) { // Add index parameter to identify root node
        console.log('node.each', {d});
        const icon: HTMLCanvasElement = blockies.create({ seed: d.data.proof_uuid, size: 8, scale: 4 });

        // Apply grayscale filter if d.data.stage is 'submitted'
        if (d.data.left === null && d.data.right === null) {

            // Create a circular clipPath
            d3.select(this).append('clipPath')
                .attr('id', `clip-${d.data.proof_uuid}`)
                .append('circle')
                .attr('r', layout.nodeRadius)
                .attr('cx', 0)
                .attr('cy', 0);

            // Add the image with the applied clipPath
            const image = d3.select(this).append('image')
                .attr('xlink:href', icon.toDataURL())
                .attr('width', layout.nodeRadius * 2)
                .attr('height', layout.nodeRadius * 2)
                .attr('x', -layout.nodeRadius)
                .attr('y', -layout.nodeRadius)
                .attr('clip-path', `url(#clip-${d.data.proof_uuid})`);
            
        } else {

            d3.select(this).append("circle")
                .attr("r", layout.nodeRadius)
                // this is a callback returning a color based on the proof_uuid
                .attr("fill", (d) => `#${d.data.proof_uuid.split('-').join('').substring(0,6)}`);
        }

        // Add text based on proof_uuid only for the root node
        if (i === 0) { // Check if it is the root node
            d3.select(this).append('text')
                .attr('x', layout.nodeRadius + config.text_h_offset)
                .attr('y', layout.nodeRadius + config.text_v_offset)
                .attr('text-anchor', 'middle')
                .text(d.data.proof_uuid.substring(0, config.truncateId) + '...');
        }
    });
};


export const renderListOfNodes = (leafs: ProofNode[], evgSelector: string, layout: NodeListLayout) => {
    console.log('renderListOfNodes', { leafs, evgSelector, layout });
    
    const svg = d3.select(evgSelector).append('g')
        .attr('transform', `translate(${config.treeMargin.left + layout.h_offset},${layout.v_offset})`);

    const node = svg.selectAll('.node')
        .data(leafs)
        .enter().append('g')
        .attr('class', 'node')
        .attr('transform', (d: any, i: number) => `translate(${i * (layout.nodeRadius * 2 + layout.h_spacing)}, 0)`);

    node.each(function(d: any, i: number) {
        console.log('node.each', { d });
        const icon: HTMLCanvasElement = blockies.create({ seed: d.proof_uuid, size: 8, scale: 4 });

        d3.select(this).append('clipPath')
            .attr('id', `clip-${d.proof_uuid}`)
            .append('circle')
            .attr('r', layout.nodeRadius)
            .attr('cx', 0)
            .attr('cy', 0);

        const image = d3.select(this).append('image')
            .attr('xlink:href', icon.toDataURL())
            .attr('width', layout.nodeRadius * 2)
            .attr('height', layout.nodeRadius * 2)
            .attr('x', -layout.nodeRadius)
            .attr('y', -layout.nodeRadius)
            .attr('clip-path', `url(#clip-${d.proof_uuid})`);

        // Add text based on proof_uuid for the root node
        d3.select(this).append('text')
            .attr('x', 0)
            .attr('y', layout.nodeRadius + 20) // Position the text below the icon
            .attr('text-anchor', 'middle')
            .text(d.proof_uuid.substring(0, config.truncateId) + '...');
    });
};


export const calculateBestRadius = (tree: ProofNode): number => {
    const { height, leafs } = analyzeTree(tree);
    let radius: number;
    const { max, min, maxLeafs, minLeafs } = config.radiusLimits;
    
    if (leafs > maxLeafs) {
        radius = min;
    } else if (leafs < minLeafs) {
        radius = max;
    } else {
        radius = max - Math.floor((leafs - minLeafs) * (max - min) / (maxLeafs - minLeafs));
    }
    
    console.log('calculateBestRadius()', height, leafs, '---> radius: ', radius);
    return radius;
}

export const clearCanvas = (evgSelector: string) => {
    d3.select(evgSelector).selectAll('*').remove();

    // This is a workaround to avoid the first node to be painted in black (I couldn't find the cause of this issue)
    const aux = blockies.create({ seed: '', size: 8, scale: 4 });
}