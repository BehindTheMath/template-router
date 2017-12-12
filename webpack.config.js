const path = require("path");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const FixDefaultImportPlugin = require('webpack-fix-default-import-plugin');

module.exports = {
    devtool: 'source-map',
    context: __dirname,
    entry: {
        "template-router": "./src/index.ts",
        "template-router.min": "./src/index.ts"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "./dist"),
        libraryTarget: "umd",
        library: "TemplateRouter",
        libraryExport: "default",
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true,
                            logInfoToStdOut: true,
                            compilerOptions: {
                                target: "es5",
                                module: "es6"
                            },
                            configFile: "src/tsconfig.json"
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    plugins: [
        new UglifyJSPlugin({
                sourceMap: true,
                include: /\.min\.js$/,
                uglifyOptions: {
                    mangle: {
                        keep_fnames: true
                    }
                }
            }
        ),
        new FixDefaultImportPlugin()
    ]
};

