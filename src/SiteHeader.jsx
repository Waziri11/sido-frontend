import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useApp } from './context'

export default function SiteHeader({ onMenu, portal = false }) {
  const { language, setLanguage, theme, setTheme, session } = useApp()
  const isDark = theme === 'dark'
  return <header className={`app-header universal-header${portal ? ' portal-header' : ''}`}>
    <div className="header-container">
      <div className="header-left">
        {onMenu && <button className="universal-menu" onClick={onMenu} aria-label="Open navigation"><Menu/></button>}
        <Link to="/" aria-label="SIDO home"><img src="/coatofarms.svg" alt="Tanzania Coat of Arms" className="header-logo coat-of-arms"/></Link>
      </div>
      <div className="header-center"><Link to="/" className="header-title" data-no-auto-translate="true">Small Industries Development Organization</Link></div>
      <div className="header-right">
        <Link className="header-events-link" to="/events">{language === 'sw' ? 'Matukio' : 'Events'}</Link>
        <div className="language-switcher" role="group" aria-label="Change language">
          <button type="button" className={`language-switcher-btn${language === 'en' ? ' active' : ''}`} onClick={() => setLanguage('en')}>EN</button>
          <button type="button" className={`language-switcher-btn${language === 'sw' ? ' active' : ''}`} onClick={() => setLanguage('sw')}>SW</button>
        </div>
        <button type="button" className={`theme-toggle${isDark ? ' theme-toggle--dark' : ''}`} onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
          <span aria-hidden="true">{isDark ? '☾' : '☀'}</span>
        </button>
        {session?.user && <Link className="header-avatar" to={session.user.role === 'admin' ? '/admin' : '/portal'}>{session.user.firstName?.[0]}{session.user.lastName?.[0]}</Link>}
        <Link to="/" aria-label="SIDO home"><img src="/sido-logo.png" alt="SIDO Logo" className="header-logo sido-logo"/></Link>
      </div>
    </div>
  </header>
}
