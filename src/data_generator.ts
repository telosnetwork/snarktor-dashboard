import { BehaviorSubject } from "rxjs";
import { DataSource, RawProof, turtles } from "./types";
import { config } from "./config";

export class DataGenerator {
    private known: { [id: string]: RawProof } = {};
    private timer: any;
    private leafs: RawProof[] = [];
    private roots: RawProof[] = [];
    
    // incomingData es una propiedad pública a la cual nos podemos subscribir y recibiremos una lista de Pruebas (Proof)
    public incomingData: BehaviorSubject<RawProof[]> = new BehaviorSubject<RawProof[]>([]);

    constructor() {
        this.startGeneratingData();
    }
    
    // orphans es una propiedad privada que mantiene una lisa de raíces o de hojas sin padres
    get orphans(): RawProof[] {
        return this.leafs.concat(this.roots);
    }

    // Método que genera datos de forma aleatoria
    private startGeneratingData() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            const newProofList = this.generateProofs();
            // newProofList deben estar ordenados por height
            newProofList.sort((a, b) => a.height - b.height);
            this.incomingData.next(newProofList);
        }, config.generationInterval);
    }

    // Metodo que genera ids únicos de forma aleatoria
    private generateUUID(): string {
        let uuid: string = '';
        do {
            uuid = config.uuidTemplate.replace(/[x]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        } while (this.known[uuid]);
        return uuid;
    }

    // Método que genera pruebas de forma aleatoria
    private generateProofs(): RawProof[] {
        console.log('DataGenerator.generateProofs()');

        // Generamos un número aleatorio de hojas entre 1 y 5 controlado por un factor inverso a la cantidad de hojas
        const controlFactor = 1/(this.leafs.length+1);
        const numberOfProofs = Math.floor(Math.random() * 5 * controlFactor) + 1;
        const proofs: RawProof[] = [];
        for (let i = 0; i < numberOfProofs; i++) {
            const proof: RawProof = {
                id: this.generateUUID(),
                stage: 'received',
                height: 1,
                aggregated: null,
                payload: this.getSomePayload(),
                input_time: Date.now(),
            };
            proofs.push(proof);
            this.leafs.push(proof);
            this.known[proof.id] = proof;
        }

        // Generamos entre 0 y 2 pruebas que serán padres de quialquier par de nodos que se encuentren en orphans
        const numberOfParents = Math.floor(Math.random() * 4);
        for (let i = 0; i < numberOfParents && this.orphans.length >= 2; i++) {

            // desordenamos los nodos huérfanos
            const orphans = [...this.orphans].sort(() => Math.random() - 0.5);

            // tomamos los dos primeros nodos y los agregamos a un nuevo padre
            const leftId = orphans.pop()!.id;
            const rightId = orphans.pop()!.id;
            const parent: RawProof = {
                id: this.generateUUID(),
                stage: 'aggregated',
                height: Math.max(this.known[leftId].height, this.known[rightId].height) + 1,
                aggregated: [leftId, rightId],
                payload: this.getSomePayload(),
                input_time: Date.now(),
            };

            // retiramos los hijos y el padre de la listas de leafs y roots
            this.leafs = this.leafs.filter((p) => p.id !== leftId && p.id !== rightId && p.id !== parent.id);
            this.roots = this.roots.filter((p) => p.id !== leftId && p.id !== rightId && p.id !== parent.id);

            // registramos el nuevo padre
            this.known[parent.id] = parent;
            this.roots.push(parent); // este padre puede ser elegido como hoja del siguiente ciclo
            proofs.push(parent);
        }

        proofs.forEach((proof) => {
            this.known[proof.id] = proof;
        });

        return proofs;
    }

    private getSomePayload() {
        return { turtle: turtles[Math.floor(Math.random() * turtles.length)] };
    }

    public start() {
        this.startGeneratingData();
    }

    public stop() {
        clearInterval(this.timer);
    }

    public iterate(times: number) {
        for (let i = 0; i < times; i++) {
            this.generateProofs();
        }
        const newProofList = Object.values(this.known);
        // newProofList deben estar ordenados por height
        newProofList.sort((a, b) => a.height - b.height);
        this.incomingData.next(newProofList);
    }

}

export class DataProcessor {

    constructor(
        private dataSource: DataSource
    ) {

    }
}