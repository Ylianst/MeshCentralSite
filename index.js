document.addEventListener('DOMContentLoaded', () => {
  // Navigation & Sticky Header logic
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Hamburger menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = navMenu.classList.contains('active') ? 'rotate(45deg) translate(6px, 6px)' : 'none';
      spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
      spans[2].style.transform = navMenu.classList.contains('active') ? 'rotate(-45deg) translate(5px, -5px)' : 'none';
    });
  }

  // Quickstart setup tab switching
  const tabHeaders = document.querySelectorAll('.tab-header');
  const tabContents = document.querySelectorAll('.tab-content');
  tabHeaders.forEach(header => {
    header.addEventListener('click', () => {
      tabHeaders.forEach(h => h.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      header.classList.add('active');
      const tabId = header.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Copy code to clipboard logic
  const copyButtons = document.querySelectorAll('.code-copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const codeText = btn.nextElementSibling.querySelector('code').textContent;
      navigator.clipboard.writeText(codeText).then(() => {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.color = '#10b981';
        btn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 2000);
      });
    });
  });

  // --- RMM SIMULATOR LOGIC ---
  let selectedDevice = 'ubuntu-web'; // Default selected device
  let activeTab = 'devices'; // Active sidebar tab: 'devices', 'desktop', 'terminal', 'files'
  let mouseAnimInterval = null; // Keyboard/mouse automation loop for remote control view

  const devices = {
    'ubuntu-web': {
      name: 'ubuntu-web-server-01',
      os: 'Ubuntu 22.04 LTS',
      ip: '192.168.1.142',
      status: 'online',
      specs: 'Xeon 8c / 16GB RAM / 100GB NVMe',
      amt: 'Out-of-band enabled (vPro v15.2)',
      shellPrompt: 'admin@ubuntu-web-server-01:~$ ',
      files: [
        { name: 'etc', type: 'folder', size: '-', date: '2026-05-01' },
        { name: 'var', type: 'folder', size: '-', date: '2026-05-10' },
        { name: 'home', type: 'folder', size: '-', date: '2026-04-12' },
        { name: 'docker-compose.yml', type: 'file', size: '1.4 KB', date: '2026-05-20' },
        { name: 'nginx.conf', type: 'file', size: '3.2 KB', date: '2026-05-22' }
      ]
    },
    'win-desktop': {
      name: 'corp-win11-desktop',
      os: 'Windows 11 Enterprise',
      ip: '10.0.4.15',
      status: 'online',
      specs: 'Core i7-12700K / 32GB RAM / 512GB SSD',
      amt: 'In-Band Agent (No AMT Hardware)',
      shellPrompt: 'C:\\Users\\Administrator> ',
      files: [
        { name: 'Program Files', type: 'folder', size: '-', date: '2026-02-15' },
        { name: 'Users', type: 'folder', size: '-', date: '2026-03-01' },
        { name: 'Windows', type: 'folder', size: '-', date: '2026-01-10' },
        { name: 'meshagent.exe', type: 'file', size: '8.4 MB', date: '2026-04-18' },
        { name: 'setup_log.txt', type: 'file', size: '42 KB', date: '2026-05-15' }
      ]
    },
    'macos-build': {
      name: 'macos-dev-macbook-pro',
      os: 'macOS Sequoia 15.1',
      ip: '192.168.1.99',
      status: 'online',
      specs: 'Apple M3 Max 14c / 36GB RAM / 1TB SSD',
      amt: 'Agent Managed (Apple Silicon)',
      shellPrompt: 'developer@macos-dev-mbp ~ % ',
      files: [
        { name: 'Applications', type: 'folder', size: '-', date: '2025-12-01' },
        { name: 'Library', type: 'folder', size: '-', date: '2026-01-05' },
        { name: 'Users', type: 'folder', size: '0 B', date: '2026-01-08' },
        { name: 'package.json', type: 'file', size: '820 B', date: '2026-05-23' },
        { name: 'README.md', type: 'file', size: '2.1 KB', date: '2026-05-21' }
      ]
    }
  };

  // Sidebar navigation switcher
  const simMenuItems = document.querySelectorAll('.sim-menu-item');
  const simViews = document.querySelectorAll('.sim-view');

  simMenuItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-view');
      switchTab(targetTab);
    });
  });

  function switchTab(tabName) {
    activeTab = tabName;
    simMenuItems.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-view') === tabName) btn.classList.add('active');
    });

    simViews.forEach(view => {
      view.classList.remove('active');
      if (view.id === `view-${tabName}`) view.classList.add('active');
    });

    // Cleanup mouse animation interval
    if (mouseAnimInterval) {
      clearInterval(mouseAnimInterval);
      mouseAnimInterval = null;
    }

    if (tabName === 'desktop') {
      triggerRemoteDesktopSimulator();
    } else if (tabName === 'terminal') {
      initializeTerminal();
    } else if (tabName === 'files') {
      renderFiles();
    }

    // === Back bar visibility (critical for mobile when sidebar is collapsed) ===
    const backBar = document.getElementById('sim-back-bar');
    const currentDeviceLabel = document.getElementById('sim-current-device');
    const device = devices[selectedDevice];

    if (backBar && currentDeviceLabel) {
      if (tabName === 'devices') {
        backBar.style.display = 'none';
      } else {
        backBar.style.display = 'flex';
        currentDeviceLabel.textContent = device ? device.name : '';
      }
    }
  }

  // Device Rows selection click handlers
  const deviceRows = document.querySelectorAll('.device-row');
  deviceRows.forEach(row => {
    row.addEventListener('click', () => {
      const devId = row.getAttribute('data-device');
      selectedDevice = devId;
      
      // Visual feedback in list
      deviceRows.forEach(r => r.style.borderColor = 'rgba(255, 255, 255, 0.05)');
      row.style.borderColor = 'var(--neon-cyan)';

      // Switch to Remote Desktop immediately
      switchTab('desktop');
    });
  });

  // Quick Action buttons on device list
  const quickControlButtons = document.querySelectorAll('.btn-sim-action');
  quickControlButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid triggering parent row click
      const devId = btn.closest('.device-row').getAttribute('data-device');
      const action = btn.getAttribute('data-action');
      selectedDevice = devId;

      if (action === 'desktop') {
        switchTab('desktop');
      } else if (action === 'terminal') {
        switchTab('terminal');
      } else if (action === 'files') {
        switchTab('files');
      }
    });
  });

  // Persistent Back button (works great on mobile collapsed sidebar)
  const backBtn = document.getElementById('btn-back-devices');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      switchTab('devices');
      // Clear any active border highlights
      document.querySelectorAll('.device-row').forEach(r => r.style.borderColor = 'rgba(255, 255, 255, 0.05)');
    });
  }

  // --- Remote Desktop Screen Simulator ---
  function triggerRemoteDesktopSimulator() {
    const screen = document.getElementById('view-desktop');
    const device = devices[selectedDevice];
    
    // Reset view
    screen.innerHTML = `
      <div class="remote-screen">
        <div class="remote-screen-bar">
          <div>🌐 SECURE WEBSOCKET TUNNEL | IP: <span>${device.ip}</span></div>
          <div>DESKTOP | CONNECTED VIA HTTPS | AES-GCM 256</div>
          <button id="btn-desktop-disconnect" style="background:rgba(239, 68, 68, 0.2); border:1px solid rgba(239, 68, 68, 0.4); color:#f87171; padding:4px 12px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer; transition:all 0.2s ease; border: none; font-family: var(--font-heading);">✕ DISCONNECT</button>
        </div>
        <div class="desktop-overlay">
          <div class="desktop-spinner"></div>
          <div class="desktop-overlay-text">Connecting to ${device.name}...</div>
        </div>
        <div class="remote-desktop-animation">
          <svg class="desktop-mouse animate-mouse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
            <path d="M5 2l21 12-9.5 2.5L22 23l-3.5 1.5-5.5-6.5L5 23V2z" fill="#000" stroke="#fff" stroke-width="2"/>
          </svg>
          <div id="desktop-bg" style="width:100%; height:100%; background: linear-gradient(135deg, #1e293b, #0f172a); display: flex; flex-direction: column; padding: 50px 30px; position:relative;">
            <!-- Custom UI Mock depending on OS -->
          </div>
        </div>
      </div>
    `;

    const overlay = screen.querySelector('.desktop-overlay');
    const overlayText = screen.querySelector('.desktop-overlay-text');
    const desktopBg = document.getElementById('desktop-bg');
    const mouse = screen.querySelector('.desktop-mouse');

    // Bind disconnect button
    const disconnectBtn = screen.querySelector('#btn-desktop-disconnect');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => {
        switchTab('devices');
      });
      disconnectBtn.addEventListener('mouseenter', () => {
        disconnectBtn.style.background = 'rgba(239, 68, 68, 0.4)';
        disconnectBtn.style.color = '#fff';
      });
      disconnectBtn.addEventListener('mouseleave', () => {
        disconnectBtn.style.background = 'rgba(239, 68, 68, 0.2)';
        disconnectBtn.style.color = '#f87171';
      });
    }

    // Loader Steps Simulation
    setTimeout(() => {
      overlayText.textContent = 'Performing WebRTC peer handshake...';
    }, 500);

    setTimeout(() => {
      overlayText.textContent = 'Session authenticated. Decrypting stream...';
    }, 1000);

    setTimeout(() => {
      // Hide loader and show beautiful mock OS desktop
      overlay.style.display = 'none';
      mouse.style.display = 'block';

      // Load correct wallpaper and mock applications
      if (selectedDevice === 'ubuntu-web') {
        renderUbuntuDesktop(desktopBg);
        bindUbuntuButtons();
      } else if (selectedDevice === 'win-desktop') {
        renderWindowsDesktop(desktopBg);
        bindWindowsButtons(desktopBg);
      } else if (selectedDevice === 'macos-build') {
        renderMacOSDesktop(desktopBg);
        bindMacOSButtons();
      }

      // Start automatic mouse interactions
      animateMouseInteractions(mouse, desktopBg);
    }, 1600);
  }

  function renderUbuntuDesktop(container) {
    container.style.background = 'linear-gradient(135deg, #77216F 0%, #5E2750 100%)';
    container.innerHTML = `
      <div style="position:absolute; left:0; top:36px; bottom:0; width:64px; background:rgba(0,0,0,0.6); display:flex; flex-direction:column; align-items:center; padding:16px 0; gap:20px; z-index:8;">
        <!-- Ubuntu Dock Icons -->
        <div style="width:36px; height:36px; border-radius:8px; background:#e95420; display:flex; align-items:center; justify-content:center; cursor:pointer;">
          <svg style="width:20px; height:20px; fill:#fff;" viewBox="0 0 24 24"><path d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8Z"/></svg>
        </div>
        <div id="dock-term" style="width:36px; height:36px; border-radius:8px; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; cursor:pointer;" title="Launch Terminal Shell">
          <svg style="width:20px; height:20px; fill:#4ade80;" viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 14H4V6h16v12ZM8 10h8v2H8v-2Z"/></svg>
        </div>
      </div>
      <div style="flex:1; display:flex; justify-content:center; align-items:center; padding-left:64px;">
        <div id="desktop-window" class="glass-card" style="width:480px; height:280px; background:#1e1e24; border:1px solid rgba(255,255,255,0.15); border-radius:8px; padding:0; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 15px 30px rgba(0,0,0,0.5);">
          <div style="background:#2d2d34; padding:8px 16px; display:flex; justify-content:space-between; align-items:center; font-size:12px; font-weight:700;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span id="ubuntu-close-btn" style="width:10px; height:10px; border-radius:50%; background:#ef4444; cursor:pointer;" title="Disconnect Session"></span>
              <span style="width:10px; height:10px; border-radius:50%; background:#f59e0b;"></span>
              <span style="width:10px; height:10px; border-radius:50%; background:#10b981;"></span>
              <span>Bash Shell Terminal</span>
            </div>
            <div style="color:rgba(255,255,255,0.4);">admin@ubuntu-web-server-01</div>
          </div>
          <div id="term-text" style="flex:1; padding:16px; font-family:var(--font-mono); font-size:12px; color:#4ade80; overflow-y:auto; line-height:1.4;">
            admin@ubuntu-web-server-01:~$ neofetch<br>
          </div>
        </div>
      </div>
    `;
  }

  function bindUbuntuButtons() {
    const closeBtn = document.getElementById('ubuntu-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        switchTab('devices');
      });
    }

    const dockTerm = document.getElementById('dock-term');
    if (dockTerm) {
      dockTerm.addEventListener('click', () => {
        switchTab('terminal');
      });
    }
  }

  function renderWindowsDesktop(container) {
    container.style.background = 'radial-gradient(circle, #1d4ed8 0%, #1e1b4b 100%)';
    container.innerHTML = `
      <div style="position:absolute; bottom:0; left:0; right:0; height:48px; background:rgba(30,41,59,0.7); backdrop-filter:blur(8px); display:flex; justify-content:center; align-items:center; border-top:1px solid rgba(255,255,255,0.08); z-index:8;">
        <!-- Windows Taskbar -->
        <div style="display:flex; gap:12px;">
          <div style="width:32px; height:32px; border-radius:6px; background:#0078d4; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="Windows Start Menu">
            <svg style="width:16px; height:16px; fill:#fff;" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.55v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zM10.8 12.45H24v11.55l-13.2-1.95v-9.6z"/></svg>
          </div>
          <div id="task-edge" style="width:32px; height:32px; border-radius:6px; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; cursor:pointer;" title="Launch Microsoft Edge Web Browser">
            <span style="color:#38bdf8; font-size:16px; font-weight:900; font-family:var(--font-heading)">e</span>
          </div>
        </div>
      </div>
      <div style="flex:1; display:flex; justify-content:center; align-items:center; padding-bottom:48px;">
        <div id="desktop-window" style="width:500px; height:300px; background:#ffffff; color:#333; border-radius:8px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 20px 40px rgba(0,0,0,0.4); border: 1px solid #c8c8c8;">
          <div style="background:#f3f3f3; padding:10px 16px; display:flex; justify-content:space-between; align-items:center; font-size:12px; font-weight:600; border-bottom:1px solid #e5e5e5; user-select: none;">
            <div style="display:flex; align-items:center; gap:8px;">
              <svg style="width:14px; height:14px; fill:#0078d4;" viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 14H4V6h16v12Z"/></svg>
              <span>Services Management Console</span>
            </div>
            <div style="display:flex; gap:12px; color:#555; align-items:center;">
              <span style="cursor:pointer;" title="Minimize">―</span>
              <span style="cursor:pointer;" title="Maximize">❑</span>
              <span id="win-close-btn" style="cursor:pointer; font-weight:bold; font-size:14px; padding: 2px 6px;" title="Disconnect Session">✕</span>
            </div>
          </div>
          <div style="flex:1; display:flex; background:#fff; font-size:12px;">
            <div style="width:140px; background:#f9f9f9; border-right:1px solid #e0e0e0; padding:12px; user-select: none;">
              <h5 style="font-weight:700; margin-bottom:8px;">System Services</h5>
              <p style="font-size:11px; color:#666; line-height:1.4;">Manage startup parameters and agent scripts.</p>
            </div>
            <div style="flex:1; padding:16px; display:flex; flex-direction:column; gap:12px;">
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding-bottom:6px; font-weight:700;">
                <span>Name</span>
                <span>Status</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:11px;">
                <span>MeshAgent Remote Client</span>
                <span id="win-service-status" style="color:#059669; font-weight:700;">Running</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:11px;">
                <span>Intel(R) AMT LMS Service</span>
                <span style="color:#059669; font-weight:700;">Running</span>
              </div>
              <button id="win-btn-restart" style="align-self:flex-start; margin-top:20px; padding:8px 16px; background:#0078d4; border:none; border-radius:4px; color:#fff; font-weight:600; cursor:pointer; transition: all 0.2s ease;">Restart MeshAgent</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bindWindowsButtons(container) {
    const closeBtn = document.getElementById('win-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        switchTab('devices');
      });
    }

    const restartBtn = document.getElementById('win-btn-restart');
    const serviceStatus = document.getElementById('win-service-status');
    if (restartBtn && serviceStatus) {
      restartBtn.addEventListener('click', () => {
        serviceStatus.textContent = 'Restarting...';
        serviceStatus.style.color = '#f59e0b';
        restartBtn.disabled = true;
        restartBtn.style.opacity = '0.6';
        
        // Stop any active automated mouse animation to not conflict
        if (mouseAnimInterval) {
          clearInterval(mouseAnimInterval);
          mouseAnimInterval = null;
        }

        setTimeout(() => {
          serviceStatus.textContent = 'Running';
          serviceStatus.style.color = '#059669';
          restartBtn.disabled = false;
          restartBtn.style.opacity = '1';
        }, 1500);
      });

      restartBtn.addEventListener('mouseenter', () => {
        if (!restartBtn.disabled) restartBtn.style.background = '#005a9e';
      });
      restartBtn.addEventListener('mouseleave', () => {
        if (!restartBtn.disabled) restartBtn.style.background = '#0078d4';
      });
    }

    const taskEdge = document.getElementById('task-edge');
    if (taskEdge) {
      taskEdge.addEventListener('click', () => {
        const desktopWindow = document.getElementById('desktop-window');
        if (desktopWindow) {
          desktopWindow.innerHTML = `
            <div style="background:#f3f3f3; padding:8px 12px; display:flex; flex-direction:column; gap:6px; border-bottom:1px solid #ccc; color:#333; user-select: none;">
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px;">
                <div style="display:flex; gap:6px; align-items:center;">
                  <span id="win-close-btn-browser" style="cursor:pointer; width:12px; height:12px; border-radius:50%; background:#ff5f56; display:inline-block;" title="Close Browser Window"></span>
                  <span style="width:12px; height:12px; border-radius:50%; background:#ffbd2e; display:inline-block;"></span>
                  <span style="width:12px; height:12px; border-radius:50%; background:#27c93f; display:inline-block;"></span>
                </div>
                <div style="font-weight:700;">Microsoft Edge</div>
                <div></div>
              </div>
              <div style="background:#fff; border:1px solid #c8c8c8; border-radius:4px; padding:2px 8px; font-size:11px; display:flex; align-items:center; gap:8px;">
                <span style="color:#059669; font-weight:bold;">🔒 Https://</span>info.meshcentral.com
              </div>
            </div>
            <div style="flex:1; background:#fff; padding:16px; font-family:var(--font-heading); color:#333; overflow-y:auto; font-size:12px; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
              <h4 style="font-weight:800; color:#0078d4; margin-bottom:8px; font-size:16px;">Welcome to MeshCentral Info!</h4>
              <p style="font-size:11px; line-height:1.4; color:#666; margin-bottom:16px; max-width:300px;">You are currently managing this remote PC via our completely clientless web agent. It's safe, open-source, and lightning-fast.</p>
              <button id="win-browser-back" style="padding:6px 14px; background:#0078d4; border:none; border-radius:4px; color:#fff; font-weight:600; cursor:pointer;">Back to Services</button>
            </div>
          `;
          
          // Bind back button
          const backBtn = document.getElementById('win-browser-back');
          if (backBtn) {
            backBtn.addEventListener('click', () => {
              renderWindowsDesktop(container);
              bindWindowsButtons(container);
            });
          }
          
          // Bind close button
          const closeBtnBrowser = document.getElementById('win-close-btn-browser');
          if (closeBtnBrowser) {
            closeBtnBrowser.addEventListener('click', () => {
              renderWindowsDesktop(container);
              bindWindowsButtons(container);
            });
          }
        }
      });
    }
  }

  function renderMacOSDesktop(container) {
    container.style.background = 'linear-gradient(135deg, #fb7185 0%, #e11d48 50%, #881337 100%)';
    container.innerHTML = `
      <div style="position:absolute; top:36px; left:0; right:0; height:24px; background:rgba(255,255,255,0.15); backdrop-filter:blur(8px); display:flex; justify-content:space-between; align-items:center; padding:0 16px; font-size:12px; font-weight:600; color:#fff; z-index:8;">
        <!-- MacOS Menu Bar -->
        <div style="display:flex; gap:16px;">
          <span></span>
          <span style="font-weight:800;">Finder</span>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
        </div>
        <div>9:41 AM</div>
      </div>
      <div style="flex:1; display:flex; justify-content:center; align-items:center; padding-top:24px;">
        <div id="desktop-window" class="glass-card" style="width:480px; height:280px; background:rgba(25, 25, 35, 0.85); border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:0; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.5);">
          <!-- macOS Window Title Bar -->
          <div style="background:rgba(255,255,255,0.06); width:100%; padding:8px 16px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); user-select: none;">
            <div style="display:flex; gap:6px;">
              <span id="mac-close-btn" style="width:12px; height:12px; border-radius:50%; background:#ff5f56; cursor:pointer;" title="Disconnect Session"></span>
              <span style="width:12px; height:12px; border-radius:50%; background:#ffbd2e;"></span>
              <span style="width:12px; height:12px; border-radius:50%; background:#27c93f;"></span>
            </div>
            <div style="font-size:11px; color:rgba(255,255,255,0.4);">Terminal - developer@macos-dev-mbp</div>
            <div></div>
          </div>
          <!-- Window Content -->
          <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:24px; gap:16px; text-align:center;">
            <div style="width:64px; height:64px; border-radius:16px; background:linear-gradient(135deg, var(--neon-cyan), var(--neon-purple)); display:flex; align-items:center; justify-content:center; box-shadow:0 8px 16px rgba(0,0,0,0.3);">
              <svg style="width:36px; height:36px; fill:#fff;" viewBox="0 0 24 24"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18Z"/></svg>
            </div>
            <div>
              <h4 style="font-size:18px; font-weight:700; margin-bottom:4px;">macOS Development Environment</h4>
              <p style="color:rgba(255,255,255,0.6); max-width:320px; font-size:11px; line-height:1.4;">MeshAgent active on port 16990. Encryption tunnel verified. Device ready for deployment.</p>
            </div>
            <div style="display:flex; gap:12px; margin-top:8px;">
              <button id="mac-btn-action" style="padding:8px 16px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#fff; font-weight:600; cursor:pointer;">Update Agent</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bindMacOSButtons() {
    const closeBtn = document.getElementById('mac-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        switchTab('devices');
      });
    }

    const actionBtn = document.getElementById('mac-btn-action');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        actionBtn.textContent = 'Updating Agent...';
        actionBtn.style.color = '#f59e0b';
        actionBtn.disabled = true;
        
        // Stop any active automated mouse animation to not conflict
        if (mouseAnimInterval) {
          clearInterval(mouseAnimInterval);
          mouseAnimInterval = null;
        }

        setTimeout(() => {
          actionBtn.textContent = 'Agent Updated!';
          actionBtn.style.color = '#34d399';
          actionBtn.disabled = false;
        }, 1500);
      });
    }
  }

  // Auto mouse movement simulator inside Remote Desktop
  function animateMouseInteractions(mouse, desktopBg) {
    let step = 0;
    
    mouseAnimInterval = setInterval(() => {
      if (selectedDevice === 'ubuntu-web') {
        const termText = document.getElementById('term-text');
        const dockTerm = document.getElementById('dock-term');
        
        if (step === 0) {
          // Move mouse to Terminal Dock
          mouse.style.transform = 'translate(-120px, 30px)';
          step++;
        } else if (step === 1) {
          // Highlight Dock
          if (dockTerm) dockTerm.style.background = 'rgba(255, 255, 255, 0.2)';
          step++;
        } else if (step === 2) {
          // Start typing into shell terminal mock
          if (termText) {
            termText.innerHTML += `admin@ubuntu-web-server-01:~$ neofetch<br><span class="white">OS</span>: Ubuntu 22.04 LTS x86_64<br><span class="white">Kernel</span>: 5.15.0-82-generic<br><span class="white">Uptime</span>: 14 days, 6 hours<br><span class="white">CPU</span>: Intel Xeon (8c)<br><span class="white">Memory</span>: 4210MiB / 16000MiB<br>admin@ubuntu-web-server-01:~$ `;
          }
          mouse.style.transform = 'translate(100px, 50px)';
          step++;
        } else if (step === 3) {
          // Highlight term text complete
          if (dockTerm) dockTerm.style.background = '';
          clearInterval(mouseAnimInterval);
        }
      } else if (selectedDevice === 'win-desktop') {
        const restartBtn = document.getElementById('win-btn-restart');
        const serviceStatus = document.getElementById('win-service-status');

        if (step === 0) {
          // Move mouse to Restart button
          mouse.style.transform = 'translate(150px, 120px)';
          step++;
        } else if (step === 1) {
          // Trigger click
          if (restartBtn) restartBtn.style.background = '#005a9e';
          if (serviceStatus) {
            serviceStatus.textContent = 'Restarting...';
            serviceStatus.style.color = '#f59e0b';
          }
          step++;
        } else if (step === 2) {
          // Return button color, mark running
          if (restartBtn) restartBtn.style.background = '';
          if (serviceStatus) {
            serviceStatus.textContent = 'Running';
            serviceStatus.style.color = '#059669';
          }
          mouse.style.transform = 'translate(-40px, -20px)';
          clearInterval(mouseAnimInterval);
        }
      } else if (selectedDevice === 'macos-build') {
        const actionBtn = document.getElementById('mac-btn-action');
        if (step === 0) {
          // Move mouse to Action button
          mouse.style.transform = 'translate(0px, 120px)';
          step++;
        } else if (step === 1) {
          if (actionBtn) actionBtn.style.background = 'rgba(255, 255, 255, 0.2)';
          step++;
        } else if (step === 2) {
          if (actionBtn) {
            actionBtn.style.background = '';
            actionBtn.textContent = 'Agent Updated!';
            actionBtn.style.color = '#34d399';
          }
          mouse.style.transform = 'translate(-80px, -40px)';
          clearInterval(mouseAnimInterval);
        }
      }
    }, 1200);
  }

  // --- Interactive Terminal Simulator ---
  function initializeTerminal() {
    const termContainer = document.getElementById('view-terminal');
    const device = devices[selectedDevice];

    termContainer.innerHTML = `
      <div class="terminal-window">
        <div class="terminal-line">MeshCentral secure SSH console tunnel established.<br>Session encryption protocol: TLSv1.3 AES-256-GCM.<br>Type <span class="green">'help'</span> to see all simulated administrative commands.</div>
        <div class="terminal-line">${device.name} login: admin (authenticated via key pair)<br>Last login: ${new Date().toLocaleDateString()} from 192.168.1.5</div>
        <div id="terminal-history"></div>
        <div class="terminal-input-row">
          <span class="terminal-prompt" id="term-prompt">${device.shellPrompt}</span>
          <input type="text" class="terminal-input-field" id="term-input" autocomplete="off" autofocus>
        </div>
      </div>
    `;

    const termInput = document.getElementById('term-input');
    const terminalHistory = document.getElementById('terminal-history');

    // Automatically focus the input
    termInput.focus();

    // Event listener for commands
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const command = termInput.value.trim();
        termInput.value = '';
        if (command) {
          executeTerminalCommand(command, terminalHistory, device.shellPrompt);
        }
      }
    });

    // Make clicking the container refocus the terminal input
    const termWindow = termContainer.querySelector('.terminal-window');
    termWindow.addEventListener('click', () => termInput.focus());
  }

  function executeTerminalCommand(cmdString, historyContainer, prompt) {
    const args = cmdString.split(' ');
    const command = args[0].toLowerCase();
    
    // Add command to history view
    let commandLine = `<div class="terminal-line"><span class="terminal-prompt">${prompt}</span><span class="white">${cmdString}</span></div>`;
    historyContainer.innerHTML += commandLine;

    let output = '';

    switch (command) {
      case 'help':
        output = `
Available Simulated Commands:
  <span class="green">help</span>       - Displays this diagnostic help menu
  <span class="green">neofetch</span>   - Fetches and renders system profile ASCII
  <span class="green">stats</span>      - Monitors system resource load metrics
  <span class="green">agent</span>      - Checks client MeshAgent daemon service status
  <span class="green">amt</span>        - Assesses Intel AMT out-of-band hardware status
  <span class="green">clear</span>      - Clears terminal logs screen
  <span class="green">exit</span>       - Ends remote console management session
`;
        break;

      case 'neofetch':
        output = renderNeofetchOutput();
        break;

      case 'stats':
        output = `
Resource Utilization:
  [<span class="green">■■■■■■■■■■■■■■■■</span>] <span class="white">CPU Load</span>: 28%
  [<span class="green">■■■■■■■■■■■■■■■■■■■■</span>] <span class="white">RAM Usage</span>: 39% (6.2 GB / 16.0 GB)
  [<span class="green">■■■■■■■■</span>] <span class="white">Disk Storage</span>: 15% (15 GB / 100 GB)
  <span class="yellow">Network Latency (RTT)</span>: 12ms via Tunnel Proxy
`;
        break;

      case 'agent':
        const dev = devices[selectedDevice];
        output = `
MeshAgent Daemon Status:
  <span class="white">Active State</span>: <span class="green">active (running)</span> since Mon 2026-05-18
  <span class="white">Agent Build</span>: Version v1.0.84-Release
  <span class="white">Security Protocol</span>: TLSv1.3 RSA-2048 client verification
  <span class="white">Server Target</span>: wss://meshcentral.com/agent.ashx
  <span class="white">Management Path</span>: Node ID: wUe8R/jNq78Bw8X2...
`;
        break;

      case 'amt':
        output = `
Intel Active Management Technology (Intel AMT) Diagnostics:
  <span class="white">AMT State</span>: <span class="green">Provisioned (Active Mode)</span>
  <span class="white">Out-of-band Interface</span>: Enabled (Dedicated LAN interface)
  <span class="white">AMT Version</span>: Intel vPro AMT Firmware v15.2.4
  <span class="white">CIRA Tunnel Tunnel State</span>: <span class="green">CONNECTED</span>
  <span class="white">Direct Power Control</span>: Enabled (Hardware power actions ready)
`;
        break;

      case 'clear':
        historyContainer.innerHTML = '';
        return;

      case 'exit':
        output = `Session terminated. Switching back to Device Dashboard...`;
        setTimeout(() => switchTab('devices'), 1500);
        break;

      default:
        output = `<span class="red">Command not recognized: '${command}'. Type <span class="green">'help'</span> for instructions.</span>`;
    }

    historyContainer.innerHTML += `<div class="terminal-line">${output}</div>`;
    
    // Auto scroll to bottom
    const termWindow = document.querySelector('.terminal-window');
    if (termWindow) {
      termWindow.scrollTop = termWindow.scrollHeight;
    }
  }

  function renderNeofetchOutput() {
    if (selectedDevice === 'ubuntu-web') {
      return [
        "<span class=\"yellow\">        _,,,--,,_         </span>  <span class=\"purple\">admin@ubuntu-web-server-01</span>",
        "<span class=\"yellow\">      /'         \`\\       </span>  --------------------------",
        "<span class=\"yellow\">     /   _,,---,,_  \\     </span>  OS: Ubuntu 22.04 LTS",
        "<span class=\"yellow\">    |   /         \\  |    </span>  Kernel: Linux 5.15.0-82-generic",
        "<span class=\"yellow\">    |  |           | |    </span>  Uptime: 14 days, 6 hours",
        "<span class=\"yellow\">    |   \\_       _/  |    </span>  Shell: bash 5.1.16",
        "<span class=\"yellow\">     \\    \`\`---'    /     </span>  CPU: Intel(R) Xeon(R) Gold (8c)",
        "<span class=\"yellow\">      \\,_         _/      </span>  Memory: 6240MiB / 16000MiB",
        "<span class=\"yellow\">         \`\`\`----'''       </span>  RMM Connection: <span class=\"green\">MeshAgent Tunnel</span>"
      ].join("\n");
    } else if (selectedDevice === 'win-desktop') {
      return [
        "<span class=\"green\">  #############  #############  </span>  <span class=\"purple\">Administrator@corp-win11-desktop</span>",
        "<span class=\"green\">  #############  #############  </span>  --------------------------------",
        "<span class=\"green\">  #############  #############  </span>  OS: Windows 11 Enterprise x86_64",
        "<span class=\"green\">  #############  #############  </span>  Kernel: Windows 11 Build 22621",
        "<span class=\"green\">                                </span>  Uptime: 3 days, 12 hours",
        "<span class=\"green\">  #############  #############  </span>  Shell: Powershell v7.3",
        "<span class=\"green\">  #############  #############  </span>  CPU: Intel(R) Core(TM) i7-12700K",
        "<span class=\"green\">  #############  #############  </span>  Memory: 12210MiB / 32000MiB",
        "<span class=\"green\">  #############  #############  </span>  RMM Connection: <span class=\"green\">MeshAgent active</span>"
      ].join("\n");
    } else {
      return [
        "<span class=\"purple\">       .:'                      </span>  <span class=\"purple\">developer@macos-dev-macbook-pro</span>",
        "<span class=\"purple\">    __ :'__                     </span>  -------------------------------",
        "<span class=\"purple\"> .'\`  \`'\`  \`'.                  </span>  OS: macOS Sequoia 15.1",
        "<span class=\"purple\">:             :                 </span>  Kernel: Darwin 24.1.0",
        "<span class=\"purple\"> '  .     .  '                  </span>  Uptime: 5 days, 2 hours",
        "<span class=\"purple\">   \`'-' '-'                     </span>  Shell: zsh 5.9",
        "<span class=\"purple\">    /     \\                     </span>  CPU: Apple M3 Max (14 cores)",
        "<span class=\"purple\">   |       |                    </span>  Memory: 18410MiB / 36000MiB",
        "<span class=\"purple\">    \\_____/                     </span>  RMM Connection: <span class=\"green\">MeshAgent active</span>"
      ].join("\n");
    }
  }

  // --- File Explorer Panel Simulator ---
  function renderFiles() {
    const fileContainer = document.getElementById('view-files');
    const device = devices[selectedDevice];
    let path = selectedDevice === 'win-desktop' ? 'C:\\Users\\Administrator\\Downloads' : '/var/www/html/downloads';

    fileContainer.innerHTML = `
      <div class="file-view">
        <div class="file-header-bar">
          <div class="file-path">Remote Path: <span>${path}</span></div>
          <div class="file-action-buttons">
            <button class="btn-file-icon" id="btn-new-folder" title="New Folder">
              <svg style="width:18px; height:18px; fill:currentColor;" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2Zm-1 12H4V6h5.17l2 2H20v10Z"/></svg>
            </button>
            <button class="btn-file-icon" id="btn-upload-file" title="Upload File">
              <svg style="width:18px; height:18px; fill:currentColor;" viewBox="0 0 24 24"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96ZM14 13v4h-4v-4H7l5-5 5 5h-3Z"/></svg>
            </button>
          </div>
        </div>
        <div class="file-list" id="sim-file-list"></div>
      </div>
      <div id="download-notif" style="position:fixed; bottom:24px; right:24px; background:#10b981; color:#000; font-family:var(--font-heading); font-weight:800; font-size:14px; padding:12px 24px; border-radius:12px; box-shadow:0 10px 25px rgba(16,185,129,0.3); display:flex; align-items:center; gap:8px; z-index:1000; transform:translateY(150px); transition:transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
        <svg style="width:18px; height:18px; fill:currentColor;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z"/></svg>
        <span>File downloaded successfully!</span>
      </div>
    `;

    const fileListElement = document.getElementById('sim-file-list');
    const notifElement = document.getElementById('download-notif');
    const uploadBtn = document.getElementById('btn-upload-file');
    const newFolderBtn = document.getElementById('btn-new-folder');

    // Populate file list rows
    device.files.forEach(file => {
      const fileRow = document.createElement('div');
      fileRow.className = 'file-item';
      fileRow.innerHTML = `
        <div class="file-item-name ${file.type}">
          ${file.type === 'folder' 
            ? `<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2Z" fill="currentColor"/></svg>`
            : `<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6Zm2 16H8v-2h8v2Zm0-4H8v-2h8v2Z" fill="currentColor"/></svg>`
          }
          <span>${file.name}</span>
        </div>
        <div class="file-item-meta">${file.size} | Last Modified: ${file.date}</div>
      `;

      // Click to trigger download logic if it's a file
      fileRow.addEventListener('click', () => {
        if (file.type === 'file') {
          // Show mock download complete toast
          notifElement.querySelector('span').textContent = `Downloaded file: ${file.name}`;
          notifElement.style.transform = 'translateY(0)';
          
          setTimeout(() => {
            notifElement.style.transform = 'translateY(150px)';
          }, 3000);
        } else {
          // Display dialog that this is a simulated subfolder
          notifElement.querySelector('span').textContent = `Opened simulated folder: ${file.name}`;
          notifElement.style.transform = 'translateY(0)';
          setTimeout(() => notifElement.style.transform = 'translateY(150px)', 2500);
        }
      });

      fileListElement.appendChild(fileRow);
    });

    // Mock Upload Logic
    uploadBtn.addEventListener('click', () => {
      notifElement.querySelector('span').textContent = `File upload complete! Agent synchronized.`;
      notifElement.style.transform = 'translateY(0)';
      setTimeout(() => {
        notifElement.style.transform = 'translateY(150px)';
      }, 3000);
    });

    // Mock New Folder Logic
    newFolderBtn.addEventListener('click', () => {
      notifElement.querySelector('span').textContent = `Created simulated folder in: ${path}`;
      notifElement.style.transform = 'translateY(0)';
      setTimeout(() => {
        notifElement.style.transform = 'translateY(150px)';
      }, 3000);
    });
  }
});
