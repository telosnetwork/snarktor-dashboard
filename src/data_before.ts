/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-unused-vars */
export const config = {
    addIntermetiateNodes: false,
    totalNodes: 40,
    circleRadio: 15,
    arcWidth: 10,
    width: 960,
    height: 800,
    margin: { top: 50, right: 0, bottom: 50, left: 0 },
};


export type RawProofDataNode = {
    proof_uuid: string;
    circuit_digest: string;
    stage: 'received' | 'aggregated';
    aggregated_proofs: {
        left?: string;
        right?: string;
    };
};

export type CircuitWeight = {
    circuit_digest: string;
    weight: number;
};

export type ProofDataNode = RawProofDataNode & {
    children?: ProofDataNode[];
    circuits: CircuitWeight[];
};

// UUID generator ----
export const usedUUIDs = new Set<string>();
export function generateUUID(): string {
    let uuid;
    do {
        uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    } while (usedUUIDs.has(uuid));
    usedUUIDs.add(uuid);
    return uuid;
}
// Submit new Proof
export const circuitDigests = ['0x123', '0xabc', '0x789', '0xdef', '0xdca', '0x9ab'];
export const circuitColors = ['#FF0000', '#00FF00', '#0000FF', 'teal', '#FF00FF', '#00FFFF'];
export function generateReceivedProofNode(circuit = ''): RawProofDataNode {
    const circuit_digest = circuit || circuitDigests[Math.floor(Math.random() * circuitDigests.length)];
    const node: RawProofDataNode = {
        proof_uuid: generateUUID(),
        circuit_digest,
        stage: 'received',
        aggregated_proofs: {},
    };
    return node;
}



export const currentData: RawProofDataNode[] = [];

// La siguiente función toma un número N y genera un nuevo conjunto de datos con N elementos
// Donde un 80% de los elementos son 'aggregated' y un 20% son 'received'
export function generateNewData(N: number): RawProofDataNode[] {
    const data: RawProofDataNode[] = [];
    const roots: RawProofDataNode[] = [];
    const maxAggregated = Math.floor(N * 0.8);
    const halfAggregated = Math.floor(maxAggregated / 2);

    // we generate the leafs (half of the aggregated proofs)
    for (let i = 0; i < halfAggregated; i++) {
        const node = generateReceivedProofNode();
        node.stage = 'aggregated';
        data.push(node);
        roots.push(node);
    }

    // we generate the other half which are parents nodes
    while (roots.length > 1) {
        const left = roots.pop()!;
        const right = roots.pop()!;
        const node = generateReceivedProofNode();
        node.stage = 'aggregated';
        node.aggregated_proofs = { left: left.proof_uuid, right: right.proof_uuid };
        data.push(node);
        roots.push(node);
        roots.sort(() => Math.random() - 0.5);
    }

    // we generate the remaining nodes
    while (data.length < N) {
        const node = generateReceivedProofNode();
        data.push(node);
    }

    roots.sort(() => Math.random() - 0.5);

    return data;
}


// Process flat proof data to hierarchical structure (tree) -------------
export type AggregatedData = {
    received: ProofDataNode[];
    aggregated: ProofDataNode[];
};

// Dado un nodo raíz, esta función primero actualiza el peso de los circuitos de sus hijos
// para luego actualizar el suyo propio sumando los pesos de sus hijos
function updateWeight(parent: ProofDataNode) {
    parent.circuits = [{ circuit_digest: parent.circuit_digest, weight: 1 }];
    if (parent.children && parent.children.length > 0) {
        if (!config.addIntermetiateNodes) {
            parent.circuits = [];
        }
        parent.children.forEach((child) => {
            updateWeight(child);
            child.circuits.forEach((circuit) => {
                const index = parent.circuits.findIndex(c => c.circuit_digest === circuit.circuit_digest);
                if (index !== -1) {
                    parent.circuits[index].weight += circuit.weight;
                } else {
                    parent.circuits.push({ ...circuit });
                }
            });
        });
        // reverse order
        parent.circuits.reverse();
    }
}

export function processProofData(rawData: RawProofDataNode[]): AggregatedData {
    // We separate the nodes that are in the 'received' and 'aggregated' state
    const receivedNodes: ProofDataNode[] = [];
    const aggregatedNodesMap: { [key: string]: ProofDataNode } = {};

    rawData.forEach((node) => {
        if (node.stage === 'received') {
            receivedNodes.push({ ...node, circuits: [] });
        } else if (node.stage === 'aggregated') {
            aggregatedNodesMap[node.proof_uuid] = { ...node, circuits: [{ circuit_digest: node.circuit_digest, weight: 1 }], children: [] };
        }
    });

    // We build the hierarchical structure
    const aggregatedNodes: ProofDataNode[] = [];

    for (const uuid in aggregatedNodesMap) {
        const node = aggregatedNodesMap[uuid];
        if (node.aggregated_proofs.left && aggregatedNodesMap[node.aggregated_proofs.left]) {
            node.children!.push(aggregatedNodesMap[node.aggregated_proofs.left]);
        }
        if (node.aggregated_proofs.right && aggregatedNodesMap[node.aggregated_proofs.right]) {
            node.children!.push(aggregatedNodesMap[node.aggregated_proofs.right]);
        }

        // Identificamos los nodos que son raíces (no son hijos de ningún otro nodo)
        if (!Object.values(aggregatedNodesMap).some(n => (n.aggregated_proofs.left === uuid || n.aggregated_proofs.right === uuid))) {
            aggregatedNodes.push(node);
        }
    }

    const root = aggregatedNodes[0];
    updateWeight(root);

    return {
        received: receivedNodes,
        aggregated: aggregatedNodes,
    };
}
