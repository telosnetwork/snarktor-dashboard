import { BehaviorSubject } from "rxjs";

export type Stage = 'received' | 'aggregated' | 'submitted' ;

// Payload can be anything
export type Payload = { turtle: string };

export interface RawProof {
    id: string;
    payload: Payload;
    stage: Stage;
    input_time: number;
    aggregated: [string, string] | null;
    height: number;
}

export interface DataSource {
    incomingData: BehaviorSubject<RawProof[]>;
}

export interface Proof {
    id: string;
    payload: Payload;
    stage: Stage;
    input_time: number;
    tree: [Proof, Proof] | null;
    leafs: number;
    height: number;
}

// ---------------------------------------------------------
// This data is just for the demo
export const turtles = ['Donatello', 'Leonardo', 'Michelangelo', 'Raphael'];
export const turtleColors = ['purple', 'blue', 'orange', 'red'];

