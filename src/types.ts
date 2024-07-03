import { BehaviorSubject } from "node_modules/rxjs/dist/types/index";


export interface ProofNode {
    proof_uuid: string;
    left: ProofNode | null;
    right: ProofNode | null;
}

export interface ProofNodeWithMetadata {
    trx_id: string;
    submit_time: NodeSubmitTime;
    ser_merkle_node: ProofNode;
}

export interface NodeSubmitTime {
    secs_since_epoch: number;
    nanos_since_epoch: number;
}

export interface ProofData {
    submitted_proofs: ProofNodeWithMetadata[];
    aggregated_proofs: ProofNode[];
    base_proofs: ProofNode[];
}

export interface DataSource {
    incomingData: BehaviorSubject<ProofData>;
}

export interface TreeLayout {
    height: number,
    width: number,
    h_offset: number;
    v_offset: number;
    nodeRadius: number;
    leavesUpwards: boolean,
}

export interface NodeListLayout {
    h_spacing: number;
    v_spacing: number;
    h_offset: number;
    v_offset: number;
    nodeRadius: number;
}

export interface SvgLayout  {
    height: number;
    width: number;
    count: number;
    h_offset: number;
    v_offset: number;
}

export interface Layout {
    received: SvgLayout;
    aggregated: SvgLayout;
    submitted: SvgLayout;
}