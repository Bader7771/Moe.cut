import { useEffect, useRef, useState } from 'react';
import CollaboratorImage from './CollaboratorImage';

export default function CollaboratorsAdmin({ styles, onLogout }) {
  const { inputStyle, btnPrimaryStyle, btnSecondaryStyle, actionBtnStyle } = styles;
  const [records, setRecords] = useState([]);
  const [listing, setListing] = useState(true);
  const [listError, setListError] = useState('');
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [followers, setFollowers] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInput = useRef(null);
  const nameInput = useRef(null);

  const fetchRecords = async (signal) => {
    setListing(true);
    setListError('');
    try {
      const response = await fetch('/api/collaborators', { signal, cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load collaborators. Please retry.');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Failed to load collaborators. Please retry.');
      setRecords(data);
    } catch (err) {
      if (err.name !== 'AbortError') setListError(err.message || 'Unable to connect to the backend.');
    } finally { if (!signal?.aborted) setListing(false); }
  };
  useEffect(() => {
    const controller = new AbortController();
    fetchRecords(controller.signal);
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!image) { setPreview(''); return undefined; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const reset = () => {
    setEditing(null); setName(''); setFollowers(''); setImage(null);
    if (fileInput.current) fileInput.current.value = '';
  };
  const notify = () => {
    try { localStorage.setItem('collaboratorsUpdatedAt', String(Date.now())); } catch { /* Public pages also refresh on focus and periodically. */ }
  };
  const edit = record => {
    setEditing(record); setName(record.name); setFollowers(record.followers); setImage(null);
    setError(''); setSuccess('');
    if (fileInput.current) fileInput.current.value = '';
    nameInput.current?.focus();
  };
  const submit = async event => {
    event.preventDefault(); setError(''); setSuccess('');
    if (!name.trim() || !followers.trim()) { setError('Enter a collaborator name and followers.'); return; }
    if (!image && !editing) { setError('A collaborator image is required.'); return; }
    if (image && (image.size > 4 * 1024 * 1024 || !/^image\/(jpeg|png|webp|gif)$/.test(image.type))) {
      setError('Upload a JPG, PNG, WebP, or GIF image, maximum 4 MiB.'); return;
    }
    setBusy(true);
    const body = new FormData();
    body.set('name', name.trim()); body.set('followers', followers.trim());
    if (image) body.set('image', image);
    try {
      const response = await fetch(editing ? `/api/collaborators/${editing._id}` : '/api/collaborators', {
        method: editing ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }, body,
      });
      const result = await response.json();
      if (response.status === 401) { onLogout(); return; }
      if (!response.ok) throw new Error(result.message || 'Failed to save collaborator.');
      setSuccess(editing ? 'Collaborator updated!' : 'Collaborator added!');
      reset(); notify(); await fetchRecords();
    } catch (err) { setError(err.message || 'Network error during save.'); }
    finally { setBusy(false); }
  };
  const remove = async record => {
    if (!window.confirm('Are you sure you want to delete this collaborator?')) return;
    setBusy(true); setError(''); setSuccess('');
    try {
      const response = await fetch(`/api/collaborators/${record._id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      const result = await response.json();
      if (response.status === 401) { onLogout(); return; }
      if (!response.ok) throw new Error(result.message || 'Failed to delete collaborator.');
      if (editing?._id === record._id) reset();
      setSuccess('Collaborator deleted!'); notify(); await fetchRecords();
    } catch (err) { setError(err.message || 'Network error during delete.'); }
    finally { setBusy(false); }
  };
  const previewImage = preview || editing?.image;
  return (
    <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 400px', minWidth: 0, maxWidth: '100%', padding: '2rem', background: '#111', borderRadius: '4px', border: '1px solid #222' }}>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 2rem', letterSpacing: '0.05em' }}>{editing ? 'EDIT COLLABORATOR' : 'ADD COLLABORATOR'}</h2>
        {error && <p role="alert" style={{ color: '#ff4d4d', fontSize: '0.875rem' }}>{error}</p>}
        {success && <p role="status" style={{ color: '#4ade80', fontSize: '0.875rem' }}>{success}</p>}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="collaborator-image" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: '#aaa' }}>IMAGE {editing && '(LEAVE BLANK TO KEEP EXISTING)'}</label>
            <input id="collaborator-image" ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" required={!editing} disabled={busy} onChange={event => setImage(event.target.files[0] || null)} style={{ color: '#fff', fontFamily: 'inherit', width: '100%', minWidth: 0 }} />
            <p style={{ color: '#aaa', fontSize: '0.75rem' }}>JPG, PNG, WebP, or GIF · maximum 4 MiB</p>
            {previewImage && <div style={{ width: 80, height: 80, display: 'grid', placeItems: 'center', overflow: 'hidden', background: '#222' }}><CollaboratorImage src={previewImage} name={name || 'Collaborator'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
          </div>
          <label htmlFor="collaborator-name">NAME</label>
          <input id="collaborator-name" ref={nameInput} placeholder="Collaborator name" value={name} onChange={event => setName(event.target.value)} maxLength={200} required disabled={busy} style={inputStyle} />
          <label htmlFor="collaborator-followers">FOLLOWERS</label>
          <input id="collaborator-followers" placeholder="Followers" value={followers} onChange={event => setFollowers(event.target.value)} maxLength={100} required disabled={busy} style={inputStyle} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
            <button disabled={busy} type="submit" style={{ ...btnPrimaryStyle, flex: 1 }}>{busy ? 'SAVING...' : editing ? 'SAVE CHANGES' : 'ADD COLLABORATOR'}</button>
            {editing && <button disabled={busy} type="button" onClick={reset} style={{ ...btnSecondaryStyle, flex: 1 }}>CANCEL</button>}
          </div>
        </form>
      </div>
      <div style={{ flex: '2 1 500px', minWidth: 0, maxWidth: '100%' }}>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 2rem', letterSpacing: '0.05em' }}>EXISTING COLLABORATORS ({records.length})</h2>
        {listing && <p role="status" style={{ color: '#888' }}>Loading collaborators…</p>}
        {listError && <div role="alert"><p style={{ color: '#ff4d4d' }}>{listError}</p><button type="button" disabled={busy} onClick={() => fetchRecords()} style={actionBtnStyle}>RETRY</button></div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {records.map(record => <div key={record._id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#111', border: '1px solid #222', borderRadius: '4px', minWidth: 0 }}>
            <div style={{ width: 80, height: 80, flexShrink: 0, display: 'grid', placeItems: 'center', overflow: 'hidden', background: '#222' }}><CollaboratorImage src={record.image} name={record.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
            <div style={{ flex: '1 1 160px', minWidth: 0, overflowWrap: 'anywhere' }}><h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>{record.name}</h3><p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>{record.followers}</p></div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button disabled={busy} onClick={() => edit(record)} style={actionBtnStyle}>EDIT</button>
              <button disabled={busy} onClick={() => remove(record)} style={{ ...actionBtnStyle, color: '#ff4d4d', borderColor: 'rgba(255,77,77,0.3)' }}>DELETE</button>
            </div>
          </div>)}
          {!listing && !listError && records.length === 0 && <div style={{ color: '#888' }}><p>No collaborators yet</p><button disabled={busy} type="button" style={actionBtnStyle} onClick={() => { reset(); nameInput.current?.focus(); }}>ADD COLLABORATOR</button></div>}
        </div>
      </div>
    </div>
  );
}
