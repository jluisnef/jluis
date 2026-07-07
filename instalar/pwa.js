// Configuración del botón de instalación infantil
const installButton = document.createElement('button');
installButton.id = 'pwa-install-button';
installButton.innerHTML = '✨ ¡Instalar Juego! 📲';
Object.assign(installButton.style, {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  padding: '14px 28px',
  background: 'linear-gradient(135deg, #feca57, #ff9f43)',
  color: 'white',
  border: '3px solid #fff',
  borderRadius: '50px',
  fontFamily: "'Fredoka', sans-serif",
  fontSize: '18px',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'none',
  zIndex: '1000',
  boxShadow: '0 6px 0px rgba(217, 125, 0, 0.8), 0 8px 20px rgba(0,0,0,0.25)',
  transition: 'transform 0.1s ease, box-shadow 0.1s ease',
  outline: 'none'
});
document.body.appendChild(installButton);

// Efectos de interactividad en el botón
installButton.addEventListener('mouseenter', () => {
  installButton.style.transform = 'scale(1.05)';
});
installButton.addEventListener('mouseleave', () => {
  installButton.style.transform = 'scale(1)';
});

// Manejo del evento de instalación de PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[PWA] Evento beforeinstallprompt recibido');
  
  // 1. Prevenir el banner automático del navegador
  e.preventDefault();
  
  // 2. Guardar el evento para dispararlo más tarde
  deferredPrompt = e;
  
  // 3. Mostrar nuestro botón infantil personalizado
  installButton.style.display = 'block';
  
  // Ocultar después de 45 segundos si no interactúa
  setTimeout(() => {
    if (installButton.style.display === 'block') {
      installButton.style.display = 'none';
    }
  }, 45000);
});

// Manejo de clic para instalar
installButton.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  
  console.log('[PWA] Mostrando diálogo de instalación infantil');
  
  try {
    // Aplicar animación de clic
    installButton.style.transform = 'translateY(4px)';
    installButton.style.boxShadow = '0 2px 0px rgba(217, 125, 0, 0.8), 0 4px 10px rgba(0,0,0,0.2)';
    
    // Mostrar prompt nativo
    deferredPrompt.prompt();
    
    // Esperar respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] El usuario ${outcome === 'accepted' ? 'instaló el juego' : 'canceló la instalación'}`);
    
    if (outcome === 'accepted') {
      installButton.innerHTML = '🎉 ¡Instalado con éxito!';
      installButton.style.background = 'linear-gradient(135deg, #1dd1a1, #10ac84)';
      installButton.style.boxShadow = '0 6px 0px rgba(16, 172, 132, 0.8)';
      setTimeout(() => {
        installButton.style.display = 'none';
      }, 2500);
    } else {
      // Restaurar estado si se cancela
      installButton.style.transform = 'scale(1)';
      installButton.style.boxShadow = '0 6px 0px rgba(217, 125, 0, 0.8), 0 8px 20px rgba(0,0,0,0.25)';
    }
  } catch (error) {
    console.error('[PWA] Error durante el proceso de instalación:', error);
  } finally {
    deferredPrompt = null;
  }
});

// Registro resiliente del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Intentar registrar sw.js en la raíz del proyecto (recomendado para alcance total)
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('[PWA] Service Worker principal registrado en la raíz:', registration.scope);
      })
      .catch(error => {
        console.warn('[PWA] No se pudo cargar sw.js en raíz, probando ruta alternativa /instalar/sw.js:', error);
        // Fallback a la carpeta instalar
        navigator.serviceWorker.register('instalar/sw.js')
          .then(registration => {
            console.log('[PWA] Service Worker secundario registrado en /instalar/:', registration.scope);
          })
          .catch(err => {
            console.error('[PWA] Fallaron todos los intentos de registro de Service Worker:', err);
          });
      });
  });
}

// Banner especial de ayuda para dispositivos iOS (Safari no soporta beforeinstallprompt)
if (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
  const iosBanner = document.createElement('div');
  iosBanner.id = 'pwa-ios-banner';
  iosBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      text-align: center;
      border-top: 3px solid #ff9f43;
      z-index: 999;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      font-family: 'Fredoka', sans-serif;
    ">
      <p style="margin: 0; font-size: 15px; color: #2d3436; font-weight: 600;">
        📱 ¡Juega en pantalla completa! Toca el botón <strong>Compartir 📤</strong> y luego elige <strong>Añadir a la pantalla de inicio ➕</strong>.
      </p>
      <button onclick="document.getElementById('pwa-ios-banner').remove()" style="
        margin-top: 10px;
        border: none;
        background: #ff6b6b;
        color: white;
        padding: 5px 15px;
        border-radius: 15px;
        font-weight: bold;
        cursor: pointer;
      ">¡Entendido! 👍</button>
    </div>
  `;
  document.body.appendChild(iosBanner);
}