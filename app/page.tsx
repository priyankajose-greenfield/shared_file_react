'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Alert, Typography, Grid, MenuItem, Paper } from '@mui/material';
import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import TextField from '@mui/material/TextField';
import { pickJsonFile, hasHandleMarker, markHandleChosen, readDb, writeDb } from '../lib/fsAccess';

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.string().required('Required'),
  address: Yup.string().required('Required'),
  gender: Yup.string().required('Required'),
  age: Yup.number().typeError('Must be a number').min(0, 'Must be >= 0').required('Required'),
});
const initialValues = { name: '', email: '', phone: '', address: '', gender: '', age: '' };
interface SubmissionValues { name: string; email: string; phone: string; address: string; gender: string; age: string; }

function JsonPreview({ db }: { db: any[] }) {
  return <Paper variant="outlined" sx={{ p: 2, maxHeight: 260, overflow: 'auto', fontSize: 12, whiteSpace: 'pre' }}>{JSON.stringify(db, null, 2)}</Paper>;
}

const FormikTextField = ({ name, label, type = 'text', select = false, children }: any) => {
  const { getFieldProps, touched, errors } = useFormikContext<any>();
  const field = getFieldProps(name);
  const error = touched[name] && (errors as any)[name];
  return (
    <TextField {...field} label={label} type={type} select={select} fullWidth size="small" error={Boolean(error)} helperText={error || ' '}>{select && children}</TextField>
  );
};

export default function Page() {
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [db, setDb] = useState<any[]>([]);
  const [status, setStatus] = useState('Idle');
  const [picking, setPicking] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    setOnline(typeof navigator !== 'undefined' ? navigator.onLine : null);
    if (hasHandleMarker()) setStatus('Re-select previously used shared JSON file');
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handlePick = useCallback(async () => {
    setPicking(true);
    try {
      const handle = await pickJsonFile();
      if (handle) {
        setFileHandle(handle);
        markHandleChosen();
        const data = await readDb(handle);
        setDb(data);
        setStatus('Loaded shared file');
      } else {
        setStatus('Cancelled selection');
      }
    } finally { setPicking(false); }
  }, []);

  const submitLogic = async (values: SubmissionValues, resetForm: () => void) => {
    if (!fileHandle) { alert('Pick the shared JSON file first.'); return; }
    try {
      const newDb = [...db, values];
      await writeDb(fileHandle, newDb); setDb(newDb); setStatus('Saved locally');
      if (navigator.onLine) {
        try { await fetch('/api/submit', { method: 'POST', body: JSON.stringify(values), headers: { 'Content-Type': 'application/json' } }); setStatus('Saved locally + sent'); }
        catch { setStatus('Saved locally; send failed'); }
      }
      resetForm();
    } catch { setStatus('Write failure'); }
  };

  return (
    <Box sx={{ maxWidth: 920, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>LAN Shared Form</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Pick a shared JSON file. All users must pick the SAME file.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
        <Button variant="contained" onClick={handlePick} disabled={picking}>{fileHandle ? 'Re-Pick JSON File' : (picking ? 'Picking…' : 'Pick Shared JSON File')}</Button>
       
      </Box>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(vals, helpers) => submitLogic(vals as SubmissionValues, helpers.resetForm)}>
        {({ isSubmitting }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><FormikTextField name="name" label="Name" /></Grid>
              <Grid item xs={12} sm={6}><FormikTextField name="email" label="Email" type="email" /></Grid>
              <Grid item xs={12} sm={6}><FormikTextField name="phone" label="Phone" /></Grid>
              <Grid item xs={12} sm={6}><FormikTextField name="address" label="Address" /></Grid>
              <Grid item xs={12} sm={6}><FormikTextField name="gender" label="Gender" select>
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </FormikTextField></Grid>
              <Grid item xs={12} sm={6}><FormikTextField name="age" label="Age" type="number" /></Grid>
              <Grid item xs={12}><Button type="submit" variant="contained" disabled={isSubmitting || !fileHandle}>Submit</Button></Grid>
            </Grid>
          </Form>
        )}
      </Formik>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Current Data</Typography>
        <JsonPreview db={db} />
      </Box>
     
    </Box>
  );
}