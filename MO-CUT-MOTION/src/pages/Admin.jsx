import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

export default function Admin() {
  const navigate = useNavigate();
  
  // Tabs: 'projects' or 'testimonials'
  const [activeTab, setActiveTab] = useState('projects');

  // --- PROJECTS STATE ---
  const [projects, setProjects] = useState([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectCategory, setProjectCategory] = useState('');
  const [projectClient, setProjectClient] = useState('');
  const [projectYear, setProjectYear] = useState(new Date().getFullYear().toString());
  const [projectAlt, setProjectAlt] = useState('');
  const [projectImage, setProjectImage] = useState(null);
  const [projectEditingId, setProjectEditingId] = useState(null);

  // --- TESTIMONIALS STATE ---
  const [testimonials, setTestimonials] = useState([]);
  const [testName, setTestName] = useState('');
  const [testReview, setTestReview] = useState('');
  const [testImage, setTestImage] = useState(null);
  const [testEditingId, setTestEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
    } else {
      fetchProjects();
      fetchTestimonials();
    }
  }, [navigate]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch projects');
    }
  };

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (err) {
      console.error('Failed to fetch testimonials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  // --- PROJECTS LOGIC ---
  const handleEditProject = (p) => {
    setProjectEditingId(p._id || p.projectId);
    setProjectTitle(p.title);
    setProjectCategory(p.category);
    setProjectClient(p.client);
    setProjectYear(p.year);
    setProjectAlt(p.alt || '');
    setProjectImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelProjectEdit = () => {
    setProjectEditingId(null);
    setProjectTitle('');
    setProjectCategory('');
    setProjectClient('');
    setProjectYear(new Date().getFullYear().toString());
    setProjectAlt('');
    setProjectImage(null);
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`/api/projects/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) fetchProjects();
      else alert("Failed to delete project");
    } catch (err) {
      alert("Network error");
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('title', projectTitle);
    formData.append('category', projectCategory);
    formData.append('client', projectClient);
    formData.append('year', projectYear);
    formData.append('alt', projectAlt);
    
    if (projectImage) formData.append('image', projectImage);
    else if (!projectEditingId) { setError('Image is required for new projects'); setLoading(false); return; }

    try {
      const url = projectEditingId ? `/api/projects/${projectEditingId}` : '/api/projects';
      const method = projectEditingId ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      if (response.ok) {
        setSuccess(projectEditingId ? 'Project updated!' : 'Project uploaded!');
        handleCancelProjectEdit();
        fetchProjects();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to save project');
      }
    } catch (err) { setError('Network error during save'); } 
    finally { setLoading(false); }
  };

  // --- TESTIMONIALS LOGIC ---
  const handleEditTestimonial = (t) => {
    setTestEditingId(t._id);
    setTestName(t.clientName);
    setTestReview(t.review);
    setTestImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelTestimonialEdit = () => {
    setTestEditingId(null);
    setTestName('');
    setTestReview('');
    setTestImage(null);
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`/api/testimonials/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) fetchTestimonials();
      else alert("Failed to delete testimonial");
    } catch (err) {
      alert("Network error");
    }
  };

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('clientName', testName);
    formData.append('review', testReview);
    
    if (testImage) formData.append('image', testImage);
    else if (!testEditingId) { setError('Client Image is required for new testimonials'); setLoading(false); return; }

    try {
      const url = testEditingId ? `/api/testimonials/${testEditingId}` : '/api/testimonials';
      const method = testEditingId ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      if (response.ok) {
        setSuccess(testEditingId ? 'Testimonial updated!' : 'Testimonial uploaded!');
        handleCancelTestimonialEdit();
        fetchTestimonials();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to save testimonial');
      }
    } catch (err) { setError('Network error during save'); } 
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000', color: '#fff', fontFamily: 'inherit' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingBottom: '4rem' }}>
        
        <header style={{ padding: '2rem 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '0.05em' }}>ADMIN DASHBOARD</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button type="button" onClick={() => navigate('/')} style={btnSecondaryStyle}>VIEW SITE</button>
             <button type="button" onClick={handleLogout} style={btnPrimaryStyle}>LOGOUT</button>
          </div>
        </header>

        <div style={{ display: 'flex', gap: '1rem', padding: '2rem 5vw 0', borderBottom: '1px solid #222' }}>
          <button onClick={() => { setActiveTab('projects'); setError(''); setSuccess(''); }} style={{ ...tabStyle, borderBottom: activeTab === 'projects' ? '2px solid #fff' : '2px solid transparent', color: activeTab === 'projects' ? '#fff' : '#888' }}>PROJECTS</button>
          <button onClick={() => { setActiveTab('testimonials'); setError(''); setSuccess(''); }} style={{ ...tabStyle, borderBottom: activeTab === 'testimonials' ? '2px solid #fff' : '2px solid transparent', color: activeTab === 'testimonials' ? '#fff' : '#888' }}>TESTIMONIALS</button>
        </div>

        <main style={{ padding: '3rem 5vw', display: 'flex', flexDirection: 'column', gap: '4rem' }}>

          {activeTab === 'projects' && (
            <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {/* Form Section */}
              <div style={{ flex: '1 1 400px', padding: '2rem', background: '#111', borderRadius: '4px', border: '1px solid #222' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', letterSpacing: '0.05em', marginTop: 0 }}>
                  {projectEditingId ? 'EDIT PROJECT' : 'ADD NEW PROJECT'}
                </h2>
                {error && <p style={{ color: '#ff4d4d', fontSize: '0.875rem' }}>{error}</p>}
                {success && <p style={{ color: '#4ade80', fontSize: '0.875rem' }}>{success}</p>}
                
                <form onSubmit={handleProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <input type="text" placeholder="PROJECT TITLE" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} required style={inputStyle} />
                  <input type="text" placeholder="CATEGORY (E.G. FASHION FILM)" value={projectCategory} onChange={e => setProjectCategory(e.target.value)} required style={inputStyle} />
                  <input type="text" placeholder="CLIENT" value={projectClient} onChange={e => setProjectClient(e.target.value)} required style={inputStyle} />
                  <input type="text" placeholder="YEAR" value={projectYear} onChange={e => setProjectYear(e.target.value)} required style={inputStyle} />
                  <input type="text" placeholder="ALT TEXT FOR ACCESSIBILITY" value={projectAlt} onChange={e => setProjectAlt(e.target.value)} required style={inputStyle} />
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: '#888' }}>PROJECT IMAGE {projectEditingId && '(LEAVE BLANK TO KEEP EXISTING)'}</label>
                    <input type="file" accept="image/*" onChange={e => setProjectImage(e.target.files[0])} required={!projectEditingId} style={{ color: '#fff', fontFamily: 'inherit' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" disabled={loading} style={{ ...btnPrimaryStyle, flex: 1 }}>
                      {loading ? 'SAVING...' : (projectEditingId ? 'SAVE CHANGES' : 'UPLOAD PROJECT')}
                    </button>
                    {projectEditingId && (
                      <button type="button" onClick={handleCancelProjectEdit} style={{ ...btnSecondaryStyle, flex: 1 }}>CANCEL</button>
                    )}
                  </div>
                </form>
              </div>

              {/* List Section */}
              <div style={{ flex: '2 1 500px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', letterSpacing: '0.05em', marginTop: 0 }}>EXISTING PROJECTS ({projects.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {projects.map(p => {
                    const id = p._id || p.projectId;
                    return (
                      <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', background: '#111', border: '1px solid #222', borderRadius: '4px' }}>
                        <div style={{ width: '120px', height: '80px', flexShrink: 0, overflow: 'hidden', background: '#222' }}>
                          <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{p.title}</h3>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>{p.client} • {p.category} • {p.year}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                          <button onClick={() => handleEditProject(p)} style={actionBtnStyle}>EDIT</button>
                          <button onClick={() => handleDeleteProject(id)} style={{...actionBtnStyle, color: '#ff4d4d', borderColor: 'rgba(255,77,77,0.3)'}}>DELETE</button>
                        </div>
                      </div>
                    );
                  })}
                  {projects.length === 0 && <div style={{ color: '#888' }}>No projects found.</div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {/* Form Section */}
              <div style={{ flex: '1 1 400px', padding: '2rem', background: '#111', borderRadius: '4px', border: '1px solid #222' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', letterSpacing: '0.05em', marginTop: 0 }}>
                  {testEditingId ? 'EDIT TESTIMONIAL' : 'ADD TESTIMONIAL'}
                </h2>
                {error && <p style={{ color: '#ff4d4d', fontSize: '0.875rem' }}>{error}</p>}
                {success && <p style={{ color: '#4ade80', fontSize: '0.875rem' }}>{success}</p>}
                
                <form onSubmit={handleTestimonialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <input type="text" placeholder="CLIENT NAME" value={testName} onChange={e => setTestName(e.target.value)} required style={inputStyle} />
                  <textarea placeholder="REVIEW TEXT" value={testReview} onChange={e => setTestReview(e.target.value)} required rows={4} style={{...inputStyle, resize: 'vertical'}} />
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: '#888' }}>CLIENT PHOTO {testEditingId && '(LEAVE BLANK TO KEEP EXISTING)'}</label>
                    <input type="file" accept="image/*" onChange={e => setTestImage(e.target.files[0])} required={!testEditingId} style={{ color: '#fff', fontFamily: 'inherit' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" disabled={loading} style={{ ...btnPrimaryStyle, flex: 1 }}>
                      {loading ? 'SAVING...' : (testEditingId ? 'SAVE CHANGES' : 'UPLOAD TESTIMONIAL')}
                    </button>
                    {testEditingId && (
                      <button type="button" onClick={handleCancelTestimonialEdit} style={{ ...btnSecondaryStyle, flex: 1 }}>CANCEL</button>
                    )}
                  </div>
                </form>
              </div>

              {/* List Section */}
              <div style={{ flex: '2 1 500px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', letterSpacing: '0.05em', marginTop: 0 }}>EXISTING TESTIMONIALS ({testimonials.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {testimonials.map(t => (
                    <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', background: '#111', border: '1px solid #222', borderRadius: '4px' }}>
                      <div style={{ width: '80px', height: '80px', flexShrink: 0, overflow: 'hidden', background: '#222', borderRadius: '50%' }}>
                        <img src={t.image} alt={t.clientName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{t.clientName}</h3>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#888', fontStyle: 'italic' }}>"{t.review}"</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                        <button onClick={() => handleEditTestimonial(t)} style={actionBtnStyle}>EDIT</button>
                        <button onClick={() => handleDeleteTestimonial(t._id)} style={{...actionBtnStyle, color: '#ff4d4d', borderColor: 'rgba(255,77,77,0.3)'}}>DELETE</button>
                      </div>
                    </div>
                  ))}
                  {testimonials.length === 0 && <div style={{ color: '#888' }}>No testimonials found.</div>}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const tabStyle = { padding: '1rem 2rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', letterSpacing: '0.1em', fontWeight: 'bold', fontFamily: 'inherit' };
const inputStyle = { padding: '1rem', background: '#000', border: '1px solid #333', color: '#fff', fontSize: '0.875rem', letterSpacing: '0.05em', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%' };
const btnPrimaryStyle = { padding: '1rem 1.5rem', background: '#fff', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.875rem', letterSpacing: '0.1em', fontFamily: 'inherit' };
const btnSecondaryStyle = { padding: '1rem 1.5rem', background: 'transparent', color: '#fff', border: '1px solid #333', cursor: 'pointer', fontSize: '0.875rem', letterSpacing: '0.05em', fontFamily: 'inherit' };
const actionBtnStyle = { padding: '0.5rem 1rem', background: 'transparent', color: '#fff', border: '1px solid #333', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.05em', fontFamily: 'inherit' };
