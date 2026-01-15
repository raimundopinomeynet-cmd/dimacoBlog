const esbuild = require('esbuild');
const sass = require('sass');
const fs = require('fs-extra');
const path = require('path');

const srcDir = './src';
const outDir = './checkout-ui-custom';
const jsFile = 'checkout6-custom.js';
const scssFile = 'checkout6-custom.scss';

fs.ensureDirSync(outDir);

const compileSass = () => {
    try {
        const result = sass.compile(path.join(srcDir, scssFile), { style: 'compressed' });
        fs.writeFileSync(path.join(outDir, 'checkout6-custom.css'), result.css);
        console.log('✔️ SCSS compilado y minificado');
    } catch (error) {
        console.error('❌ Error compilando SCSS:', error.message);
    }
};

// Función para compilar JavaScript con watch
const buildJS = async () => {
    try {
        const ctx = await esbuild.context({
            entryPoints: [path.join(srcDir, jsFile)],
            outfile: path.join(outDir, jsFile),
            minify: true,
            format: 'iife',
            bundle: true,
            sourcemap: false,
            target: ['es6'],
        });
        console.log('🔄 recompilando JS...');
        await  ctx.watch();
        console.log('👀 JavaScript: Vigilando cambios...');
    } catch (error) {
        
    }
};

fs.watch(path.join(srcDir, scssFile), () => {
    console.log('🔄 Detectado cambio en SCSS, recompilando...');
    compileSass();
});

compileSass();
buildJS();
