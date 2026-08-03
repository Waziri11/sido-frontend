import { Component, useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AreaChart, Area, BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowLeft, ArrowRight, BadgeCheck, Banknote, Building2, CheckCircle2, ChevronLeft, ChevronRight, Globe2, GraduationCap, LayoutDashboard, Lightbulb, Loader2, LogOut, Mail, Menu, Moon, Pencil, Search, Settings, ShieldCheck, Store, Sun, Trash2, User, UserRound, Users, Wrench, X } from 'lucide-react'
import { api, messageOf } from './lib'
import { Alert, Badge, Button, Card, Dialog, DialogContent, DialogTitle, Field, Input, Textarea } from './components/ui'
import { useApp } from './context'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <main className="grid min-h-screen place-items-center p-6"><Card className="max-w-lg p-8 text-center"><h1 className="text-2xl font-bold">Something went wrong</h1><p className="mt-3 text-muted-foreground">The page could not be displayed. Reload to try again.</p><Button className="mt-6" onClick={() => location.reload()}>Reload page</Button></Card></main> : this.props.children }
}

function Brand({ compact = false }) { return <Link to="/" className="brand"><img src="/sido-logo.png" alt="SIDO"/><span><strong>SIDO</strong>{!compact && <small>Small Industries Development Organization</small>}</span></Link> }
function Controls() { const { language, setLanguage, theme, setTheme } = useApp(); return <div className="controls"><button onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')} aria-label="Change language"><Globe2 size={17}/>{language.toUpperCase()}</button><button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Change theme">{theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}</button></div> }

const heroSlides = [
  '/hero/sido%201.jpeg',
  '/hero/images.jpeg',
  '/hero/ZIARA%20YA%20JAFO%20-%20SIDO.jpg'
]
const services = [
  [Wrench, 'Technology & technical services', 'Huduma za teknolojia na ufundi'], [GraduationCap, 'Business training & consultancy', 'Mafunzo na ushauri wa biashara'], [Store, 'Marketing & information', 'Masoko na taarifa'], [Banknote, 'Financial linkages', 'Uunganishaji wa huduma za fedha'], [Building2, 'SME infrastructure', 'Miundombinu ya biashara'], [Users, 'Industrial extension services', 'Huduma za ugani wa viwanda']
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return isMobile
}

function CustomLanguageSwitcher() {
  const { language, setLanguage } = useApp()
  return (
    <div className="language-switcher" role="group" aria-label="Change language" data-no-auto-translate="true">
      <button
        type="button"
        className={`language-switcher-btn${language === 'en' ? ' active' : ''}`}
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        title="English"
      >
        EN
      </button>
      <button
        type="button"
        className={`language-switcher-btn${language === 'sw' ? ' active' : ''}`}
        onClick={() => setLanguage('sw')}
        aria-pressed={language === 'sw'}
        title="Kiswahili"
      >
        SW
      </button>
    </div>
  )
}

function CustomThemeToggle() {
  const { theme, setTheme } = useApp()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className={`theme-toggle${isDark ? ' theme-toggle--dark' : ''}`}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
    >
      <svg
        className="theme-toggle-icon theme-toggle-sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
      <svg
        className="theme-toggle-icon theme-toggle-moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  )
}

function PublicHeader() {
  const { t } = useApp();
  const isMobile = useIsMobile();
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          <img
            src="/coatofarms.svg"
            alt="Tanzania Coat of Arms"
            className="header-logo coat-of-arms"
          />
        </div>

        <div className="header-center">
          <h1 className="header-title" data-no-auto-translate="true">
            {isMobile ? 'SIDO' : t.hero.eyebrow}
          </h1>
        </div>

        <div className="header-right">
          <CustomLanguageSwitcher />
          <CustomThemeToggle />
          <img
            src="/sido-logo.png"
            alt="SIDO Logo"
            className="header-logo sido-logo"
          />
        </div>
      </div>
    </header>
  );
}

function Landing() {
  const { t, language } = useApp();
  const [slide, setSlide] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const id = setInterval(() => setSlide(x => (x + 1) % heroSlides.length), 6500);
    return () => clearInterval(id);
  }, []);

  const changeSlide = (direction) => {
    setSlide((current) => (current + direction + heroSlides.length) % heroSlides.length);
  };

  const steps = language === 'en' ? [['Create your account','Register your personal and enterprise information.'],['Verify your identity','Confirm your email through a secure one-time code.'],['Build your profile','Keep your enterprise details current in one place.'],['Connect and grow','Prepare to access SIDO opportunities and services.']] : [['Fungua akaunti','Sajili taarifa zako na za biashara yako.'],['Thibitisha utambulisho','Thibitisha barua pepe kwa namba ya mara moja.'],['Jenga wasifu','Weka taarifa za biashara yako mahali pamoja.'],['Ungana na ukue','Jiandae kufikia fursa na huduma za SIDO.']]

  return <div className="landing-page">
    <PublicHeader />
    <main>
      <section className="hero" id="home">
        <div className="hero-slides" aria-hidden="true">
          {heroSlides.map((image, index) => (
            <div
              key={image}
              className={`hero-slide${index === slide ? ' is-active' : ''}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
        <div className="shell hero-grid">
          <div className="hero-copy">
            <h1>{t.hero.title}</h1>
            <p>{t.hero.body}</p>
            <div className="hero-actions">
              <Link className="primary-action" to="/login">
                {t.hero.primary} <ArrowRight size={18} />
              </Link>
              <a className="secondary-action" href="#services">
                {t.hero.secondary}
              </a>
            </div>
            <div className="hero-proof">
              <ShieldCheck size={20} />
              <span>
                <strong>{language === 'en' ? 'Secure access' : 'Ufikiaji salama'}</strong>
                {language === 'en' ? 'Your enterprise data stays protected' : 'Taarifa zako zinalindwa'}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="hero-arrow left"
          onClick={() => changeSlide(-1)}
          aria-label={language === 'sw' ? 'Picha iliyopita' : 'Previous image'}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          type="button"
          className="hero-arrow right"
          onClick={() => changeSlide(1)}
          aria-label={language === 'sw' ? 'Picha inayofuata' : 'Next image'}
        >
          <ChevronRight size={24} />
        </button>
        <div
          className="hero-dots"
          role="group"
          aria-label={language === 'sw' ? 'Chagua picha' : 'Choose image'}
        >
          {heroSlides.map((image, index) => (
            <button
              key={image}
              type="button"
              className={index === slide ? 'active' : ''}
              onClick={() => setSlide(index)}
              aria-label={`Image ${index + 1}`}
            />
          ))}
        </div>
      </section>
      <section id="about" className="section intro"><div className="shell two-col"><div><span className="kicker">{t.home.aboutKicker}</span><h2>{t.home.aboutTitle}</h2></div><div><p>{t.home.aboutBody}</p><p>{language === 'en' ? 'Established in 1973, SIDO supports an innovative entrepreneurial base and sustainable industrialization across Tanzania.' : 'SIDO ilianzishwa mwaka 1973 kusaidia msingi bunifu wa ujasiriamali na maendeleo endelevu ya viwanda Tanzania.'}</p></div></div></section>
      <section id="services" className="section services"><div className="shell"><div className="section-heading"><span className="kicker">{t.home.servicesKicker}</span><h2>{t.home.servicesTitle}</h2><p>{t.home.servicesBody}</p></div><div className="service-grid">{services.map(([ServiceIcon,en,sw],i)=><article key={en}><span className="service-number">0{i+1}</span><div className="service-icon"><ServiceIcon/></div><h3>{language==='en'?en:sw}</h3><p>{language==='en'?'Practical support tailored to the needs and growth of Tanzanian SMEs.':'Msaada wa vitendo unaolingana na mahitaji na ukuaji wa biashara ndogo Tanzania.'}</p></article>)}</div></div></section>
      <section id="journey" className="section journey"><div className="shell journey-grid"><div><span className="kicker light">{t.home.journeyKicker}</span><h2>{t.home.journeyTitle}</h2><p>{language==='en'?'A secure account gives you one reliable identity for future SIDO digital services.':'Akaunti salama inakupa utambulisho mmoja kwa huduma za kidijitali za SIDO.'}</p><Button variant="outline" asChild><Link to="/register">{t.nav.register}<ArrowRight size={17}/></Link></Button></div><div className="steps">{steps.map((step,i)=><article key={step[0]}><span>0{i+1}</span><div><h3>{step[0]}</h3><p>{step[1]}</p></div></article>)}</div></div></section>
      <section className="cta"><div className="shell"><div><span>{language==='en'?'YOUR NEXT STEP':'HATUA YAKO INAYOFUATA'}</span><h2>{t.home.ready}</h2><p>{t.home.readyBody}</p></div><Button asChild><Link to="/register">{t.nav.register}<ArrowRight/></Link></Button></div></section>
    </main><footer><div className="shell"><Brand/><div><span>© {new Date().getFullYear()} SIDO. {t.home.rights}</span><a href="https://www.sido.go.tz" target="_blank" rel="noreferrer">www.sido.go.tz</a></div></div></footer>
  </div>
}

function AuthLayout({ children }) { return <div className="auth-page"><PublicHeader /><main>{children}</main></div> }
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })
function Login() {
  const { t, session, setSession } = useApp(); const navigate = useNavigate(); const [otp, setOtp] = useState(null); const [error,setError]=useState(''); const [busy,setBusy]=useState(false)
  const { register, handleSubmit, formState:{errors} } = useForm({ resolver:zodResolver(loginSchema) })
  if(session) return <Navigate to={session.user.role==='admin'?'/admin':'/portal'} replace/>
  const submit=async values=>{setBusy(true);setError('');try{const {data}=await api.post('/auth/login',values);setOtp({email:data.data.email,purpose:data.data.purpose})}catch(e){setError(messageOf(e))}finally{setBusy(false)}}
  const verify=async e=>{e.preventDefault();setBusy(true);setError('');try{const code=new FormData(e.currentTarget).get('code');const endpoint=otp.purpose==='verify_email'?'/auth/verify-email':'/auth/verify-login';const {data}=await api.post(endpoint,{email:otp.email,code});setSession(data.data);navigate(data.data.user.role==='admin'?'/admin':'/portal')}catch(err){setError(messageOf(err))}finally{setBusy(false)}}
  return <AuthLayout><Card className="auth-card"><Link className="back-link" to="/"><ArrowLeft size={16}/> {t.nav.about}</Link><div className="auth-heading"><div className="auth-icon">{otp?<BadgeCheck/>:<UserRound/>}</div><h1>{otp?t.auth.verifyTitle:t.auth.welcome}</h1><p>{otp?`Enter the 6-digit code sent to ${otp.email}`:t.auth.signin}</p></div>{error&&<Alert>{error}</Alert>}{otp?<form className="auth-form" onSubmit={verify}><Field label={t.auth.code}><Input name="code" inputMode="numeric" maxLength="6" pattern="[0-9]{6}" required className="otp-input" placeholder="000000"/></Field><Button disabled={busy}>{busy&&<Loader2 className="spin"/>}{t.auth.verify}</Button><Button type="button" variant="ghost" onClick={()=>api.post('/auth/resend-otp',otp)}>{t.auth.resend}</Button></form>:<form className="auth-form" onSubmit={handleSubmit(submit)}><Field label={t.auth.email} error={errors.email?.message}><Input type="email" autoComplete="email" {...register('email')}/></Field><Field label={t.auth.password} error={errors.password?.message}><Input type="password" autoComplete="current-password" {...register('password')}/></Field><Link className="forgot" to="/forgot-password">{t.auth.forgot}</Link><Button disabled={busy}>{busy&&<Loader2 className="spin"/>}{t.nav.login}</Button><div className="auth-footer"><span>{t.auth.noAccount}</span><Link to="/register">{t.auth.create}</Link></div></form>}</Card></AuthLayout>
}

const personalSchema=z.object({firstName:z.string().min(2),lastName:z.string().min(2),email:z.string().email(),phoneNumber:z.string().min(10),password:z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/\d/).regex(/[^A-Za-z0-9]/),confirmPassword:z.string()}).refine(x=>x.password===x.confirmPassword,{path:['confirmPassword'],message:'Passwords do not match'})
const regions=['Arusha','Dar es Salaam','Dodoma','Geita','Iringa','Kagera','Katavi','Kigoma','Kilimanjaro','Lindi','Manyara','Mara','Mbeya','Morogoro','Mtwara','Mwanza','Njombe','Pwani','Rukwa','Ruvuma','Shinyanga','Simiyu','Singida','Songwe','Tabora','Tanga']
function Register() {
  const {t}=useApp(); const navigate=useNavigate(); const [step,setStep]=useState(0); const [personal,setPersonal]=useState(null); const [error,setError]=useState(''); const [busy,setBusy]=useState(false)
  const {register,handleSubmit,formState:{errors}}=useForm({resolver:zodResolver(personalSchema),defaultValues:personal||{}})
  const finish=async e=>{e.preventDefault();setBusy(true);setError('');try{const form=new FormData(e.currentTarget);Object.entries(personal).forEach(([k,v])=>k!=='confirmPassword'&&form.append(k,v));const {data}=await api.post('/auth/register',form,{headers:{'Content-Type':'multipart/form-data'}});navigate(`/verify-email?email=${encodeURIComponent(data.data.email)}`)}catch(err){setError(messageOf(err))}finally{setBusy(false)}}
  return <AuthLayout><Card className="auth-card register-card"><Link className="back-link" to="/login"><ArrowLeft size={16}/> {t.nav.login}</Link><div className="auth-heading"><h1>{t.auth.registerTitle}</h1><p>{step===0?t.auth.personal:t.auth.business}</p></div><div className="stepper"><span className="active">1</span><i className={step===1?'active':''}/><span className={step===1?'active':''}>2</span></div>{error&&<Alert>{error}</Alert>}{step===0?<form className="auth-form" onSubmit={handleSubmit(v=>{setPersonal(v);setStep(1)})}><div className="form-grid"><Field label="First name" error={errors.firstName?.message}><Input {...register('firstName')}/></Field><Field label="Last name" error={errors.lastName?.message}><Input {...register('lastName')}/></Field><Field label={t.auth.email} error={errors.email?.message}><Input type="email" {...register('email')}/></Field><Field label="Phone number" error={errors.phoneNumber?.message}><Input placeholder="+255 7xx xxx xxx" {...register('phoneNumber')}/></Field><Field label={t.auth.password} error={errors.password&&'Use 8+ characters with upper, lower, number and symbol'}><Input type="password" {...register('password')}/></Field><Field label="Confirm password" error={errors.confirmPassword?.message}><Input type="password" {...register('confirmPassword')}/></Field></div><Button>{t.auth.continue}<ArrowRight size={17}/></Button></form>:<form className="auth-form" onSubmit={finish}><div className="form-grid"><Field label="Business name"><Input name="businessName" required/></Field><Field label="Business type / sector"><Input name="businessType" placeholder="e.g. Food processing" required/></Field><Field label="Region"><select name="region" required><option value="">Select region</option>{regions.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="District"><Input name="district" required/></Field><Field label="TIN (optional)"><Input name="tin"/></Field><Field label="Website (optional)"><Input name="website" type="url" placeholder="https://"/></Field></div><Field label="Physical address"><Textarea name="physicalAddress" required/></Field><Field label="Business description (optional)"><Textarea name="description"/></Field><div className="form-grid"><Field label="Business licence (PDF/image)"><Input name="businessLicenseDocument" type="file" accept=".pdf,image/*"/></Field><Field label="TIN document (PDF/image)"><Input name="tinDocument" type="file" accept=".pdf,image/*"/></Field></div><div className="form-actions"><Button type="button" variant="outline" onClick={()=>setStep(0)}>{t.auth.back}</Button><Button disabled={busy}>{busy&&<Loader2 className="spin"/>}{t.auth.submit}</Button></div></form>}</Card></AuthLayout>
}

function VerifyEmail(){const {setSession,t}=useApp();const [params]=useSearchParams();const navigate=useNavigate();const email=params.get('email')||'';const [error,setError]=useState('');const submit=async e=>{e.preventDefault();try{const {data}=await api.post('/auth/verify-email',{email,code:new FormData(e.currentTarget).get('code')});setSession(data.data);navigate('/portal')}catch(err){setError(messageOf(err))}};return <AuthLayout><Card className="auth-card"><div className="auth-heading"><div className="auth-icon"><Mail/></div><h1>{t.auth.verifyTitle}</h1><p>Enter the code sent to {email}</p></div>{error&&<Alert>{error}</Alert>}<form className="auth-form" onSubmit={submit}><Input name="code" maxLength="6" pattern="[0-9]{6}" required className="otp-input"/><Button>{t.auth.verify}</Button><Button type="button" variant="ghost" onClick={()=>api.post('/auth/resend-otp',{email,purpose:'verify_email'})}>{t.auth.resend}</Button></form></Card></AuthLayout>}
function ForgotPassword(){const navigate=useNavigate();const [error,setError]=useState('');const [sent,setSent]=useState(null);const submit=async e=>{e.preventDefault();try{const fd=new FormData(e.currentTarget);if(!sent){const email=fd.get('email');await api.post('/auth/forgot-password',{email});setSent({email})}else{const code=fd.get('code');const {data}=await api.post('/auth/verify-reset',{email:sent.email,code});navigate(`/reset-password?email=${encodeURIComponent(sent.email)}&code=${code}&token=${data.data.resetToken}`)}}catch(err){setError(messageOf(err))}};return <AuthLayout><Card className="auth-card"><Link className="back-link" to="/login"><ArrowLeft size={16}/> Back to sign in</Link><div className="auth-heading"><div className="auth-icon"><Mail/></div><h1>Reset your password</h1><p>{sent?'Enter the 6-digit code sent to your email.':'We will send a secure reset code to your email.'}</p></div>{error&&<Alert>{error}</Alert>}<form className="auth-form" onSubmit={submit}>{sent?<Input name="code" className="otp-input" maxLength="6" required/>:<Field label="Email address"><Input name="email" type="email" required/></Field>}<Button>Continue</Button></form></Card></AuthLayout>}
function ResetPassword(){const [params]=useSearchParams();const navigate=useNavigate();const [error,setError]=useState('');const submit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);if(fd.get('password')!==fd.get('confirm'))return setError('Passwords do not match');try{await api.post('/auth/reset-password',{email:params.get('email'),code:params.get('code'),resetToken:params.get('token'),password:fd.get('password')});navigate('/login')}catch(err){setError(messageOf(err))}};return <AuthLayout><Card className="auth-card"><div className="auth-heading"><h1>Choose a new password</h1><p>Use at least 8 characters with upper, lower, number and symbol.</p></div>{error&&<Alert>{error}</Alert>}<form className="auth-form" onSubmit={submit}><Field label="New password"><Input name="password" type="password" required/></Field><Field label="Confirm password"><Input name="confirm" type="password" required/></Field><Button>Reset password</Button></form></Card></AuthLayout>}

function Protected({role,children}){const {session,loading}=useApp();if(loading)return <PageLoader/>;if(!session)return <Navigate to="/login" replace/>;if(role&&session.user.role!==role)return <Navigate to="/forbidden" replace/>;return children}
function PageLoader(){return <div className="page-loader"><Loader2 className="spin"/><span>Loading SIDO portal…</span></div>}
const entrepreneurNav=[['/portal',LayoutDashboard,'Overview'],['/portal/profile',User,'Profile'],['/portal/settings',Settings,'Settings']]
const adminNav=[['/admin',LayoutDashboard,'Overview'],['/admin/entrepreneurs',Users,'Entrepreneurs'],['/admin/settings',Settings,'Settings']]
function PortalShell({admin=false,children}){const {t,session,logout}=useApp();const navigate=useNavigate();const [open,setOpen]=useState(false);const nav=admin?adminNav:entrepreneurNav;const signout=async()=>{await logout();navigate('/')};return <div className="portal"><aside className={open?'open':''}><div className="sidebar-brand"><Brand compact/><button onClick={()=>setOpen(false)}><X/></button></div><div className="panel-label">{admin?t.portal.admin:t.portal.entrepreneur}</div><nav>{nav.map(([to,Icon,label])=><NavLink key={to} to={to} end={to===(admin?'/admin':'/portal')} onClick={()=>setOpen(false)}><Icon size={19}/>{label}</NavLink>)}</nav><button className="sidebar-logout" onClick={signout}><LogOut size={19}/>{t.portal.logout}</button></aside><div className="portal-main"><header><button className="portal-menu" onClick={()=>setOpen(true)}><Menu/></button><div className="portal-search"><Search size={17}/><span>{admin?'Search entrepreneurs':'SIDO entrepreneur portal'}</span></div><Controls/><div className="avatar">{session.user.firstName?.[0]}{session.user.lastName?.[0]}</div></header><main>{children}</main></div></div>}
function StatCard({icon:Icon,label,value,tone='orange'}){return <Card className="stat-card"><div className={`stat-icon ${tone}`}><Icon/></div><div><span>{label}</span><strong>{value}</strong></div></Card>}
function EntrepreneurDashboard(){const {t,session}=useApp();const profile=session.profile||{};const filled=['businessName','businessType','physicalAddress','region','district','description','tin','website'].filter(k=>profile[k]).length;const completion=Math.round(filled/8*100);return <PortalShell><div className="page-head"><div><h1>{t.portal.welcome}, {session.user.firstName}</h1><p>Here is your SIDO enterprise overview.</p></div><Button asChild><Link to="/portal/profile"><Pencil size={16}/> Update profile</Link></Button></div><div className="stats"><StatCard icon={CheckCircle2} label={t.portal.account} value={session.user.status==='active'?'Active':'Suspended'} tone="green"/><StatCard icon={Store} label={t.portal.business} value={profile.businessType||'Not set'}/><StatCard icon={BadgeCheck} label={t.portal.completion} value={`${completion}%`} tone="blue"/></div><div className="dashboard-grid"><Card className="dashboard-card"><h2>{t.portal.recent}</h2><div className="profile-summary"><div><span>Business name</span><strong>{profile.businessName||'—'}</strong></div><div><span>Sector</span><strong>{profile.businessType||'—'}</strong></div><div><span>Location</span><strong>{[profile.district,profile.region].filter(Boolean).join(', ')||'—'}</strong></div><div><span>Member since</span><strong>{new Date().toLocaleDateString()}</strong></div></div></Card><Card className="dashboard-card orange-panel"><ShieldCheck/><h2>Your information is protected</h2><p>Keep your details current so SIDO can provide relevant support and future digital services.</p></Card></div></PortalShell>}

const profileFields=['firstName','lastName','phoneNumber','businessName','businessType','physicalAddress','region','district','tin','website','description']
function Profile(){const {session,refresh}=useApp();const initial={...session.user,...session.profile};const [error,setError]=useState('');const [success,setSuccess]=useState('');const submit=async e=>{e.preventDefault();setError('');try{const values=Object.fromEntries(new FormData(e.currentTarget));await api.patch('/entrepreneur/profile',values);await refresh();setSuccess('Profile updated successfully')}catch(err){setError(messageOf(err))}};return <PortalShell><div className="page-head"><div><h1>Personal & business profile</h1><p>Manage the information attached to your SIDO account.</p></div></div><Card className="form-card">{error&&<Alert>{error}</Alert>}{success&&<Alert type="success">{success}</Alert>}<form onSubmit={submit}><div className="form-grid">{profileFields.map(key=><Field key={key} label={key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase())}>{key==='description'||key==='physicalAddress'?<Textarea name={key} defaultValue={initial[key]||''}/>:<Input name={key} defaultValue={initial[key]||''}/>}</Field>)}</div><Button>Save changes</Button></form></Card></PortalShell>}
function SettingsPage({admin=false}){const {theme,setTheme,language,setLanguage}=useApp();const [message,setMessage]=useState('');const change=async e=>{e.preventDefault();try{await api.post('/entrepreneur/change-password',Object.fromEntries(new FormData(e.currentTarget)));setMessage('Password changed successfully');e.currentTarget.reset()}catch(err){setMessage(messageOf(err))}};return <PortalShell admin={admin}><div className="page-head"><div><h1>Settings</h1><p>Choose your portal preferences and security settings.</p></div></div><div className="dashboard-grid"><Card className="form-card"><h2>Appearance & language</h2><div className="setting-row"><span>Color theme</span><Button variant="outline" onClick={()=>setTheme(theme==='light'?'dark':'light')}>{theme==='light'?'Light':'Dark'}</Button></div><div className="setting-row"><span>Portal language</span><Button variant="outline" onClick={()=>setLanguage(language==='en'?'sw':'en')}>{language==='en'?'English':'Kiswahili'}</Button></div></Card>{!admin&&<Card className="form-card"><h2>Change password</h2>{message&&<Alert type={message.includes('success')?'success':'error'}>{message}</Alert>}<form className="auth-form" onSubmit={change}><Field label="Current password"><Input name="currentPassword" type="password" required/></Field><Field label="New password"><Input name="password" type="password" required/></Field><Button>Change password</Button></form></Card>}</div></PortalShell>}

function AdminDashboard(){const {t,session}=useApp();const {data,isLoading}=useQuery({queryKey:['admin-stats'],queryFn:async()=> (await api.get('/admin/stats')).data.data});if(isLoading)return <PortalShell admin><PageLoader/></PortalShell>;const chart=data.byRegion||[];return <PortalShell admin><div className="page-head"><div><h1>{t.portal.welcome}, {session.user.firstName}</h1><p>Monitor entrepreneur registration and account health.</p></div><Button asChild><Link to="/admin/entrepreneurs">Manage entrepreneurs</Link></Button></div><div className="stats four"><StatCard icon={Users} label={t.portal.registered} value={data.total}/><StatCard icon={CheckCircle2} label={t.portal.active} value={data.active} tone="green"/><StatCard icon={ShieldCheck} label={t.portal.suspended} value={data.suspended} tone="red"/><StatCard icon={Trash2} label={t.portal.deleted} value={data.deleted} tone="blue"/></div><Card className="dashboard-card chart-card"><h2>Entrepreneurs by region</h2>{chart.length?<ResponsiveContainer width="100%" height={280}><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="value" fill="#f58220" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer>:<div className="empty">Regional data will appear as entrepreneurs register.</div>}</Card></PortalShell>}

function EntrepreneurDialog({item,onSaved}){const editing=Boolean(item);const [error,setError]=useState('');const save=async e=>{e.preventDefault();setError('');try{const values=Object.fromEntries(new FormData(e.currentTarget));if(editing)await api.patch(`/admin/entrepreneurs/${item.user.id}`,values);else await api.post('/admin/entrepreneurs',values);onSaved()}catch(err){setError(messageOf(err))}};const initial=editing?{...item.user,...item.profile}:{};return <DialogContent><DialogTitle>{editing?'Edit entrepreneur':'Add entrepreneur'}</DialogTitle>{error&&<Alert>{error}</Alert>}<form className="auth-form" onSubmit={save}><div className="form-grid">{['firstName','lastName','email','phoneNumber','businessName','businessType','region','district','physicalAddress'].map(k=><Field key={k} label={k.replace(/([A-Z])/g,' $1')}><Input name={k} defaultValue={initial[k]||''} disabled={editing&&k==='email'} required/></Field>)}{!editing&&<Field label="Temporary password"><Input name="password" type="password" defaultValue="Welcome123!" required/></Field>}{editing&&<Field label="Status"><select name="status" defaultValue={initial.status}><option value="active">Active</option><option value="suspended">Suspended</option></select></Field>}</div><Button>Save entrepreneur</Button></form></DialogContent>}
function AdminEntrepreneurs(){const client=useQueryClient();const [search,setSearch]=useState('');const [status,setStatus]=useState('');const [deleted,setDeleted]=useState(false);const [page,setPage]=useState(1);const [selected,setSelected]=useState(null);const [dialog,setDialog]=useState(false);const query=useQuery({queryKey:['entrepreneurs',search,status,deleted,page],queryFn:async()=> (await api.get('/admin/entrepreneurs',{params:{search,status,deleted,page}})).data.data});const refresh=()=>{setDialog(false);setSelected(null);client.invalidateQueries({queryKey:['entrepreneurs']});client.invalidateQueries({queryKey:['admin-stats']})};const remove=async id=>{if(!confirm(deleted?'Restore this entrepreneur?':'Move this entrepreneur to archive?'))return;deleted?await api.post(`/admin/entrepreneurs/${id}/restore`):await api.delete(`/admin/entrepreneurs/${id}`);refresh()};return <PortalShell admin><div className="page-head"><div><h1>Entrepreneurs</h1><p>Search, review and manage SIDO entrepreneur accounts.</p></div><Dialog open={dialog} onOpenChange={setDialog}><Button onClick={()=>{setSelected(null);setDialog(true)}}>Add entrepreneur</Button>{dialog&&<EntrepreneurDialog item={selected} onSaved={refresh}/>}</Dialog></div><Card className="table-card"><div className="filters"><div><Search size={17}/><Input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search name or email"/></div><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option></select><Button variant={deleted?'default':'outline'} onClick={()=>setDeleted(!deleted)}><Trash2 size={16}/>{deleted?'Viewing archive':'View archive'}</Button></div>{query.isLoading?<PageLoader/>:<><div className="table-wrap"><table><thead><tr><th>Entrepreneur</th><th>Business</th><th>Region</th><th>Status</th><th>Actions</th></tr></thead><tbody>{query.data?.items.map(item=><tr key={item.user.id}><td><strong>{item.user.firstName} {item.user.lastName}</strong><span>{item.user.email}</span></td><td>{item.profile?.businessName||'—'}<span>{item.profile?.businessType}</span></td><td>{item.profile?.region||'—'}</td><td><Badge tone={item.user.status==='active'?'green':'red'}>{item.user.status}</Badge></td><td><div className="row-actions"><Button size="icon" variant="ghost" aria-label="Edit" onClick={()=>{setSelected(item);setDialog(true)}}><Pencil size={16}/></Button><Button size="icon" variant="ghost" aria-label={deleted?'Restore':'Archive'} onClick={()=>remove(item.user.id)}>{deleted?<CheckCircle2 size={16}/>:<Trash2 size={16}/>}</Button></div></td></tr>)}</tbody></table>{!query.data?.items.length&&<div className="empty">No entrepreneurs found.</div>}</div><div className="pagination"><span>{query.data?.total||0} records</span><div><Button size="sm" variant="outline" disabled={page<=1} onClick={()=>setPage(page-1)}>Previous</Button><span>Page {page} of {query.data?.pages||1}</span><Button size="sm" variant="outline" disabled={page>=(query.data?.pages||1)} onClick={()=>setPage(page+1)}>Next</Button></div></div></>}</Card></PortalShell>}

function StatusPage({forbidden=false}){return <AuthLayout><Card className="auth-card text-center"><div className="auth-icon mx-auto"><ShieldCheck/></div><h1 className="mt-5 text-3xl font-bold">{forbidden?'Access denied':'Page not found'}</h1><p className="my-4 text-muted-foreground">{forbidden?'You do not have permission to view this page.':'The page you requested does not exist.'}</p><Button asChild><Link to="/">Return home</Link></Button></Card></AuthLayout>}
function App(){return <ErrorBoundary><Routes><Route path="/" element={<Landing/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/verify-email" element={<VerifyEmail/>}/><Route path="/forgot-password" element={<ForgotPassword/>}/><Route path="/reset-password" element={<ResetPassword/>}/><Route path="/portal" element={<Protected role="entrepreneur"><EntrepreneurDashboard/></Protected>}/><Route path="/portal/profile" element={<Protected role="entrepreneur"><Profile/></Protected>}/><Route path="/portal/settings" element={<Protected role="entrepreneur"><SettingsPage/></Protected>}/><Route path="/admin" element={<Protected role="admin"><AdminDashboard/></Protected>}/><Route path="/admin/entrepreneurs" element={<Protected role="admin"><AdminEntrepreneurs/></Protected>}/><Route path="/admin/settings" element={<Protected role="admin"><SettingsPage admin/></Protected>}/><Route path="/forbidden" element={<StatusPage forbidden/>}/><Route path="*" element={<StatusPage/>}/></Routes></ErrorBoundary>}
export default App
