const { exec } = require('child_process');

const runVtexLink = () => {
    console.log('Ejecutando vtex link...');
    
    const child = exec('vtex link');

    child.stdout.on('data', data => console.log(data));
    child.stderr.on('data', data => console.error(data));

    child.on('close', code  => {
        console.log(`Proceso finalizado con código ${code}`);

        if (code !== 0) {
            setTimeout(runVtexLink, 2000);
        }
    });
}

runVtexLink();
