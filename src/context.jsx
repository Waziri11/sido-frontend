import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "./lib";

// Exported for translation-parity tests.
// eslint-disable-next-line react-refresh/only-export-components
export const copy = {
  en: {
    nav: {
      about: "About SIDO",
      services: "Services",
      journey: "How it works",
      login: "Sign in",
      register: "Create account",
    },
    hero: {
      eyebrow: "Small Industries Development Organization",
      title: "Ideas grow into industries with the right support.",
      body: "Access SIDO services, build your enterprise profile and connect to opportunities designed for Tanzanian entrepreneurs.",
      primary: "Access the portal",
      secondary: "Explore services",
    },
    home: {
      aboutKicker: "About SIDO",
      aboutTitle: "Building a competitive SME sector",
      aboutBody:
        "SIDO promotes the development of small and medium enterprises through practical capacity development, technology, finance, infrastructure, markets and business support.",
      servicesKicker: "SIDO services",
      servicesTitle: "Support for every stage of enterprise growth",
      servicesBody:
        "Relevant, demand-driven services help entrepreneurs turn ideas into sustainable, competitive enterprises.",
      journeyKicker: "A clear digital pathway",
      journeyTitle: "Start your SIDO journey",
      ready: "Ready to grow your enterprise?",
      readyBody:
        "Create your entrepreneur profile and take the first step toward SIDO support.",
      rights: "All rights reserved.",
    },
    auth: {
      welcome: "Welcome back",
      signin: "Sign in to your account",
      email: "Email address",
      password: "Password",
      forgot: "Forgot password?",
      noAccount: "Need an account?",
      create: "Create an entrepreneur account",
      verifyTitle: "Verify your account",
      code: "Verification code",
      verify: "Verify and continue",
      resend: "Resend code",
      registerTitle: "Entrepreneur registration",
      personal: "Personal information",
      business: "Business details",
      continue: "Continue",
      back: "Back",
      submit: "Create account",
    },
    portal: {
      entrepreneur: "Entrepreneur Panel",
      admin: "Administration",
      overview: "Overview",
      profile: "Profile",
      users: "Entrepreneurs",
      settings: "Settings",
      logout: "Sign out",
      welcome: "Welcome back",
      registered: "Registered entrepreneurs",
      active: "Active accounts",
      suspended: "Suspended",
      deleted: "Archived",
      account: "Account status",
      business: "Business profile",
      completion: "Profile completion",
      recent: "Your enterprise at a glance",
      save: "Save changes",
      changePassword: "Change password",
    },
    labels: {
      Overview: "Overview",
      Events: "Events",
      Revenue: "Revenue",
      Refunds: "Refunds",
      Entrepreneurs: "Entrepreneurs",
      Feedback: "Feedback",
      "Staff Management": "Staff management",
      Sessions: "Sessions",
      "System Logs": "System logs",
      "Security Settings": "Security settings",
      "Book a booth": "Book a booth",
      "My bookings": "My bookings",
      Sales: "Sales",
      Notifications: "Notifications",
      "My Feedback": "My feedback",
      Profile: "Profile",
      Settings: "Settings",
    },
    common: {
      previous: "Previous",
      next: "Next",
      cancel: "Cancel",
      save: "Save",
      loading: "Loading…",
      noResults: "No results found",
      markRead: "Mark read",
      markAllRead: "Mark all as read",
    },
    booking: {
      select: "Select booth",
      review: "Review business",
      addons: "Add services",
      control: "Get control number",
      pay: "Pay",
      confirmation: "Confirmation",
      selection: "Your selection",
      verifyPay: "Verify and pay",
      confirmed: "Booking confirmed",
      remaining: "Reservation time remaining",
      adjacent: "Additional booths must share an edge.",
      total: "Booths total",
      checkout: "Checkout",
      unavailable: "Checkout unavailable",
      cancelReservation: "Cancel reservation",
      controlNumber: "gEPG control number",
      copyControl: "Copy control number",
      myBookings: "My bookings",
      bookingIntro:
        "Track booth holds, payments, passes, and daily event sales.",
      continuePayment: "Continue payment",
      invoice: "Invoice",
      setupPass: "Setup pass",
      noBookings: "You have not reserved a booth yet.",
      browseEvents: "Browse open events",
    },
    notify: {
      title: "Notifications",
      intro: "Payment, booking, event, and service updates in one place.",
      empty: "No notifications yet.",
      new: "New",
    },
  },
  sw: {
    nav: {
      about: "Kuhusu SIDO",
      services: "Huduma",
      journey: "Jinsi inavyofanya kazi",
      login: "Ingia",
      register: "Fungua akaunti",
    },
    hero: {
      eyebrow: "Shirika la Kuhudumia Viwanda Vidogo",
      title: "Mawazo hukua kuwa viwanda kwa msaada sahihi.",
      body: "Fikia huduma za SIDO, jenga wasifu wa biashara yako na ungana na fursa kwa wajasiriamali wa Tanzania.",
      primary: "Ingia kwenye mfumo",
      secondary: "Chunguza huduma",
    },
    home: {
      aboutKicker: "Kuhusu SIDO",
      aboutTitle: "Kujenga sekta ya biashara ndogo yenye ushindani",
      aboutBody:
        "SIDO inakuza biashara ndogo na za kati kupitia uendelezaji wa uwezo, teknolojia, fedha, miundombinu, masoko na ushauri wa biashara.",
      servicesKicker: "Huduma za SIDO",
      servicesTitle: "Msaada katika kila hatua ya ukuaji wa biashara",
      servicesBody:
        "Huduma zinazozingatia mahitaji huwasaidia wajasiriamali kubadilisha mawazo kuwa biashara endelevu.",
      journeyKicker: "Njia rahisi ya kidijitali",
      journeyTitle: "Anza safari yako na SIDO",
      ready: "Uko tayari kukuza biashara yako?",
      readyBody:
        "Fungua wasifu wako wa mjasiriamali na uanze kupata msaada wa SIDO.",
      rights: "Haki zote zimehifadhiwa.",
    },
    auth: {
      welcome: "Karibu tena",
      signin: "Ingia kwenye akaunti yako",
      email: "Barua pepe",
      password: "Nenosiri",
      forgot: "Umesahau nenosiri?",
      noAccount: "Huna akaunti?",
      create: "Fungua akaunti ya mjasiriamali",
      verifyTitle: "Thibitisha akaunti yako",
      code: "Namba ya uthibitisho",
      verify: "Thibitisha na uendelee",
      resend: "Tuma namba tena",
      registerTitle: "Usajili wa mjasiriamali",
      personal: "Taarifa binafsi",
      business: "Taarifa za biashara",
      continue: "Endelea",
      back: "Rudi",
      submit: "Fungua akaunti",
    },
    portal: {
      entrepreneur: "Sehemu ya Mjasiriamali",
      admin: "Usimamizi",
      overview: "Muhtasari",
      profile: "Wasifu",
      users: "Wajasiriamali",
      settings: "Mipangilio",
      logout: "Toka",
      welcome: "Karibu tena",
      registered: "Wajasiriamali waliosajiliwa",
      active: "Akaunti hai",
      suspended: "Zilizosimamishwa",
      deleted: "Zilizohifadhiwa",
      account: "Hali ya akaunti",
      business: "Wasifu wa biashara",
      completion: "Ukamilifu wa wasifu",
      recent: "Muhtasari wa biashara yako",
      save: "Hifadhi mabadiliko",
      changePassword: "Badili nenosiri",
    },
    labels: {
      Overview: "Muhtasari",
      Events: "Matukio",
      Revenue: "Mapato",
      Refunds: "Marejesho",
      Entrepreneurs: "Wajasiriamali",
      Feedback: "Maoni",
      "Staff Management": "Usimamizi wa watumishi",
      Sessions: "Vikao",
      "System Logs": "Kumbukumbu za mfumo",
      "Security Settings": "Mipangilio ya usalama",
      "Book a booth": "Weka nafasi ya banda",
      "My bookings": "Nafasi zangu",
      Sales: "Mauzo",
      Notifications: "Arifa",
      "My Feedback": "Maoni yangu",
      Profile: "Wasifu",
      Settings: "Mipangilio",
    },
    common: {
      previous: "Iliyopita",
      next: "Inayofuata",
      cancel: "Ghairi",
      save: "Hifadhi",
      loading: "Inapakia…",
      noResults: "Hakuna matokeo",
      markRead: "Weka imesomwa",
      markAllRead: "Weka zote zimesomwa",
    },
    booking: {
      select: "Chagua banda",
      review: "Kagua biashara",
      addons: "Ongeza huduma",
      control: "Pata namba ya malipo",
      pay: "Lipa",
      confirmation: "Uthibitisho",
      selection: "Chaguo lako",
      verifyPay: "Thibitisha na ulipe",
      confirmed: "Nafasi imethibitishwa",
      remaining: "Muda uliobaki wa nafasi",
      adjacent: "Banda za ziada lazima zipakane.",
      total: "Jumla ya mabanda",
      checkout: "Endelea kulipa",
      unavailable: "Malipo hayapatikani",
      cancelReservation: "Ghairi nafasi",
      controlNumber: "Namba ya malipo ya gEPG",
      copyControl: "Nakili namba ya malipo",
      myBookings: "Nafasi zangu",
      bookingIntro: "Fuatilia nafasi, malipo, pasi na mauzo ya kila siku.",
      continuePayment: "Endelea kulipa",
      invoice: "Ankara",
      setupPass: "Pasi ya maandalizi",
      noBookings: "Bado hujaweka nafasi ya banda.",
      browseEvents: "Tazama matukio yaliyo wazi",
    },
    notify: {
      title: "Arifa",
      intro: "Taarifa za malipo, nafasi, matukio na huduma mahali pamoja.",
      empty: "Bado hakuna arifa.",
      new: "Mpya",
    },
  },
};

const AppContext = createContext(null);
export function AppProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("sido_language") || "en",
  );
  const [theme, setTheme] = useState(
    () => localStorage.getItem("sido_theme") || "light",
  );
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const acceptSession = useCallback((next) => {
    setSession(next);
    if (next?.user?.language) setLanguage(next.user.language);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("sido_theme", theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("sido_language", language);
  }, [language]);
  useEffect(() => {
    if (
      session?.user?.role !== "entrepreneur" ||
      session.user.language === language
    )
      return;
    let active = true;
    api
      .patch("/entrepreneur/profile", { language })
      .then(({ data }) => {
        if (active)
          setSession((current) =>
            current
              ? { ...current, user: data.data.user, profile: data.data.profile }
              : current,
          );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [language, session?.user?.language, session?.user?.role]);
  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      acceptSession(data.data?.user ? data.data : null);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [acceptSession]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const logout = async () => {
    await api.post("/auth/logout");
    setSession(null);
  };
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      theme,
      setTheme,
      t: copy[language],
      session,
      setSession: acceptSession,
      loading,
      refresh,
      logout,
    }),
    [acceptSession, language, theme, session, loading, refresh],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
// Context and hook intentionally share a module so hot reload preserves provider state.
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
