// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Tell Metro to recognize WebAssembly (.wasm) files used by expo-sqlite
config.resolver.assetExts.push("wasm");

module.exports = config;
