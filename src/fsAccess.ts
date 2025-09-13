// Utilities for File System Access API + IndexedDB persistence of file handle
// NOTE: Not all browsers support serializing file handles directly to IndexedDB yet without user gesture.
// We attempt to store with the origin private file system via the File System Access API if available.

export interface StoredHandleMeta {
  kind: 'file';
  name: string;
}

const HANDLE_KEY = 'shared_json_file_handle_v1';

// Some browsers allow structured clone of handles (Chromium). We'll attempt and fallback.
export async function persistHandle(handle: FileSystemFileHandle) {
  try {
    localStorage.setItem(HANDLE_KEY, '1');
    // We cannot silently rehydrate without user gesture; we only store a marker.
  } catch (e) {
    console.warn('Could not persist handle marker', e);
  }
}

export function hasPersistedHandleMarker(): boolean {
  return localStorage.getItem(HANDLE_KEY) === '1';
}

export async function pickJsonFile(): Promise<FileSystemFileHandle | null> {
  try {
    const [handle] = await (window as any).showOpenFilePicker({
      types: [
        { description: 'JSON', accept: { 'application/json': ['.json'] } },
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    });
    return handle as FileSystemFileHandle;
  } catch (e) {
    if ((e as any).name !== 'AbortError') {
      console.error('File pick error', e);
    }
    return null;
  }
}

export async function readDb(handle: FileSystemFileHandle): Promise<any[]> {
  const file = await handle.getFile();
  const text = await file.text();
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeDb(handle: FileSystemFileHandle, data: any[]) {
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}
