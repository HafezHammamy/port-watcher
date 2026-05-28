const { app, BrowserWindow, ipcMain } = require('electron');
const { execFile } = require('child_process');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 980,
    height: 700,
    title: 'Port Watcher',
    backgroundColor: '#1e1e2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
}

// Run a PowerShell script and return its stdout.
function runPowerShell(script) {
  return new Promise((resolve, reject) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { maxBuffer: 1024 * 1024 * 16, windowsHide: true },
      (err, stdout, stderr) => {
        if (err) {
          reject(new Error(stderr || err.message));
          return;
        }
        resolve(stdout);
      }
    );
  });
}

// PowerShell that lists TCP + UDP endpoints joined with owning process names, as JSON.
const LIST_SCRIPT = `
$procs = @{}
Get-Process -ErrorAction SilentlyContinue | ForEach-Object { $procs[[int]$_.Id] = $_.ProcessName }
$rows = New-Object System.Collections.ArrayList
Get-NetTCPConnection -ErrorAction SilentlyContinue | ForEach-Object {
  [void]$rows.Add([PSCustomObject]@{
    proto   = 'TCP'
    local   = $_.LocalAddress
    port    = [int]$_.LocalPort
    remote  = $_.RemoteAddress
    state   = [string]$_.State
    pid     = [int]$_.OwningProcess
    process = $procs[[int]$_.OwningProcess]
  })
}
Get-NetUDPEndpoint -ErrorAction SilentlyContinue | ForEach-Object {
  [void]$rows.Add([PSCustomObject]@{
    proto   = 'UDP'
    local   = $_.LocalAddress
    port    = [int]$_.LocalPort
    remote  = '*'
    state   = ''
    pid     = [int]$_.OwningProcess
    process = $procs[[int]$_.OwningProcess]
  })
}
$rows | ConvertTo-Json -Depth 3 -Compress
`;

ipcMain.handle('list-ports', async () => {
  const out = await runPowerShell(LIST_SCRIPT);
  const trimmed = (out || '').trim();
  if (!trimmed) return [];
  const parsed = JSON.parse(trimmed);
  return Array.isArray(parsed) ? parsed : [parsed];
});

ipcMain.handle('kill-pid', async (_evt, pid) => {
  const id = parseInt(pid, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Invalid PID');
  }
  await runPowerShell(`Stop-Process -Id ${id} -Force -ErrorAction Stop`);
  return { ok: true, pid: id };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
