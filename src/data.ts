import { ProofDataFetcher } from './data_fetcher';
import { ProofDataGenerator } from './data_generator';
import { DataSource, ProofData, ProofNode, ProofNodeWithMetadata } from './types';

export class DataProcessor {
    private submittedProofs: ProofNodeWithMetadata[] = [];
    private aggregatedProofs: ProofNode[] = [];
    private baseProofs: ProofNode[] = [];

    constructor(private source: DataSource) {
        this.source.incomingData.subscribe(data => {
            this.submittedProofs = data.submitted_proofs;
            this.aggregatedProofs = data.aggregated_proofs;
            this.baseProofs = data.base_proofs;
        });
    }

    public getSubmittedProofs(): ProofNodeWithMetadata[] {
        return this.submittedProofs;
    }

    public getAggregatedProofs(): ProofNode[] {
        return this.aggregatedProofs;
    }

    public getBaseProofs(): ProofNode[] {
        return this.baseProofs;
    }
}

// Esta función decide que source utilizar dependiendo de la configuración en config.ts
export const getDataProcessor = async (config) => {
    let source: DataSource;
    // Usamos el generador de datos mientras desarrollamos.
    if (config.useGeneratedData) {
        source = new ProofDataGenerator();
    } else {
        // En producción hemos de cambiar al fetcher.
        const fetcher = new ProofDataFetcher(config.dataUrl);
        await fetcher.fetchData();
        source = fetcher;
    }    
    const dataProvider = new DataProcessor(source);
    return dataProvider;
}


export const analyzeTree = (tree: ProofNode | null): { height: number, leafs: number } => {
    // Resolvemos recursivamente la altura y la cantidad de hojas del árbol
    if (tree === null) {
        return { height: 0, leafs: 0 };
    }
    const left = analyzeTree(tree.left);
    const right = analyzeTree(tree.right);
    return {
        height: 1 + Math.max(left.height, right.height),
        leafs: left.leafs + right.leafs + 1
    }
}
