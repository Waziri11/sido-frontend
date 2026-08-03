import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './lib'

const copy = {
  en: {
    nav: { about: 'About SIDO', services: 'Services', journey: 'How it works', login: 'Sign in', register: 'Create account' },
    hero: { eyebrow: 'Small Industries Development Organization', title: 'Ideas grow into industries with the right support.', body: 'Access SIDO services, build your enterprise profile and connect to opportunities designed for Tanzanian entrepreneurs.', primary: 'Access the portal', secondary: 'Explore services' },
    home: { aboutKicker: 'About SIDO', aboutTitle: 'Building a competitive SME sector', aboutBody: 'SIDO promotes the development of small and medium enterprises through practical capacity development, technology, finance, infrastructure, markets and business support.', servicesKicker: 'SIDO services', servicesTitle: 'Support for every stage of enterprise growth', servicesBody: 'Relevant, demand-driven services help entrepreneurs turn ideas into sustainable, competitive enterprises.', journeyKicker: 'A clear digital pathway', journeyTitle: 'Start your SIDO journey', ready: 'Ready to grow your enterprise?', readyBody: 'Create your entrepreneur profile and take the first step toward SIDO support.', rights: 'All rights reserved.' },
    auth: { welcome: 'Welcome back', signin: 'Sign in to your account', email: 'Email address', password: 'Password', forgot: 'Forgot password?', noAccount: 'Need an account?', create: 'Create an entrepreneur account', verifyTitle: 'Verify your account', code: 'Verification code', verify: 'Verify and continue', resend: 'Resend code', registerTitle: 'Entrepreneur registration', personal: 'Personal information', business: 'Business details', continue: 'Continue', back: 'Back', submit: 'Create account' },
    portal: { entrepreneur: 'Entrepreneur Panel', admin: 'Administration', overview: 'Overview', profile: 'Profile', users: 'Entrepreneurs', settings: 'Settings', logout: 'Sign out', welcome: 'Welcome back', registered: 'Registered entrepreneurs', active: 'Active accounts', suspended: 'Suspended', deleted: 'Archived', account: 'Account status', business: 'Business profile', completion: 'Profile completion', recent: 'Your enterprise at a glance', save: 'Save changes', changePassword: 'Change password' }
  },
  sw: {
    nav: { about: 'Kuhusu SIDO', services: 'Huduma', journey: 'Jinsi inavyofanya kazi', login: 'Ingia', register: 'Fungua akaunti' },
    hero: { eyebrow: 'Shirika la Kuhudumia Viwanda Vidogo', title: 'Mawazo hukua kuwa viwanda kwa msaada sahihi.', body: 'Fikia huduma za SIDO, jenga wasifu wa biashara yako na ungana na fursa kwa wajasiriamali wa Tanzania.', primary: 'Ingia kwenye mfumo', secondary: 'Chunguza huduma' },
    home: { aboutKicker: 'Kuhusu SIDO', aboutTitle: 'Kujenga sekta ya biashara ndogo yenye ushindani', aboutBody: 'SIDO inakuza biashara ndogo na za kati kupitia uendelezaji wa uwezo, teknolojia, fedha, miundombinu, masoko na ushauri wa biashara.', servicesKicker: 'Huduma za SIDO', servicesTitle: 'Msaada katika kila hatua ya ukuaji wa biashara', servicesBody: 'Huduma zinazozingatia mahitaji huwasaidia wajasiriamali kubadilisha mawazo kuwa biashara endelevu.', journeyKicker: 'Njia rahisi ya kidijitali', journeyTitle: 'Anza safari yako na SIDO', ready: 'Uko tayari kukuza biashara yako?', readyBody: 'Fungua wasifu wako wa mjasiriamali na uanze kupata msaada wa SIDO.', rights: 'Haki zote zimehifadhiwa.' },
    auth: { welcome: 'Karibu tena', signin: 'Ingia kwenye akaunti yako', email: 'Barua pepe', password: 'Nenosiri', forgot: 'Umesahau nenosiri?', noAccount: 'Huna akaunti?', create: 'Fungua akaunti ya mjasiriamali', verifyTitle: 'Thibitisha akaunti yako', code: 'Namba ya uthibitisho', verify: 'Thibitisha na uendelee', resend: 'Tuma namba tena', registerTitle: 'Usajili wa mjasiriamali', personal: 'Taarifa binafsi', business: 'Taarifa za biashara', continue: 'Endelea', back: 'Rudi', submit: 'Fungua akaunti' },
    portal: { entrepreneur: 'Sehemu ya Mjasiriamali', admin: 'Usimamizi', overview: 'Muhtasari', profile: 'Wasifu', users: 'Wajasiriamali', settings: 'Mipangilio', logout: 'Toka', welcome: 'Karibu tena', registered: 'Wajasiriamali waliosajiliwa', active: 'Akaunti hai', suspended: 'Zilizosimamishwa', deleted: 'Zilizohifadhiwa', account: 'Hali ya akaunti', business: 'Wasifu wa biashara', completion: 'Ukamilifu wa wasifu', recent: 'Muhtasari wa biashara yako', save: 'Hifadhi mabadiliko', changePassword: 'Badili nenosiri' }
  }
}

const AppContext = createContext(null)
export function AppProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('sido_language') || 'en')
  const [theme, setTheme] = useState(() => localStorage.getItem('sido_theme') || 'light')
  const [session, setSession] = useState(null); const [loading, setLoading] = useState(true)
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem('sido_theme', theme) }, [theme])
  useEffect(() => { document.documentElement.lang = language; localStorage.setItem('sido_language', language) }, [language])
  const refresh = async () => { try { const { data } = await api.get('/auth/me'); setSession(data.data) } catch { setSession(null) } finally { setLoading(false) } }
  useEffect(() => { refresh() }, [])
  const logout = async () => { await api.post('/auth/logout'); setSession(null) }
  const value = useMemo(() => ({ language, setLanguage, theme, setTheme, t: copy[language], session, setSession, loading, refresh, logout }), [language, theme, session, loading])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
// Context and hook intentionally share a module so hot reload preserves provider state.
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext)
