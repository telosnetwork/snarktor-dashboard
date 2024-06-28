import { BehaviorSubject } from "rxjs";
import { DataSource, Proof, RawProof } from "./types";



export class DataProcessor {
    public knownProofs: { [id: string]: Proof } = {};
    public received:   Proof[] = []; // Pruebas recibidas sin padres
    public aggregated: Proof[] = []; // raíces de los árboles parciales
    public submitted:  Proof[] = []; // raíces de los árboles completos
    public newData: BehaviorSubject<Proof[]> = new BehaviorSubject<Proof[]>([]);

    print() {
        console.log('received:   ', this.received);
        console.log('aggregated: ', this.aggregated);
        console.log('heights:    ', this.aggregated.map((p) => p.height));
        console.log('submitted:  ', this.submitted);
    }

    constructor(
        private dataSource: DataSource
    ) {
        this.dataSource.incomingData.subscribe((proofs) => {
            const newNodes = this.processProofs(proofs);
            this.newData.next(newNodes);
        });
    }

    // Método que procesa las nuevas pruebas, dejando las pruebas sin padres en la lista de pruebas recibidas
    // y armando los árboles parciales con los nodos que ya conocemos
    private processProofs(proofs: RawProof[]): Proof[] {
        const newNodes: Proof[] = [];
        proofs.forEach((rawProof) => {
            let proof: Proof;
            if (this.knownProofs[rawProof.id]) {
                const oldProof = this.knownProofs[rawProof.id];
                if (this.knownProofs[rawProof.id].stage === rawProof.stage) {
                    // Si la prueba ya existe y está en el mismo estado, no hacemos nada
                    return;
                } else {
                    // Chkeamos la consistencia
                    console.assert(oldProof.stage !== 'submitted',
                        `A proof cannot change from submitted to anything else because it is the last stage. Proof id: ${oldProof.id}`);
                    console.assert(oldProof.stage === 'aggregated' && rawProof.stage === 'received',
                        `A proof cannot change back from aggregated to received. Proof id: ${oldProof.id}`);
                    // Si la prueba ya existe pero cambió de estado, primero la eliminamos de donde estaba
                    if (oldProof.stage === 'received') {
                        this.received = this.received.filter((p) => p.id !== oldProof.id);
                    }
                    if (oldProof.stage === 'aggregated') {
                        this.aggregated = this.aggregated.filter((p) => p.id !== oldProof.id);
                    }
                    // actualizamos el estado de la prueba y descartamos la referencia nueva por la vieja
                    oldProof.stage = rawProof.stage;
                    proof = oldProof;
                }
            } else {
                // la prueba es completamente nueva
                proof = {
                    ...rawProof,
                    tree: null,
                    leafs: 1
                };
                this.knownProofs[proof.id] = proof;
            }
            if (rawProof.aggregated === null) {
                // si no tiene hijos, la consideramos una prueba recibida
                this.received.push(proof);
            } else if (rawProof.aggregated !== null) {
                // checkeamos consistencia
                console.assert(rawProof.stage === 'aggregated', `A proof with children must be in the aggregated stage. Proof id: ${rawProof.id}`);
                // creamos el arbol parcial
                this.createPartialTree(rawProof);
            } else {
                // TODO: procesar pruebas completas
                console.error('Not implemented yet. stage: submitted');
            }
            newNodes.push(proof);
        });

        // ordenamos los árboles parciales por cantidad de hojas
        this.aggregated.sort((a, b) => b.leafs - a.leafs);
        this.submitted.sort((a, b) => b.leafs - a.leafs);

        return newNodes;
    }

    // Método que crea un árbol parcial a partir de una nueva prueba agregada
    private createPartialTree(rawProof: RawProof) {
        const parent = this.knownProofs[rawProof.id];
        const [leftId, rightId] = rawProof.aggregated!;
        const left = this.knownProofs[leftId];
        const right = this.knownProofs[rightId];
        // los hijos toman el mismo stage que el padre
        left.stage = parent.stage;
        right.stage = parent.stage;
        parent.tree = [left, right];
        parent.leafs = left.leafs + right.leafs;
        // reordenamos las estructuras internas
        if (parent.stage === 'aggregated') {
            this.aggregated.push(parent);
        } else if (parent.stage === 'submitted') {
            this.submitted.push(parent);
        }
        this.received = this.received.filter((p) => p.id !== leftId && p.id !== rightId);
        this.aggregated = this.aggregated.filter((p) => p.id !== leftId && p.id !== rightId);
    }
}