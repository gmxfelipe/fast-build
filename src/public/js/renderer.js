document.getElementById('selectJarBtn').addEventListener('click', async () => {
  const filePath = await window.electronAPI.selectJarFile();
  if (filePath) {
      document.getElementById('jarFilePath').value = filePath;
  } 
});

document.getElementById('selectCrxBtn').addEventListener('click', async () => {
  const crxPath = await window.electronAPI.selectCrxFolder();
  if (crxPath) {
      document.getElementById('crxDirPath').value = crxPath;
  } 
});

document.getElementById('startAemBtn').addEventListener('click', async () => {
  const jarFilePath = document.getElementById('jarFilePath').value;
  const crxPath = document.getElementById('crxDirPath').value;

  if (!jarFilePath) {
      return;
  }

  const response = await window.electronAPI.startAEM(jarFilePath, crxPath);
  
  if (response.success) {
      // redirecionar usuário
  }
});

function createAlert(message, type) {
  const alertContainer = document.getElementById('alert-container');
  const existingAlert = Array.from(alertContainer.children).find(alert => 
      alert.innerText.includes(message) && alert.classList.contains(`alert-${type}`)
  );

  if (existingAlert) return;

  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.role = 'alert';
  alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  alertContainer.appendChild(alert);
}

window.electronAPI.onLogMessage((event, { type, message }) => {
  if (type === 'info' && message.includes('Aguarde, AEM está iniciando')) {
      showAemLoadingModal();
  }
  if (type === 'success' && message.includes('AEM Quickstart iniciado com sucesso!')) {
      hideAemLoadingModal();
  }
  if (type !== 'info') {
      createAlert(message, type);
  }
});


function showAemLoadingModal() {
  const modal = new bootstrap.Modal(document.getElementById('aemLoadingModal'));
  modal.show();
}

function hideAemLoadingModal() {
  const modalElement = document.getElementById('aemLoadingModal');
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) {
      modalInstance.hide();
  }
}




