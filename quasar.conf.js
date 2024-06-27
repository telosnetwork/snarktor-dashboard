const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, './.env') });

module.exports = function (/* ctx */) {
    return {
        supportTS: {
            tsCheckerConfig: {}
        },
        boot: [
            'q-component-defaults'
        ],
        extras: [
            'fontawesome-v5',
            'roboto-font',
            'material-icons'
        ],
        build: {
            vueRouterMode: 'history',
            env: {
                NETWORK: process.env.NETWORK
            },
            chainWebpack (chain) {
                const nodePolyfillWebpackPlugin = require('node-polyfill-webpack-plugin');
                chain.plugin('node-polyfill').use(nodePolyfillWebpackPlugin);
            },
            scssLoaderOptions: {
                additionalData: `@import "src/css/global/global-index.scss";`,
                sourceMap: false,
            },
        },
        devServer: {
            https: false,
            port: 8080,
            open: true,
        },
    }
}
