import { config } from './config';
import { DataSource, ProofData, ProofNode, ProofNodeWithMetadata } from './types';
import { BehaviorSubject } from 'rxjs';

export class ProofDataGenerator implements DataSource {
    private known: string[] = [];
    private submittedProofs: ProofNodeWithMetadata[] = [];
    private aggregatedProofs: ProofNode[] = [];
    private baseProofs: ProofNode[] = [];

    incomingData: BehaviorSubject<ProofData> = new BehaviorSubject<ProofData>({
        submitted_proofs: [],
        aggregated_proofs: [],
        base_proofs: []
    });

    constructor() {
        this.generateData();
    }

    private generateData() {
        this.submittedProofs = this.generateBinaryTreesWithMetadata(4, [2, 7], [2, 3]);
        this.aggregatedProofs = this.generateBinaryTrees(3, [2, 15], [1, 2]);
        this.baseProofs = this.generateFlatList(Math.floor(Math.random() * 10) + 1);

        this.incomingData.next({
            submitted_proofs: this.submittedProofs,
            aggregated_proofs: this.aggregatedProofs,
            base_proofs: this.baseProofs
        });
    }

    private generateUUID(): string {
        let uuid: string = '';
        do {
            uuid = config.uuidTemplate.replace(/[x]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        } while (this.known.includes(uuid));
        return uuid;
    }

    generateBinaryTrees(amount: number, left: [number, number], right: [number, number]): ProofNode[] {
        const trees: ProofNode[] = [];
        const leftMin = left[0];
        const leftMax = left[1];
        const rightMin = right[0];
        const rightMax = right[1];
        for (let i = 0; i < amount; i++) {
            const rightDepth = Math.floor(Math.random() * (rightMax - rightMin)) + rightMin;
            const leftDepth = Math.floor(Math.random() * (leftMax - leftMin)) + leftMin;
            trees.push(this.generateBinaryTreeRoot(leftDepth, rightDepth));
        }
        return trees;
    }

    generateBinaryTreesWithMetadata(amount: number, left: [number, number], right: [number, number]): ProofNodeWithMetadata[] {
        const trees: ProofNodeWithMetadata[] = [];
        const leftMin = left[0];
        const leftMax = left[1];
        const rightMin = right[0];
        const rightMax = right[1];
        for (let i = 0; i < amount; i++) {
            const rightDepth = Math.floor(Math.random() * (rightMax - rightMin)) + rightMin;
            const leftDepth = Math.floor(Math.random() * (leftMax - leftMin)) + leftMin;
            trees.push( { trx_id: 'f4f5b671-2c8c-49af-99d8-e1246b1c6832', submit_time: { secs_since_epoch: 1720003875, nanos_since_epoch: 619247419 }, ser_merkle_node: this.generateBinaryTreeRoot(leftDepth, rightDepth) });
        }
        return trees;
    }

    private generateLeaf(): ProofNode {
        return {
            proof_uuid: this.generateUUID(),
            left: null,
            right: null
        } as ProofNode;
    }

    private generateBinaryTreeRoot(leftDepth: number, rightDepth: number): ProofNode {
        return {
            proof_uuid: this.generateUUID(),
            left: leftDepth > 0 ? this.generateBinaryTreeRoot(leftDepth-1, rightDepth-1) : this.generateLeaf(),
            right: rightDepth > 0 ? this.generateBinaryTreeRoot(leftDepth-1, rightDepth-1) : this.generateLeaf(),
        } as ProofNode;
    }

    private generateFlatList(amount: number): ProofNode[] {
        const list: ProofNode[] = [];
        for (let i = 0; i < amount; i++) {
            list.push(this.generateLeaf());
        }
        return list;
    }
}