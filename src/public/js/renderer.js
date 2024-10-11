document.getElementById('selectJarBtn').addEventListener('click', async () => {
  const filePath = await window.electronAPI.selectJarFile();
  if (filePath) {
      document.getElementById('jarFilePath').value = filePath;
  } 
  // Remover o alerta se nenhum arquivo JAR for selecionado
});

document.getElementById('selectCrxBtn').addEventListener('click', async () => {
  const crxPath = await window.electronAPI.selectCrxFolder();
  if (crxPath) {
      document.getElementById('crxDirPath').value = crxPath;
  } 
  // Remover o alerta se nenhuma pasta CRX for selecionada
});

document.getElementById('startAemBtn').addEventListener('click', async () => {
  const jarFilePath = document.getElementById('jarFilePath').value;
  const crxPath = document.getElementById('crxDirPath').value;

  if (!jarFilePath) {
      // Remover o alerta de 'Por favor, selecione o arquivo .jar.'
      return;
  }

  const response = await window.electronAPI.startAEM(jarFilePath, crxPath);
  
  // Remover o alerta de sucesso ou falha
  if (response.success) {
      // Remover a confirmação de redirecionamento
      // Se precisar redirecionar, faça isso diretamente aqui.
  }
});

// Função para criar alertas de Bootstrap dinamicamente
function createAlert(message, type) {
  const alertContainer = document.getElementById('alert-container');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.role = 'alert';
  alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  alertContainer.appendChild(alert);
}

// Listener para receber logs do main process
window.electronAPI.onLogMessage((event, { type, message }) => {
  createAlert(message, type);
});


// function showAemLoadingModal() {
//   const modal = new bootstrap.Modal(document.getElementById('aemLoadingModal'));
//   modal.show();
// }

// function hideAemLoadingModal() {
//   const modalElement = document.getElementById('aemLoadingModal');
//   const modalInstance = bootstrap.Modal.getInstance(modalElement);
//   modalInstance.hide();
// }

// // Listener para receber logs do main process
// window.electronAPI.onLogMessage((event, { type, message }) => {
//   if (type === 'info' && message.includes('Aguarde, AEM está iniciando')) {
//     showAemLoadingModal();
//   } else if (type === 'success' && message.includes('AEM Quickstart iniciado com sucesso!')) {
//     hideAemLoadingModal();
//   }
//   createAlert(message, type);
// });

