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
        const unexpectedSubmittedProofs: RawProof[] = [];
        proofs.forEach((rawProof) => {
            let proof: Proof;
            if (this.knownProofs[rawProof.id]) {
                // el nodo es conocido
                const oldProof = this.knownProofs[rawProof.id];
                if (this.knownProofs[rawProof.id].stage === rawProof.stage) {
                    // Si la prueba ya existe y está en el mismo estado, no hacemos nada
                    return;
                } else {
                    // Chkeamos la consistencia
                    console.assert(oldProof.stage !== 'submitted',
                        `A proof cannot change from submitted to anything else because it is the last stage. Proof id: ${oldProof.id}`);
                    console.assert(
                        // Una de dos opciones: O estamos cambiando de estado de 'received' a 'aggregated'
                        (oldProof.stage === 'received' && rawProof.stage === 'aggregated') ||
                        // o estamos cambiando de estado de 'aggregated' a 'submitted'
                        (oldProof.stage === 'aggregated' && rawProof.stage === 'submitted'),
                        `A proof cannot change back in stage. Proof id: ${oldProof.id}`);
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
                // El nodo llega por primera vez
                if (rawProof.stage === 'submitted') {
                    // Este caso no fue testeado con los datos de prueba
                    rawProof.stage = 'aggregated';
                    this.processProofs([rawProof]);
                    rawProof.stage = 'submitted';
                    unexpectedSubmittedProofs.push(rawProof);
                    return;
                }

                // la prueba es completamente nueva
                const parent = rawProof.parent ? this.knownProofs[rawProof.parent] : null;
                proof = {
                    ...rawProof,
                    tree: null,
                    leafs: 1,
                    parent,
                };
                this.knownProofs[proof.id] = proof;
            }
            if (rawProof.aggregated === null) {
                // si no tiene hijos, la consideramos una prueba recibida
                this.received.push(proof);
            } else if (rawProof.aggregated !== null && rawProof.stage === 'aggregated') {
                // checkeamos consistencia
                console.assert(rawProof.stage === 'aggregated', `A proof with children must be in the aggregated stage. Proof id: ${rawProof.id}`);
                // creamos el arbol parcial
                this.createPartialTree(rawProof);
            } else if (rawProof.stage === 'submitted') {
                // hay que actualizar el stage a 'submitted' de todos los hijos de proof
                this.submitTree(proof);
                // podamos fisicamente el arbol
                this.pruneTree(proof);
                // actualizamos los heights del arbol podado
                this.updateBranch(proof);
            }
            newNodes.push(proof);
        });

        // procesamos las pruebas que llegaron directamente al estado submitted
        if (unexpectedSubmittedProofs.length > 0) {
            // este caso no fue testeado con los datos de prueba
            this.processProofs(unexpectedSubmittedProofs);
        }
        // ordenamos los árboles parciales por cantidad de hojas
        this.aggregated.sort((a, b) => b.leafs - a.leafs);
        this.submitted.sort((a, b) => b.leafs - a.leafs);

        return newNodes;
    }

    getRoot(proof: Proof): Proof {
        let current = proof;
        while (current.parent) {
            current = current.parent;
        }
        return current;
    }

    submitTree(proof: Proof) {
        // Esta función recorre todo el arbo desde la raíz hasta las hojas y actualiza el stage a 'submitted' de forma recursiva
        proof.stage = 'submitted';
        if (proof.tree) {
            proof.tree.forEach((child) => this.submitTree(child));
        }        
    }

    pruneTree(proof: Proof) {
        // Esta función rompe los enlaces entre proof y su padre para colocar el nodo en la lista de pruebas completas
        // adicionalmente se crea un nodo reemplazante del proof para colocar en el lugar que tenía proof originalmente
        if (proof.parent) {
            const parent = proof.parent;
            const [left, right] = parent.tree!;
            const dummie = { ...proof, leafs: 1, height: 1, tree: null}; // nodo podado
            if (left.id === proof.id) {
                parent.tree = [dummie, right];
            } else {
                parent.tree = [left, dummie];
            }
            this.submitted.push(proof);
        }
    }

    updateBranch(proof: Proof) {
        // Esta función recorre el árbol desde el nodo dummie hasta la raíz y actualiza los heights y leafs de los nodos antecesores
        let current = proof;
        while (current.parent) {
            const parent = current.parent;
            const [left, right] = parent.tree!;
            parent.leafs = left.leafs + right.leafs;
            parent.height = Math.max(left.height, right.height) + 1;
            current = parent;
        }
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
        parent.leafs = left.leafs + right.leafs;
        // creamos el enlace cruzado entre padres e hijos
        left.parent = parent;
        right.parent = parent;
        parent.tree = [left, right];
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