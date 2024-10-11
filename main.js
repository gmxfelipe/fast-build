const { app, BrowserWindow, dialog, ipcMain, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');

let mainWindow;

const createWindow = () => {
    nativeTheme.themeSource = 'dark';
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
        },
        icon: './src/public/img/logo.png',
    });

    mainWindow.loadFile('./src/views/index.html');
};

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('dialog:selectJarFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'JAR Files', extensions: ['jar'] }],
    });
    return canceled ? null : filePaths[0];
});

ipcMain.handle('dialog:selectCrxFolder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });
    return canceled ? null : filePaths[0];
});


// Função para executar o arquivo .jar do AEM
const runJarFile = (jarPath, jarDir, event) => {
    return new Promise((resolve, reject) => {
        const javaProcess = spawn('java', ['-jar', jarPath, '-v'], { cwd: jarDir });

        let quickstartStarted = false;

        // Mensagem de que o AEM está iniciando
        javaProcess.stdout.on('data', (data) => {
            const output = data.toString();

            if (output.includes('Quickstart started') || output.includes('instance started')) {
                if (!quickstartStarted) {
                    event.sender.send('log-message', { type: 'info', message: 'Aguarde, AEM está iniciando...' });
                }
            }
        });

        javaProcess.stderr.on('data', (data) => {
            const message = data.toString();

            if (message.includes('Quickstart started')) {
                quickstartStarted = true;
                event.sender.send('log-message', { type: 'success', message: 'AEM Quickstart iniciado com sucesso!' });
                resolve();
            }
        });

        javaProcess.on('close', (code) => {
            if (code !== 0 && !quickstartStarted) {
                reject(new Error(`O processo saiu com código ${code}.`));
            } else if (!quickstartStarted) {
                reject(new Error('A mensagem "Quickstart started" esperada não foi recebida.'));
            }
        });

        javaProcess.on('error', (err) => {
            reject(err);
        });
    });
};

// Função para iniciar o AEM e manipular o diretório CRX
ipcMain.handle('startAEM', async (event, jarFilePath, crxPath) => {
    // Verificar se o arquivo .jar foi selecionado
    if (!jarFilePath) {
        const message = 'Por favor, selecione um arquivo .jar válido.';
        event.sender.send('log-message', { type: 'error', message });
        return { success: false, message };
    }

    // Verificar se o AEM já está em execução
    const isRunning = await isAEMRunning();
    if (isRunning) {
        const message = 'O AEM já está em execução. Encerre a instância e tente novamente.';
        event.sender.send('log-message', { type: 'warning', message });
        return { success: false, message };
    }

    // Verificar e excluir o diretório CRX, se necessário
    if (crxPath) {
        if (fs.existsSync(crxPath)) {
            try {
                fs.rmSync(crxPath, { recursive: true, force: true });
                event.sender.send('log-message', { type: 'success', message: 'Diretório CRX excluído com sucesso.' });
            } catch (error) {
                const message = `Erro ao excluir diretório CRX: ${error.message}`;
                event.sender.send('log-message', { type: 'error', message });
                return { success: false, message };
            }
        } else {
            const message = 'O diretório CRX não foi encontrado.';
            event.sender.send('log-message', { type: 'warning', message });
        }
    }

    // Tentar iniciar o AEM
    try {
        event.sender.send('log-message', { type: 'info', message: 'Aguarde, AEM está iniciando...' });
        await runJarFile(jarFilePath, path.dirname(jarFilePath), event);
        return { success: true, message: 'AEM foi iniciado com sucesso!' };
    } catch (error) {
        const message = `Erro ao iniciar o AEM: ${error.message}`;
        event.sender.send('log-message', { type: 'error', message });
        return { success: false, message };
    }
});



function isAEMRunning() {
    return new Promise((resolve) => {
        exec('netstat -an | findstr ":4502"', (error, stdout) => {
            resolve(stdout.length > 0); 
        });
    });
}
