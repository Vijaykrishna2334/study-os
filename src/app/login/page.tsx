'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) { router.push(from); router.refresh(); }
      else { setError('Invalid username or password.'); }
    } catch (err) { setError('Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',backgroundColor:'#000',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',opacity:mounted?1:0,transition:'opacity 0.4s ease'}}>
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'600px',height:'600px',background:'radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'relative',width:'420px',padding:'48px 40px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',boxShadow:'0 0 80px rgba(99,102,241,0.1),0 32px 64px rgba(0,0,0,0.4)'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{width:'64px',height:'64px',margin:'0 auto 20px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 32px rgba(99,102,241,0.4)',fontSize:'28px',fontWeight:'900',color:'white'}}>S</div>
          <h1 style={{fontSize:'28px',fontWeight:'700',color:'#fff',margin:'0 0 6px'}}>Study OS</h1>
          <p style={{fontSize:'13px',color:'rgba(255,255,255,0.4)',margin:0,letterSpacing:'0.08em',textTransform:'uppercase'}}>AI/ML Interview Mastery</p>
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div>
            <label style={{display:'block',fontSize:'12px',fontWeight:'500',color:'rgba(255,255,255,0.5)',marginBottom:'8px',letterSpacing:'0.06em',textTransform:'uppercase'}}>Username</label>
            <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter username" required
              style={{width:'100%',padding:'12px 16px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#fff',fontSize:'15px',outline:'none',boxSizing:'border-box'}}
              onFocus={e=>{e.target.style.borderColor='#6366f1';e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)';}}
              onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.12)';e.target.style.boxShadow='none';}}/>
          </div>
          <div>
            <label style={{display:'block',fontSize:'12px',fontWeight:'500',color:'rgba(255,255,255,0.5)',marginBottom:'8px',letterSpacing:'0.06em',textTransform:'uppercase'}}>Password</label>
            <div style={{position:'relative'}}>
              <input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" required
                style={{width:'100%',padding:'12px 44px 12px 16px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#fff',fontSize:'15px',outline:'none',boxSizing:'border-box'}}
                onFocus={e=>{e.target.style.borderColor='#6366f1';e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)';}}
                onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.12)';e.target.style.boxShadow='none';}}/>
              <button type="button" onClick={()=>setShowPassword(!showPassword)} style={{position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.3)',fontSize:'16px',padding:0}}>{showPassword?'Hide':'Show'}</button>
            </div>
          </div>
          {error&&<div style={{padding:'10px 14px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'8px',color:'#fca5a5',fontSize:'13px'}}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{marginTop:'8px',padding:'13px',background:loading?'rgba(99,102,241,0.4)':'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'10px',color:'#fff',fontSize:'15px',fontWeight:'600',cursor:loading?'not-allowed':'pointer',boxShadow:'0 0 24px rgba(99,102,241,0.3)'}}>
            {loading?'Logging in...':'Log In ->'}
          </button>
        </form>
        <p style={{marginTop:'28px',textAlign:'center',fontSize:'12px',color:'rgba(255,255,255,0.2)'}}>Vijay Krishna - 12 phases - 340+ topics</p>
      </div>
      <style dangerouslySetInnerHTML={{__html:'input::placeholder{color:rgba(255,255,255,0.25);}*{box-sizing:border-box;}'}}/>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{background:'#000',minHeight:'100vh'}}/>}>
      <LoginForm/>
    </Suspense>
  );
}
