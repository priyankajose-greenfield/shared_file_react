
import React, { useCallback, useEffect, useState } from 'react';
import { hasPersistedHandleMarker, pickJsonFile, persistHandle, readDb, writeDb } from './fsAccess';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone is required'),
  address: Yup.string().required('Address is required'),
  gender: Yup.string().required('Gender is required'),
  age: Yup.number().typeError('Age must be a number').min(0, 'Age must be positive').required('Age is required'),
});

const initialValues = { name: '', email: '', phone: '', address: '', gender: '', age: '' };

export default function App() {
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [db, setDb] = useState<any[]>([]);
  // Formik will manage form state
  const [status, setStatus] = useState<string>('Idle');
  const [isPicking, setIsPicking] = useState(false);

  // On mount: if we have a marker, prompt user to re-pick (cannot auto restore silently in current API)
  useEffect(() => {
    if (hasPersistedHandleMarker()) {
      setStatus('Please re-select previously used shared JSON file');
    }
  }, []);

  const handlePick = useCallback(async () => {
    setIsPicking(true);
    try {
      const handle = await pickJsonFile();
      if (handle) {
        setFileHandle(handle);
        persistHandle(handle);
        const data = await readDb(handle);
        setDb(data);
        setStatus('Loaded shared file');
      } else {
        setStatus('File selection cancelled');
      }
    } finally {
      setIsPicking(false);
    }
  }, []);


  const handleSubmit = async (values: typeof initialValues, { resetForm }: any) => {
    if (!fileHandle) {
      alert('Pick the shared JSON file first.');
      return;
    }
    try {
      // Always write to shared file first
      const newDb = [...db, values];
      await writeDb(fileHandle, newDb);
      setDb(newDb);
      setStatus('Appended record locally');

      // If online, also send to server (stub)
      if (navigator.onLine) {
        console.log('Online: would send to server', values);
        setStatus('Saved locally and would send to server');
        // Example: await fetch('/api/submit', {method:'POST', body:JSON.stringify(values)});
      } else {
        setStatus('Saved locally (offline)');
      }
    } catch (err) {
      console.error(err);
      setStatus('Failed to write to shared file');
    }
    resetForm();
  };

  const online = navigator.onLine;
  useEffect(() => {
    const onOnline = () => setStatus('Back online');
    const onOffline = () => setStatus('Offline mode: writes go to shared file');
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <div style={{ maxWidth: 560, margin: 'auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>LAN Shared Form</h1>
      <p style={{ fontSize: 14, color: '#555' }}>
        This app writes to a shared JSON file on your LAN when offline. When online it would
        send to a server (currently simulated in console). All users must choose the SAME file once.
      </p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={handlePick} disabled={isPicking}>
          {fileHandle ? 'Re-Pick Shared JSON File' : (isPicking ? 'Picking...' : 'Pick Shared JSON File')}
        </button>
        <span style={{ fontSize: 12, color: online ? 'green' : 'orangered' }}>
          Status: {online ? 'Online' : 'Offline'} | {status}
        </span>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form style={{ display: 'grid', gap: 12, marginTop: 24 }}>
            <Field name="name" placeholder="Name" />
            <div style={{ color: 'red', fontSize: 12 }}>
              <ErrorMessage name="name" component="div" />
            </div>

            <Field name="email" placeholder="Email" type="email" />
            <div style={{ color: 'red', fontSize: 12 }}>
              <ErrorMessage name="email" component="div" />
            </div>

            <Field name="phone" placeholder="Phone" />
            <div style={{ color: 'red', fontSize: 12 }}>
              <ErrorMessage name="phone" component="div" />
            </div>

            <Field name="address" placeholder="Address" />
            <div style={{ color: 'red', fontSize: 12 }}>
              <ErrorMessage name="address" component="div" />
            </div>

            <Field as="select" name="gender">
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </Field>
            <div style={{ color: 'red', fontSize: 12 }}>
              <ErrorMessage name="gender" component="div" />
            </div>

            <Field name="age" placeholder="Age" type="number" />
            <div style={{ color: 'red', fontSize: 12 }}>
              <ErrorMessage name="age" component="div" />
            </div>

            <button type="submit" disabled={isSubmitting}>Submit</button>
          </Form>
        )}
      </Formik>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ margin: '8px 0' }}>Current Data</h2>
        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 240, overflow: 'auto' }}>
          {JSON.stringify(db, null, 2)}
        </pre>
      </section>

    </div>
  );
}
