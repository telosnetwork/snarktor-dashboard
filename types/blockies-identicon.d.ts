declare module 'blockies-identicon' {
    interface BlockiesOptions {
        seed: string;
        size?: number;
        scale?: number;
        color?: string;
        bgcolor?: string;
        spotcolor?: string;
    }

    function create(options: BlockiesOptions): HTMLCanvasElement;

    export { create };
}
