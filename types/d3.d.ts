
// Esto evita tener miles de problemas de compilación. Hay que eliminarlo y sustituir lo por 
// npm i --save-dev @types/d3
declare module 'd3' {
    const content: any;
    export = content;
}
