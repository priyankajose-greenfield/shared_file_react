// CLIENT ONLY: Browser File System Access helpers
const HANDLE_KEY = 'shared_json_file_handle_v1';
export function markHandleChosen(): void { try { localStorage.setItem(HANDLE_KEY, '1'); } catch {} }
export function hasHandleMarker(): boolean { try { return localStorage.getItem(HANDLE_KEY) === '1'; } catch { return false; } }
export async function pickJsonFile(): Promise<FileSystemFileHandle | null> {
  try {
    const [handle] = await (window as any).showOpenFilePicker({
      types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
      excludeAcceptAllOption: true,
      multiple: false,
    });
    return handle as FileSystemFileHandle;
  } catch (e: any) { if (e?.name !== 'AbortError') console.error('File pick error', e); return null; }
}
export async function readDb(handle: FileSystemFileHandle): Promise<any[]> { const file = await handle.getFile(); const text = await file.text(); try { const parsed = JSON.parse(text); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
export async function writeDb(handle: FileSystemFileHandle, data: any[]): Promise<void> { const w = await handle.createWritable(); await w.write(JSON.stringify(data, null, 2)); await w.close(); }