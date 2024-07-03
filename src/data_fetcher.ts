import axios from 'axios';
import { DataSource, ProofData, ProofNode, ProofNodeWithMetadata } from './types';
import { BehaviorSubject } from 'rxjs';


export class ProofDataFetcher implements DataSource {
    private submittedProofs: ProofNodeWithMetadata[] = [];
    private aggregatedProofs: ProofNode[] = [];
    private baseProofs: ProofNode[] = [];

    incomingData: BehaviorSubject<ProofData> = new BehaviorSubject<ProofData>({
        submitted_proofs: [],
        aggregated_proofs: [],
        base_proofs: []
    });

    constructor(private url: string) {}

    public async fetchData(): Promise<void> {
        try {
            const response = await axios.get<ProofData>(this.url);
            const data = response.data;

            this.submittedProofs = data.submitted_proofs;
            this.aggregatedProofs = data.aggregated_proofs;
            this.baseProofs = data.base_proofs;

            this.incomingData.next(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            throw new Error('Failed to fetch proof data');
        }
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
