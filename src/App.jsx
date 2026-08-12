import { Component, forwardRef, useEffect, useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  EyeOff,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  ListTree,
  Loader2,
  LogOut,
  Mail,
  Map,
  MessageSquare,
  Pencil,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Store,
  TicketCheck,
  Trash2,
  User,
  UserCog,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { api, messageOf } from "./lib";
import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Field,
  Input,
  PageSkeleton,
  TableAction,
  TableActions,
  Textarea,
} from "./components/ui";
import { useApp } from "./context";
import {
  AdminBoothControl,
  AdminCreateEvent,
  AdminEventManagement,
  AdminEvents,
  AdminRevenue,
  BookingDetail,
  BookingEvents,
  MyBookingDetail,
  MyBookings,
  PublicEvent,
  PublicEvents,
} from "./Booking";
import SiteHeader from "./SiteHeader";
import { sidoConfirm, sidoError, sidoSuccess } from "./alerts";
import { AdminEntrepreneurSalesDetail, EntrepreneurSales } from "./Sales";
import { MyFeedback, StaffFeedback } from "./Feedback";
import { entrepreneurNavigation, staffNavigation } from "./portalNavigation";

const formatSalesMoney = (minor = 0) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(minor / 100);

function useUrlState(key, fallback = "") {
  const [params, setParams] = useSearchParams();
  const value = params.get(key) ?? fallback;
  const setValue = (nextValue) => {
    const resolved =
      typeof nextValue === "function" ? nextValue(value) : nextValue;
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (
          resolved === "" ||
          resolved === null ||
          resolved === undefined ||
          resolved === fallback
        )
          next.delete(key);
        else next.set(key, String(resolved));
        return next;
      },
      { replace: true },
    );
  };
  return [value, setValue];
}
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const PasswordInput = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        ref={ref}
        {...props}
        type={visible ? "text" : "password"}
        className="pr-11"
      />
      <button
        type="button"
        className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-muted-foreground hover:text-foreground"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      failed: false,
      error: null,
      componentStack: "",
      note: "",
      sent: false,
      sending: false,
      reportError: "",
    };
  }
  static getDerivedStateFromError(error) {
    return { failed: true, error };
  }
  componentDidCatch(_error, info) {
    this.setState({ componentStack: info.componentStack || "" });
  }
  report = async (event) => {
    event.preventDefault();
    this.setState({ sending: true, reportError: "" });
    const referenceCode = `SIDO-${Date.now().toString(36).toUpperCase()}`;
    try {
      await api.post("/feedback", {
        category: "technical",
        feedback:
          this.state.note.trim() ||
          `Unexpected user-interface error (${referenceCode})`,
        errorReport: {
          referenceCode,
          route: location.pathname,
          occurredAt: new Date().toISOString(),
          errorName: this.state.error?.name,
          errorMessage: this.state.error?.message,
          stack: this.state.error?.stack,
          componentStack: this.state.componentStack,
          userAgent: navigator.userAgent,
        },
      });
      this.setState({ sent: true, sending: false });
    } catch (error) {
      this.setState({ reportError: messageOf(error), sending: false });
    }
  };
  render() {
    return this.state.failed ? (
      <main className="grid min-h-screen place-items-center p-6">
        <Card className="error-report-card">
          <div className="auth-icon mx-auto">
            <MessageSquare />
          </div>
          <h1>Something went wrong</h1>
          <p>
            The page could not be displayed. You can send a technical report to
            the SIDO support team.
          </p>
          {this.state.reportError && <Alert>{this.state.reportError}</Alert>}
          {this.state.sent ? (
            <Alert type="success">Technical report sent successfully.</Alert>
          ) : (
            <form className="auth-form" onSubmit={this.report}>
              <Field label="What were you doing? (optional)">
                <Textarea
                  value={this.state.note}
                  onChange={(event) =>
                    this.setState({ note: event.target.value })
                  }
                  maxLength="4000"
                />
              </Field>
              <Button disabled={this.state.sending}>
                {this.state.sending && <Loader2 className="spin" />}Send
                technical report
              </Button>
            </form>
          )}
          <Button variant="outline" onClick={() => location.reload()}>
            Reload page
          </Button>
        </Card>
      </main>
    ) : (
      this.props.children
    );
  }
}

function Brand({ compact = false }) {
  return (
    <Link to="/" className="brand">
      <img src="/sido-logo.png" alt="SIDO" />
      <span>
        <strong>SIDO</strong>
        {!compact && <small>Small Industries Development Organization</small>}
      </span>
    </Link>
  );
}

const heroSlides = [
  "/hero/sido%201.jpeg",
  "/hero/images.jpeg",
  "/hero/ZIARA%20YA%20JAFO%20-%20SIDO.jpg",
];
const services = [
  [Wrench, "Technology & technical services", "Huduma za teknolojia na ufundi"],
  [
    GraduationCap,
    "Business training & consultancy",
    "Mafunzo na ushauri wa biashara",
  ],
  [Store, "Marketing & information", "Masoko na taarifa"],
  [Banknote, "Financial linkages", "Uunganishaji wa huduma za fedha"],
  [Building2, "SME infrastructure", "Miundombinu ya biashara"],
  [Users, "Industrial extension services", "Huduma za ugani wa viwanda"],
];

function PublicHeader() {
  return <SiteHeader />;
}

function Landing() {
  const { t, language } = useApp();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setSlide((x) => (x + 1) % heroSlides.length),
      6500,
    );
    return () => clearInterval(id);
  }, []);

  const changeSlide = (direction) => {
    setSlide(
      (current) =>
        (current + direction + heroSlides.length) % heroSlides.length,
    );
  };

  const steps =
    language === "en"
      ? [
          [
            "Create your account",
            "Register your personal and enterprise information.",
          ],
          [
            "Verify your identity",
            "Confirm your email through a secure one-time code.",
          ],
          [
            "Build your profile",
            "Keep your enterprise details current in one place.",
          ],
          [
            "Connect and grow",
            "Prepare to access SIDO opportunities and services.",
          ],
        ]
      : [
          ["Fungua akaunti", "Sajili taarifa zako na za biashara yako."],
          [
            "Thibitisha utambulisho",
            "Thibitisha barua pepe kwa namba ya mara moja.",
          ],
          ["Jenga wasifu", "Weka taarifa za biashara yako mahali pamoja."],
          ["Ungana na ukue", "Jiandae kufikia fursa na huduma za SIDO."],
        ];

  return (
    <div className="landing-page">
      <PublicHeader />
      <main id="main-content">
        <section className="hero" id="home">
          <div className="hero-slides" aria-hidden="true">
            {heroSlides.map((image, index) => (
              <div
                key={image}
                className={`hero-slide${index === slide ? " is-active" : ""}`}
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
                  <strong>
                    {language === "en" ? "Secure access" : "Ufikiaji salama"}
                  </strong>
                  {language === "en"
                    ? "Your enterprise data stays protected"
                    : "Taarifa zako zinalindwa"}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="hero-arrow left"
            onClick={() => changeSlide(-1)}
            aria-label={
              language === "sw" ? "Picha iliyopita" : "Previous image"
            }
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            className="hero-arrow right"
            onClick={() => changeSlide(1)}
            aria-label={language === "sw" ? "Picha inayofuata" : "Next image"}
          >
            <ChevronRight size={24} />
          </button>
          <div
            className="hero-dots"
            role="group"
            aria-label={language === "sw" ? "Chagua picha" : "Choose image"}
          >
            {heroSlides.map((image, index) => (
              <button
                key={image}
                type="button"
                className={index === slide ? "active" : ""}
                onClick={() => setSlide(index)}
                aria-label={`Image ${index + 1}`}
              />
            ))}
          </div>
        </section>
        <section id="about" className="section intro">
          <div className="shell two-col">
            <div>
              <span className="kicker">{t.home.aboutKicker}</span>
              <h2>{t.home.aboutTitle}</h2>
            </div>
            <div>
              <p>{t.home.aboutBody}</p>
              <p>
                {language === "en"
                  ? "Established in 1973, SIDO supports an innovative entrepreneurial base and sustainable industrialization across Tanzania."
                  : "SIDO ilianzishwa mwaka 1973 kusaidia msingi bunifu wa ujasiriamali na maendeleo endelevu ya viwanda Tanzania."}
              </p>
            </div>
          </div>
        </section>
        <section id="services" className="section services">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">{t.home.servicesKicker}</span>
              <h2>{t.home.servicesTitle}</h2>
              <p>{t.home.servicesBody}</p>
            </div>
            <div className="service-grid">
              {services.map(([ServiceIcon, en, sw], i) => (
                <article key={en}>
                  <span className="service-number">0{i + 1}</span>
                  <div className="service-icon">
                    <ServiceIcon />
                  </div>
                  <h3>{language === "en" ? en : sw}</h3>
                  <p>
                    {language === "en"
                      ? "Practical support tailored to the needs and growth of Tanzanian SMEs."
                      : "Msaada wa vitendo unaolingana na mahitaji na ukuaji wa biashara ndogo Tanzania."}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="journey" className="section journey">
          <div className="shell journey-grid">
            <div>
              <span className="kicker light">{t.home.journeyKicker}</span>
              <h2>{t.home.journeyTitle}</h2>
              <p>
                {language === "en"
                  ? "A secure account gives you one reliable identity for future SIDO digital services."
                  : "Akaunti salama inakupa utambulisho mmoja kwa huduma za kidijitali za SIDO."}
              </p>
              <Button variant="outline" asChild>
                <Link to="/register">
                  {t.nav.register}
                  <ArrowRight size={17} />
                </Link>
              </Button>
            </div>
            <div className="steps">
              {steps.map((step, i) => (
                <article key={step[0]}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{step[0]}</h3>
                    <p>{step[1]}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="cta">
          <div className="shell">
            <div>
              <span>
                {language === "en" ? "YOUR NEXT STEP" : "HATUA YAKO INAYOFUATA"}
              </span>
              <h2>{t.home.ready}</h2>
              <p>{t.home.readyBody}</p>
            </div>
            <Button asChild>
              <Link to="/register">
                {t.nav.register}
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <footer>
        <div className="shell">
          <Brand />
          <div>
            <span>
              © {new Date().getFullYear()} SIDO. {t.home.rights}
            </span>
            <a href="https://www.sido.go.tz" target="_blank" rel="noreferrer">
              www.sido.go.tz
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <PublicHeader />
      <main id="main-content">{children}</main>
    </div>
  );
}
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
function Login() {
  const { t, session, setSession } = useApp();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });
  if (session?.user)
    return (
      <Navigate
        to={staffRoles.includes(session.user.role) ? "/admin" : "/portal"}
        replace
      />
    );
  const submit = async (values) => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", values);
      if (data.data.requiresOtp) {
        setOtp({ email: data.data.email, purpose: data.data.purpose });
        if (data.data.developmentCode)
          setError(
            `Development verification code: ${data.data.developmentCode}`,
          );
      } else {
        setSession(data.data);
        navigate(
          staffRoles.includes(data.data.user.role) ? "/admin" : "/portal",
        );
      }
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  };
  const verify = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const code = new FormData(e.currentTarget).get("code");
      const endpoint =
        otp.purpose === "verify_email"
          ? "/auth/verify-email"
          : "/auth/verify-login";
      const { data } = await api.post(endpoint, { email: otp.email, code });
      setSession(data.data);
      navigate(staffRoles.includes(data.data.user.role) ? "/admin" : "/portal");
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  };
  const resend = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api.post("/auth/resend-otp", otp);
      setNotice("A new verification code has been sent.");
    } catch (requestError) {
      setError(messageOf(requestError));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthLayout>
      <Card className="auth-card">
        <Link className="back-link" to="/">
          <ArrowLeft size={16} /> {t.nav.about}
        </Link>
        <div className="auth-heading">
          <div className="auth-icon">
            {otp ? <BadgeCheck /> : <UserRound />}
          </div>
          <h1>{otp ? t.auth.verifyTitle : t.auth.welcome}</h1>
          <p>
            {otp
              ? `Enter the 6-digit code sent to ${otp.email}`
              : t.auth.signin}
          </p>
        </div>
        {error && <Alert>{error}</Alert>}
        {notice && <Alert type="success">{notice}</Alert>}
        {otp ? (
          <form className="auth-form" onSubmit={verify}>
            <Field label={t.auth.code}>
              <Input
                name="code"
                inputMode="numeric"
                maxLength="6"
                pattern="[0-9]{6}"
                required
                className="otp-input"
                placeholder="000000"
              />
            </Field>
            <Button disabled={busy}>
              {busy && <Loader2 className="spin" />}
              {t.auth.verify}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={resend}
              disabled={busy}
            >
              {t.auth.resend}
            </Button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit(submit)}>
            <Field label={t.auth.email} error={errors.email?.message}>
              <Input type="email" autoComplete="email" {...register("email")} />
            </Field>
            <Field label={t.auth.password} error={errors.password?.message}>
              <PasswordInput
                autoComplete="current-password"
                {...register("password")}
              />
            </Field>
            <Link className="forgot" to="/forgot-password">
              {t.auth.forgot}
            </Link>
            <Button disabled={busy}>
              {busy && <Loader2 className="spin" />}
              {t.nav.login}
            </Button>
            <div className="auth-footer">
              <span>{t.auth.noAccount}</span>
              <Link to="/register">{t.auth.create}</Link>
            </div>
          </form>
        )}
      </Card>
    </AuthLayout>
  );
}

const personalSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phoneNumber: z.string().min(10),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/\d/)
      .regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string(),
  })
  .refine((x) => x.password === x.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
const regions = [
  "Arusha",
  "Dar es Salaam",
  "Dodoma",
  "Geita",
  "Iringa",
  "Kagera",
  "Katavi",
  "Kigoma",
  "Kilimanjaro",
  "Lindi",
  "Manyara",
  "Mara",
  "Mbeya",
  "Morogoro",
  "Mtwara",
  "Mwanza",
  "Njombe",
  "Pwani",
  "Rukwa",
  "Ruvuma",
  "Shinyanga",
  "Simiyu",
  "Singida",
  "Songwe",
  "Tabora",
  "Tanga",
];
const readRegistrationDraft = () => {
  try {
    return JSON.parse(localStorage.getItem("sido_registration_draft") || "{}");
  } catch {
    return {};
  }
};
function Register() {
  const { t, language } = useApp();
  const sw = language === "sw";
  const navigate = useNavigate();
  const [saved] = useState(readRegistrationDraft);
  const [step, setStep] = useState(0);
  const [personal, setPersonal] = useState(null);
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(personalSchema),
    defaultValues: saved.personal || {},
  });
  const savePersonal = (values) => {
    setPersonal(values);
    localStorage.setItem(
      "sido_registration_draft",
      JSON.stringify({
        ...saved,
        personal: {
          ...values,
          password: undefined,
          confirmPassword: undefined,
        },
      }),
    );
    setStep(1);
  };
  const review = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values = Object.fromEntries(
      [...fd.entries()].filter(([, value]) => typeof value === "string"),
    );
    const files = {
      businessLicenseDocument: fd.get("businessLicenseDocument"),
      tinDocument: fd.get("tinDocument"),
    };
    const attached = Object.values(files).filter((file) => file?.size);
    if (attached.some((file) => file.size > 5 * 1024 * 1024)) {
      setError(
        language === "sw"
          ? "Kila faili lazima liwe MB 5 au chini."
          : "Each file must be 5 MB or smaller.",
      );
      return;
    }
    if (
      attached.some(
        (file) =>
          file.type !== "application/pdf" && !file.type.startsWith("image/"),
      )
    ) {
      setError(
        language === "sw"
          ? "Tumia faili la PDF, JPG au PNG pekee."
          : "Use PDF, JPG, or PNG documents only.",
      );
      return;
    }
    setError("");
    setBusiness({ values, files });
    localStorage.setItem(
      "sido_registration_draft",
      JSON.stringify({
        personal: {
          ...(personal || saved.personal),
          password: undefined,
          confirmPassword: undefined,
        },
        business: values,
      }),
    );
    setStep(2);
  };
  const finish = async () => {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      Object.entries(personal || {}).forEach(
        ([key, value]) => key !== "confirmPassword" && form.append(key, value),
      );
      Object.entries(business.values).forEach(([key, value]) =>
        form.append(key, value),
      );
      Object.entries(business.files).forEach(
        ([key, file]) => file?.size && form.append(key, file),
      );
      form.append("acceptedTerms", "true");
      form.append("language", language);
      const { data } = await api.post("/auth/register", form, {
        onUploadProgress: (event) =>
          setUploadProgress(
            event.total ? Math.round((event.loaded / event.total) * 100) : 0,
          ),
      });
      localStorage.removeItem("sido_registration_draft");
      navigate(`/verify-email?email=${encodeURIComponent(data.data.email)}`);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  };
  const stepLabels = [
    t.auth.personal,
    t.auth.business,
    language === "sw" ? "Kagua" : "Review",
  ];
  return (
    <AuthLayout>
      <Card className="auth-card register-card">
        <Link className="back-link" to="/login">
          <ArrowLeft size={16} /> {t.nav.login}
        </Link>
        <div className="auth-heading">
          <h1>{t.auth.registerTitle}</h1>
          <p>{stepLabels[step]}</p>
          <small>
            {language === "sw"
              ? "Maendeleo yasiyo na taarifa nyeti yanahifadhiwa kwenye kifaa hiki."
              : "Your non-sensitive progress is saved on this device."}
          </small>
        </div>
        <ol
          className="stepper registration-stepper"
          aria-label="Registration progress"
        >
          {stepLabels.map((label, index) => (
            <li key={label} className={index <= step ? "active" : ""}>
              <span>{index + 1}</span>
              <small>{label}</small>
            </li>
          ))}
        </ol>
        {error && <Alert>{error}</Alert>}
        {step === 0 ? (
          <form className="auth-form" onSubmit={handleSubmit(savePersonal)}>
            <div className="form-grid">
              <Field
                label={sw ? "Jina la kwanza" : "First name"}
                error={errors.firstName?.message}
              >
                <Input autoComplete="given-name" {...register("firstName")} />
              </Field>
              <Field
                label={sw ? "Jina la mwisho" : "Last name"}
                error={errors.lastName?.message}
              >
                <Input autoComplete="family-name" {...register("lastName")} />
              </Field>
              <Field label={t.auth.email} error={errors.email?.message}>
                <Input
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                />
              </Field>
              <Field
                label={sw ? "Namba ya simu" : "Phone number"}
                hint={
                  sw
                    ? "Tumia namba ya Tanzania, kwa mfano +255 712 345 678."
                    : "Use a Tanzanian number, for example +255 712 345 678."
                }
                error={errors.phoneNumber?.message}
              >
                <Input
                  type="tel"
                  autoComplete="tel"
                  placeholder="+255 7xx xxx xxx"
                  {...register("phoneNumber")}
                />
              </Field>
              <Field
                label={t.auth.password}
                hint="8+ characters including uppercase, lowercase, number and symbol."
                error={
                  errors.password && "Password does not meet all requirements."
                }
              >
                <PasswordInput
                  autoComplete="new-password"
                  {...register("password")}
                />
              </Field>
              <Field
                label={sw ? "Thibitisha nenosiri" : "Confirm password"}
                error={errors.confirmPassword?.message}
              >
                <PasswordInput
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
              </Field>
            </div>
            <Button>
              {t.auth.continue}
              <ArrowRight size={17} />
            </Button>
          </form>
        ) : step === 1 ? (
          <form className="auth-form" onSubmit={review}>
            <div className="form-grid">
              <Field label={sw ? "Jina la biashara" : "Business name"}>
                <Input
                  name="businessName"
                  defaultValue={saved.business?.businessName}
                  required
                />
              </Field>
              <Field
                label={
                  sw ? "Aina / sekta ya biashara" : "Business type / sector"
                }
              >
                <Input
                  name="businessType"
                  defaultValue={saved.business?.businessType}
                  required
                />
              </Field>
              <Field label={sw ? "Mkoa" : "Region"}>
                <select
                  name="region"
                  defaultValue={saved.business?.region || ""}
                  required
                >
                  <option value="">
                    {sw ? "Chagua mkoa" : "Select region"}
                  </option>
                  {regions.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label={sw ? "Wilaya" : "District"}>
                <Input
                  name="district"
                  defaultValue={saved.business?.district}
                  required
                />
              </Field>
              <Field label="TIN (optional)">
                <Input name="tin" defaultValue={saved.business?.tin} />
              </Field>
              <Field label={sw ? "Tovuti (si lazima)" : "Website (optional)"}>
                <Input
                  name="website"
                  type="url"
                  placeholder="https://"
                  defaultValue={saved.business?.website}
                />
              </Field>
            </div>
            <Field label={sw ? "Anwani ya biashara" : "Physical address"}>
              <Textarea
                name="physicalAddress"
                defaultValue={saved.business?.physicalAddress}
              />
            </Field>
            <Field
              label={
                sw
                  ? "Maelezo ya biashara (si lazima)"
                  : "Business description (optional)"
              }
            >
              <Textarea
                name="description"
                defaultValue={saved.business?.description}
              />
            </Field>
            <div className="form-grid">
              <Field
                label="Business licence (PDF/image)"
                hint="PDF, JPG or PNG; maximum 5 MB."
              >
                <Input
                  name="businessLicenseDocument"
                  type="file"
                  accept=".pdf,image/*"
                />
              </Field>
              <Field
                label="TIN document (PDF/image)"
                hint="PDF, JPG or PNG; maximum 5 MB."
              >
                <Input name="tinDocument" type="file" accept=".pdf,image/*" />
              </Field>
            </div>
            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(0)}
              >
                {t.auth.back}
              </Button>
              <Button>
                {sw ? "Kagua maombi" : "Review application"}
                <ArrowRight size={17} />
              </Button>
            </div>
          </form>
        ) : (
          <div className="registration-review">
            <h2>{sw ? "Kagua maombi yako" : "Review your application"}</h2>
            <p>
              {sw
                ? "Thibitisha taarifa hizi kabla ya kufungua akaunti."
                : "Confirm these details before creating your account."}
            </p>
            <dl>
              <div>
                <dt>Applicant</dt>
                <dd>
                  {personal.firstName} {personal.lastName}
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{personal.email}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{personal.phoneNumber}</dd>
              </div>
              <div>
                <dt>Business</dt>
                <dd>{business.values.businessName}</dd>
              </div>
              <div>
                <dt>Sector</dt>
                <dd>{business.values.businessType}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>
                  {business.values.district}, {business.values.region}
                </dd>
              </div>
              <div>
                <dt>Documents</dt>
                <dd>
                  {[
                    business.files.businessLicenseDocument?.name,
                    business.files.tinDocument?.name,
                  ]
                    .filter(Boolean)
                    .join(", ") || "No optional documents attached"}
                </dd>
              </div>
            </dl>
            <label className="terms-check">
              <input
                type="checkbox"
                required
                onChange={(e) =>
                  (e.currentTarget
                    .closest(".registration-review")
                    .querySelector("button[data-submit]").disabled =
                    !e.target.checked)
                }
              />{" "}
              I confirm the information is accurate and consent to SIDO
              processing it to provide portal services.
            </label>
            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Edit details
              </Button>
              {busy && (
                <div className="upload-progress" role="status">
                  <i style={{ width: `${uploadProgress}%` }} />
                  <span>
                    {language === "sw"
                      ? `Inatuma ${uploadProgress}%`
                      : `Uploading ${uploadProgress}%`}
                  </span>
                </div>
              )}
              <Button data-submit disabled onClick={finish}>
                {busy && <Loader2 className="spin" />}Create account
              </Button>
            </div>
          </div>
        )}
      </Card>
    </AuthLayout>
  );
}

function VerifyEmail() {
  const { setSession, t } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get("email") || "";
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/verify-email", {
        email,
        code: new FormData(e.currentTarget).get("code"),
      });
      setSession(data.data);
      navigate("/portal");
    } catch (err) {
      setError(messageOf(err));
    }
  };
  const resend = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api.post("/auth/resend-otp", { email, purpose: "verify_email" });
      setNotice("A new verification code has been sent.");
    } catch (requestError) {
      setError(messageOf(requestError));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthLayout>
      <Card className="auth-card">
        <div className="auth-heading">
          <div className="auth-icon">
            <Mail />
          </div>
          <h1>{t.auth.verifyTitle}</h1>
          <p>Enter the code sent to {email}</p>
        </div>
        {error && <Alert>{error}</Alert>}
        {notice && <Alert type="success">{notice}</Alert>}
        <form className="auth-form" onSubmit={submit}>
          <Input
            name="code"
            maxLength="6"
            pattern="[0-9]{6}"
            required
            className="otp-input"
          />
          <Button>{t.auth.verify}</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={resend}
            disabled={busy}
          >
            {t.auth.resend}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
function ForgotPassword() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [sent, setSent] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(e.currentTarget);
      if (!sent) {
        const email = fd.get("email");
        await api.post("/auth/forgot-password", { email });
        setSent({ email });
      } else {
        const code = fd.get("code");
        const { data } = await api.post("/auth/verify-reset", {
          email: sent.email,
          code,
        });
        navigate(
          `/reset-password?email=${encodeURIComponent(sent.email)}&code=${code}&token=${data.data.resetToken}`,
        );
      }
    } catch (err) {
      setError(messageOf(err));
    }
  };
  return (
    <AuthLayout>
      <Card className="auth-card">
        <Link className="back-link" to="/login">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
        <div className="auth-heading">
          <div className="auth-icon">
            <Mail />
          </div>
          <h1>Reset your password</h1>
          <p>
            {sent
              ? "Enter the 6-digit code sent to your email."
              : "We will send a secure reset code to your email."}
          </p>
        </div>
        {error && <Alert>{error}</Alert>}
        <form className="auth-form" onSubmit={submit}>
          {sent ? (
            <Input name="code" className="otp-input" maxLength="6" required />
          ) : (
            <Field label="Email address">
              <Input name="email" type="email" required />
            </Field>
          )}
          <Button>Continue</Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("password") !== fd.get("confirm"))
      return setError("Passwords do not match");
    try {
      await api.post("/auth/reset-password", {
        email: params.get("email"),
        code: params.get("code"),
        resetToken: params.get("token"),
        password: fd.get("password"),
      });
      navigate("/login");
    } catch (err) {
      setError(messageOf(err));
    }
  };
  return (
    <AuthLayout>
      <Card className="auth-card">
        <div className="auth-heading">
          <h1>Choose a new password</h1>
          <p>Use at least 8 characters with upper, lower, number and symbol.</p>
        </div>
        {error && <Alert>{error}</Alert>}
        <form className="auth-form" onSubmit={submit}>
          <Field label="New password">
            <Input name="password" type="password" required />
          </Field>
          <Field label="Confirm password">
            <Input name="confirm" type="password" required />
          </Field>
          <Button>Reset password</Button>
        </form>
      </Card>
    </AuthLayout>
  );
}

const staffRoles = ["manager", "admin", "superadmin"];
function Protected({ role, roles, children }) {
  const { session, loading } = useApp();
  if (loading) return <PageLoader />;
  if (!session?.user) return <Navigate to="/login" replace />;
  const allowed = roles || (role ? [role] : null);
  if (allowed && !allowed.includes(session.user.role))
    return <Navigate to="/forbidden" replace />;
  return children;
}
function PageLoader() {
  return <PageSkeleton />;
}
function PortalShell({ admin = false, children }) {
  const { t, logout, session } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sido_sidebar_collapsed") === "true",
  );
  const nav = admin
    ? staffNavigation(session?.user?.role)
    : entrepreneurNavigation();
  const toggleSidebar = () =>
    setCollapsed((value) => {
      const next = !value;
      localStorage.setItem("sido_sidebar_collapsed", String(next));
      return next;
    });
  const signout = async () => {
    await logout();
    navigate("/");
  };
  return (
    <div className={`portal${collapsed ? " sidebar-collapsed" : ""}`}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={open ? "open" : ""}
        aria-label={
          admin ? "Administration navigation" : "Entrepreneur navigation"
        }
      >
        <div className="sidebar-brand">
          <button
            className="mobile-sidebar-close"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <div className="panel-label">
          {admin ? t.portal.admin : t.portal.entrepreneur}
        </div>
        <nav>
          {nav.map(([to, Icon, label]) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? t.labels?.[label] || label : undefined}
              end={to === (admin ? "/admin" : "/portal")}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} />
              <span>{t.labels?.[label] || label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          className="sidebar-logout"
          title={collapsed ? t.portal.logout : undefined}
          onClick={signout}
        >
          <LogOut size={19} />
          <span>{t.portal.logout}</span>
        </button>
      </aside>
      <div className="portal-main">
        <SiteHeader
          portal
          onMenu={() => setOpen(true)}
          onSidebarToggle={toggleSidebar}
          sidebarCollapsed={collapsed}
        />
        <main id="main-content" tabIndex="-1">
          {children}
        </main>
      </div>
    </div>
  );
}
function StatCard({ icon: Icon, label, value, tone = "orange" }) {
  return (
    <Card className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </Card>
  );
}
function EntrepreneurDashboard() {
  const { t, session, language } = useApp();
  const sw = language === "sw";
  const profile = session.profile || {};
  const { data: sales } = useQuery({
    queryKey: ["entrepreneur-sales-dashboard"],
    queryFn: async () =>
      (await api.get("/entrepreneur/sales/dashboard")).data.data,
  });
  const { data: bookings } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: async () => (await api.get("/entrepreneur/bookings")).data.data,
  });
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () =>
      (await api.get("/entrepreneur/notifications")).data.data,
  });
  const filled = [
    "businessName",
    "businessType",
    "physicalAddress",
    "region",
    "district",
    "description",
    "tin",
    "website",
  ].filter((k) => profile[k]).length;
  const completion = Math.round((filled / 8) * 100);
  const pending = bookings?.reservations?.find((item) =>
    ["HELD", "PAYMENT_PENDING"].includes(item.status),
  );
  const paid = bookings?.reservations?.find((item) => item.status === "PAID");
  const tasks = [
    completion < 100 && {
      title: sw
        ? "Kamilisha wasifu wa biashara yako"
        : "Complete your business profile",
      detail: sw
        ? `Wasifu wako umekamilika kwa ${completion}%. Taarifa bora huisaidia SIDO kukuunganisha na huduma zinazofaa.`
        : `Your profile is ${completion}% complete. Better details help SIDO match services to your business.`,
      to: "/portal/profile",
      action: sw ? "Kamilisha wasifu" : "Complete profile",
    },
    pending && {
      title:
        pending.status === "HELD"
          ? sw
            ? "Kamilisha nafasi ya banda"
            : "Finish your booth checkout"
          : sw
            ? "Kamilisha malipo ya banda"
            : "Complete booth payment",
      detail: sw
        ? `Nafasi yako ya ${pending.event?.name || "tukio"} inasubiri hatua yako inayofuata.`
        : `Your ${pending.event?.name || "event"} reservation is waiting for your next action.`,
      to: `/portal/events/${pending.event?._id || pending.event}`,
      action: sw ? "Endelea na nafasi" : "Continue booking",
    },
    !pending &&
      !paid && {
        title: sw
          ? "Tafuta tukio na uweke nafasi ya banda"
          : "Find an event and book a booth",
        detail: sw
          ? "Tazama matukio ya SIDO yaliyochapishwa na linganisha maeneo ya mabanda yanayopatikana."
          : "Browse published SIDO events and compare available booth locations.",
        to: "/portal/events",
        action: sw ? "Tazama matukio" : "Browse events",
      },
    paid && {
      title: sw ? "Jiandae kwa tukio lako" : "Prepare for your event",
      detail: sw
        ? "Pakua ankara na pasi ya maandalizi kutoka nafasi iliyothibitishwa."
        : "Download your invoice and setup pass from the confirmed booking.",
      to: "/portal/bookings",
      action: sw ? "Fungua nafasi" : "Open booking",
    },
    paid && {
      title: sw
        ? "Ripoti mauzo ya kila siku ya tukio"
        : "Report daily event sales",
      detail: sw
        ? "Kuripoti mauzo huanza tarehe ya kuanza kwa tukio."
        : "Sales reporting opens on the event start date.",
      to: "/portal/sales",
      action: sw ? "Fungua mauzo" : "Open sales",
    },
    notifications?.unread && {
      title: sw ? "Soma arifa mpya" : "Read new notifications",
      detail: sw
        ? `Una arifa ${notifications.unread} ambazo hazijasomwa.`
        : `You have ${notifications.unread} unread update${notifications.unread === 1 ? "" : "s"}.`,
      to: "/portal/notifications",
      action: sw ? "Tazama arifa" : "View updates",
    },
  ].filter(Boolean);
  return (
    <PortalShell>
      <div className="page-head">
        <div>
          <h1>
            {t.portal.welcome}, {session.user.firstName}
          </h1>
          <p>
            {sw
              ? "Haya ndiyo yanayohitaji umakini wako katika mfumo wa SIDO."
              : "Here is what needs your attention in the SIDO portal."}
          </p>
        </div>
        <Button asChild>
          <Link to="/portal/events">
            <Map size={16} />
            {sw ? "Tazama matukio" : "Browse events"}
          </Link>
        </Button>
      </div>
      <Card className="next-actions">
        <div className="panel-heading">
          <div>
            <h2>{sw ? "Hatua zinazofuata" : "What to do next"}</h2>
            <p>
              {sw
                ? "Kazi zimepangwa kulingana na akaunti na nafasi zako."
                : "Tasks are ordered around your current account and bookings."}
            </p>
          </div>
          <Badge tone={tasks.length ? "orange" : "green"}>
            {tasks.length} task{tasks.length === 1 ? "" : "s"}
          </Badge>
        </div>
        {tasks.length ? (
          <div className="task-list">
            {tasks.map((task, index) => (
              <article key={task.title}>
                <span>{index + 1}</span>
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.detail}</p>
                </div>
                <Button
                  size="sm"
                  variant={index ? "outline" : "default"}
                  asChild
                >
                  <Link to={task.to}>
                    {task.action}
                    <ArrowRight size={14} />
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <CheckCircle2 />
            {sw ? "Umemaliza kila kitu kwa sasa." : "You are all caught up."}
          </div>
        )}
      </Card>
      <div className="stats four">
        <StatCard
          icon={CheckCircle2}
          label={t.portal.account}
          value={
            session.user.status === "active"
              ? sw
                ? "Hai"
                : "Active"
              : sw
                ? "Imesimamishwa"
                : "Suspended"
          }
          tone="green"
        />
        <StatCard
          icon={Store}
          label={t.portal.business}
          value={profile.businessType || (sw ? "Haijawekwa" : "Not set")}
        />
        <StatCard
          icon={BadgeCheck}
          label={t.portal.completion}
          value={`${completion}%`}
          tone="blue"
        />
        <StatCard
          icon={Banknote}
          label={
            sw ? "Mauzo ya biashara yaliyoripotiwa" : "Reported business sales"
          }
          value={formatSalesMoney(sales?.totalSalesMinor || 0)}
          tone="green"
        />
      </div>
      <div className="dashboard-grid">
        <Card className="dashboard-card">
          <h2>{sw ? "Mauzo kwa tukio" : "Sales by event"}</h2>
          <div className="profile-summary">
            {sales?.byEvent?.map((item) => (
              <div key={item.eventId}>
                <span>{item.eventName}</span>
                <strong>{formatSalesMoney(item.totalSalesMinor)}</strong>
              </div>
            ))}
            {!sales?.byEvent?.length && (
              <div className="empty">
                {sw
                  ? "Mauzo ya tukio yataonekana baada ya ripoti ya kwanza ya siku."
                  : "Your event sales will appear after the first daily report."}
              </div>
            )}
          </div>
        </Card>
        <Card className="dashboard-card">
          <h2>{sw ? "Utendaji wa banda" : "Booth performance"}</h2>
          <div className="profile-summary">
            {sales?.byBooth?.slice(0, 5).map((item) => (
              <div key={item.boothId}>
                <span>
                  {item.eventName} · Booth {item.boothCode}
                </span>
                <strong>{formatSalesMoney(item.totalSalesMinor)}</strong>
              </div>
            ))}
            {!sales?.byBooth?.length && (
              <div className="empty">
                {sw
                  ? "Bado hakuna mauzo ya banda yaliyoripotiwa."
                  : "No booth sales reported yet."}
              </div>
            )}
          </div>
        </Card>
      </div>
    </PortalShell>
  );
}

function Notifications() {
  const { t, language } = useApp();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () =>
      (await api.get("/entrepreneur/notifications")).data.data,
  });
  const mark = async (id) => {
    await api.patch("/entrepreneur/notifications/read", id ? { id } : {});
    await client.invalidateQueries({ queryKey: ["notifications"] });
  };
  return (
    <PortalShell>
      <div className="page-head">
        <div>
          <h1>{t.notify.title}</h1>
          <p>{t.notify.intro}</p>
        </div>
        {query.data?.unread > 0 && (
          <Button variant="outline" onClick={() => mark()}>
            {t.common.markAllRead}
          </Button>
        )}
      </div>
      <Card className="notification-center">
        {query.isLoading ? (
          <PageLoader />
        ) : query.data?.items.length ? (
          <div className="notification-list">
            {query.data.items.map((item) => (
              <article key={item._id} className={item.readAt ? "" : "unread"}>
                <span className="notification-icon">
                  <Bell />
                </span>
                <div>
                  <div>
                    <h2>
                      {language === "sw"
                        ? {
                            payment_pending: "Malipo yanahitajika",
                            booking_confirmed: "Nafasi imethibitishwa",
                            booking_refunded: "Nafasi imerejeshewa fedha",
                          }[item.type] || item.title
                        : item.title}
                    </h2>
                    {!item.readAt && <Badge>{t.notify.new}</Badge>}
                  </div>
                  <p>{item.body}</p>
                  <small>
                    {item.event?.name ? `${item.event.name} · ` : ""}
                    {new Date(item.createdAt).toLocaleString(
                      language === "sw" ? "sw-TZ" : "en-TZ",
                      { timeZone: "Africa/Dar_es_Salaam" },
                    )}
                  </small>
                </div>
                {!item.readAt && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => mark(item._id)}
                  >
                    {t.common.markRead}
                  </Button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <Bell />
            {t.notify.empty}
          </div>
        )}
      </Card>
    </PortalShell>
  );
}

function AdminRefunds() {
  const client = useQueryClient();
  const [status, setStatus] = useUrlState("status", "eligible"),
    [pageValue, setPage] = useUrlState("page", "1"),
    [selected, setSelected] = useState(null),
    [error, setError] = useState("");
  const page = Math.max(1, Number(pageValue) || 1);
  const query = useQuery({
    queryKey: ["admin-refunds", status, page],
    queryFn: async () =>
      (await api.get("/admin/refunds", { params: { status, page } })).data.data,
  });
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await api.post(
        `/admin/reservations/${selected.id}/refund`,
        Object.fromEntries(new FormData(event.currentTarget)),
      );
      setSelected(null);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["admin-refunds"] }),
        client.invalidateQueries({ queryKey: ["admin-operations"] }),
        client.invalidateQueries({ queryKey: ["admin-revenue"] }),
      ]);
      await sidoSuccess(
        "Refund recorded",
        "The booking was refunded and its booths are available again.",
      );
    } catch (requestError) {
      setError(messageOf(requestError));
    }
  };
  return (
    <PortalShell admin>
      <div className="page-head">
        <div>
          <h1>Refunds</h1>
          <p>
            Record provider-confirmed refunds with a reason and audit reference.
          </p>
        </div>
      </div>
      <Card className="table-card">
        <div className="security-tabs">
          <button
            className={status === "eligible" ? "active" : ""}
            onClick={() => {
              setStatus("eligible");
              setPage(1);
            }}
          >
            Eligible paid bookings
          </button>
          <button
            className={status === "refunded" ? "active" : ""}
            onClick={() => {
              setStatus("refunded");
              setPage(1);
            }}
          >
            Refund history
          </button>
        </div>
        {query.isLoading ? (
          <PageLoader />
        ) : (
          <>
            <div className="table-wrap mobile-record-table">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Entrepreneur</th>
                    <th>Event / booths</th>
                    <th>Amount</th>
                    <th>
                      {status === "eligible" ? "Action" : "Refund record"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {query.data?.items.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Order">
                        <strong>{item.order?.number}</strong>
                        <span>{item.payment?.controlNumber}</span>
                      </td>
                      <td data-label="Entrepreneur">
                        <strong>
                          {item.user?.firstName} {item.user?.lastName}
                        </strong>
                        <span>{item.user?.email}</span>
                      </td>
                      <td data-label="Event / booths">
                        <strong>{item.event?.name}</strong>
                        <span>
                          {item.booths?.map((booth) => booth.code).join(", ")}
                        </span>
                      </td>
                      <td data-label="Amount">
                        <strong>
                          {formatSalesMoney(item.order?.totalMinor)}
                        </strong>
                      </td>
                      <td
                        data-label={
                          status === "eligible" ? "Action" : "Refund record"
                        }
                      >
                        {status === "eligible" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelected(item)}
                          >
                            Record refund
                          </Button>
                        ) : (
                          <>
                            <strong>{item.refund?.reference}</strong>
                            <span>{item.refund?.reason}</span>
                            <span>
                              {item.refund?.refundedAt &&
                                new Date(
                                  item.refund.refundedAt,
                                ).toLocaleString()}
                            </span>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!query.data?.items.length && (
                    <tr>
                      <td colSpan="5" className="empty-table">
                        No{" "}
                        {status === "eligible"
                          ? "eligible paid bookings"
                          : "recorded refunds"}
                        .
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>{query.data?.total || 0} records</span>
              <div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  Previous
                </Button>
                <span>
                  Page {page} of {query.data?.pages || 1}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= (query.data?.pages || 1)}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        {selected && (
          <DialogContent>
            <DialogTitle>Record confirmed refund</DialogTitle>
            <p className="muted">
              This releases{" "}
              {selected.booths
                ?.map((booth) => `Booth ${booth.code}`)
                .join(", ")}{" "}
              and notifies the entrepreneur. Confirm the refund with the payment
              provider before continuing.
            </p>
            {error && <Alert>{error}</Alert>}
            <form className="auth-form" onSubmit={submit}>
              <Field label="Provider refund reference">
                <Input name="refundReference" required />
              </Field>
              <Field label="Refund reason">
                <Textarea
                  name="reason"
                  minLength="5"
                  maxLength="500"
                  required
                />
              </Field>
              <Button variant="danger">Record refund and release booths</Button>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </PortalShell>
  );
}

const profileFields = [
  "firstName",
  "lastName",
  "phoneNumber",
  "businessName",
  "businessType",
  "physicalAddress",
  "region",
  "district",
  "tin",
  "website",
  "description",
];
function Profile() {
  const { session, refresh, language } = useApp();
  const sw = language === "sw";
  const fieldLabels = {
    firstName: sw ? "Jina la kwanza" : "First name",
    lastName: sw ? "Jina la mwisho" : "Last name",
    phoneNumber: sw ? "Namba ya simu" : "Phone number",
    businessName: sw ? "Jina la biashara" : "Business name",
    businessType: sw ? "Sekta ya biashara" : "Business type",
    physicalAddress: sw ? "Anwani ya biashara" : "Physical address",
    region: sw ? "Mkoa" : "Region",
    district: sw ? "Wilaya" : "District",
    tin: "TIN",
    website: sw ? "Tovuti" : "Website",
    description: sw ? "Maelezo ya biashara" : "Description",
  };
  const initial = { ...session.user, ...session.profile };
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const values = Object.fromEntries(new FormData(e.currentTarget));
      await api.patch("/entrepreneur/profile", values);
      await refresh();
      setSuccess(
        sw
          ? "Wasifu umesasishwa kwa mafanikio"
          : "Profile updated successfully",
      );
    } catch (err) {
      setError(messageOf(err));
    }
  };
  return (
    <PortalShell>
      <div className="page-head">
        <div>
          <h1>
            {sw
              ? "Wasifu binafsi na wa biashara"
              : "Personal & business profile"}
          </h1>
          <p>
            {sw
              ? "Simamia taarifa zinazohusishwa na akaunti yako ya SIDO."
              : "Manage the information attached to your SIDO account."}
          </p>
        </div>
      </div>
      <Card className="form-card">
        {error && <Alert>{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}
        <form onSubmit={submit}>
          <div className="form-grid">
            {profileFields.map((key) => (
              <Field key={key} label={fieldLabels[key]}>
                {key === "description" || key === "physicalAddress" ? (
                  <Textarea name={key} defaultValue={initial[key] || ""} />
                ) : (
                  <Input name={key} defaultValue={initial[key] || ""} />
                )}
              </Field>
            ))}
          </div>
          <Button>{sw ? "Hifadhi mabadiliko" : "Save changes"}</Button>
        </form>
      </Card>
    </PortalShell>
  );
}
function SettingsPage({ admin = false }) {
  const { theme, setTheme, language, setLanguage } = useApp();
  const [message, setMessage] = useState("");
  const sw = language === "sw";
  const change = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        "/entrepreneur/change-password",
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      setMessage(
        sw
          ? "Nenosiri limebadilishwa kwa mafanikio"
          : "Password changed successfully",
      );
      e.currentTarget.reset();
    } catch (err) {
      setMessage(messageOf(err));
    }
  };
  return (
    <PortalShell admin={admin}>
      <div className="page-head">
        <div>
          <h1>{sw ? "Mipangilio" : "Settings"}</h1>
          <p>
            {sw
              ? "Chagua mapendeleo ya mfumo na mipangilio ya usalama."
              : "Choose your portal preferences and security settings."}
          </p>
        </div>
      </div>
      <div className="dashboard-grid">
        <Card className="form-card">
          <h2>{sw ? "Muonekano na lugha" : "Appearance & language"}</h2>
          <div className="setting-row">
            <span>{sw ? "Mandhari ya rangi" : "Color theme"}</span>
            <Button
              variant="outline"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light"
                ? sw
                  ? "Nyeupe"
                  : "Light"
                : sw
                  ? "Nyeusi"
                  : "Dark"}
            </Button>
          </div>
          <div className="setting-row">
            <span>{sw ? "Lugha ya mfumo" : "Portal language"}</span>
            <Button
              variant="outline"
              onClick={() => setLanguage(language === "en" ? "sw" : "en")}
            >
              {language === "en" ? "English" : "Kiswahili"}
            </Button>
          </div>
        </Card>
        {admin ? (
          <Card className="form-card">
            <h2>Security administration</h2>
            <p className="muted">
              Manage privileged access, review active sessions, and investigate
              audit events.
            </p>
            <div className="setting-links">
              <Button asChild>
                <Link to="/admin/staff">Manage staff access</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/sessions">Review sessions</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/system-logs">Open system logs</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="form-card">
            <h2>{sw ? "Badili nenosiri" : "Change password"}</h2>
            {message && (
              <Alert type={message.includes("success") ? "success" : "error"}>
                {message}
              </Alert>
            )}
            <form className="auth-form" onSubmit={change}>
              <Field label={sw ? "Nenosiri la sasa" : "Current password"}>
                <Input name="currentPassword" type="password" required />
              </Field>
              <Field label={sw ? "Nenosiri jipya" : "New password"}>
                <Input name="password" type="password" required />
              </Field>
              <Button>{sw ? "Badili nenosiri" : "Change password"}</Button>
            </form>
          </Card>
        )}
      </div>
    </PortalShell>
  );
}

function AdminDashboard() {
  const { t, session } = useApp();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/admin/stats")).data.data,
  });
  const { data: operations } = useQuery({
    queryKey: ["admin-operations"],
    queryFn: async () => (await api.get("/admin/operations")).data.data,
    refetchInterval: 60000,
  });
  if (isLoading)
    return (
      <PortalShell admin>
        <PageLoader />
      </PortalShell>
    );
  const chart = data.byRegion || [];
  const work = [
    operations?.paymentExceptions && {
      title: "Payment exceptions",
      count: operations.paymentExceptions,
      to: "/admin/revenue",
      detail: "Payments require reconciliation.",
    },
    operations?.failedPayments && {
      title: "Failed payments",
      count: operations.failedPayments,
      to: "/admin/revenue",
      detail: "Review failed booking transactions.",
    },
    operations?.expiringReservations && {
      title: "Expiring reservations",
      count: operations.expiringReservations,
      to: "/admin/events",
      detail: "Holds expire within 24 hours.",
    },
    operations?.feedbackWaiting && {
      title: "Feedback awaiting action",
      count: operations.feedbackWaiting,
      to: "/admin/feedback",
      detail: "Assign, respond to, or resolve these cases.",
    },
    operations?.draftEvents && {
      title: "Draft events",
      count: operations.draftEvents,
      to: "/admin/events",
      detail: "Complete setup and publication checks.",
    },
  ].filter(Boolean);
  return (
    <PortalShell admin>
      <div className="page-head">
        <div>
          <h1>
            {t.portal.welcome}, {session.user.firstName}
          </h1>
          <p>Start with operational exceptions, then monitor account health.</p>
        </div>
        <Button asChild>
          <Link to="/admin/events">Manage events</Link>
        </Button>
      </div>
      <Card className="next-actions operations-queue">
        <div className="panel-heading">
          <div>
            <h2>Operations requiring attention</h2>
            <p>Live payment, reservation, feedback, and publication work.</p>
          </div>
          <Badge tone={operations?.totalAttention ? "orange" : "green"}>
            {operations?.totalAttention || 0} urgent
          </Badge>
        </div>
        {work.length ? (
          <div className="task-list">
            {work.map((item, index) => (
              <article key={item.title}>
                <span>{item.count}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
                <Button
                  size="sm"
                  variant={index ? "outline" : "default"}
                  asChild
                >
                  <Link to={item.to}>
                    Review
                    <ArrowRight size={14} />
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <CheckCircle2 />
            No operational exceptions need attention.
          </div>
        )}
      </Card>
      <div className="stats four">
        <StatCard icon={Users} label={t.portal.registered} value={data.total} />
        <StatCard
          icon={CheckCircle2}
          label={t.portal.active}
          value={data.active}
          tone="green"
        />
        <StatCard
          icon={ShieldCheck}
          label={t.portal.suspended}
          value={data.suspended}
          tone="red"
        />
        <StatCard
          icon={Trash2}
          label={t.portal.deleted}
          value={data.deleted}
          tone="blue"
        />
      </div>
      <Card className="funnel-card">
        <div className="panel-heading">
          <div>
            <h2>Entrepreneur journey funnel</h2>
            <p>
              Registration through verified participation and sales reporting.
            </p>
          </div>
        </div>
        <div className="funnel-steps">
          {[
            ["Registered", data.funnel?.registered],
            ["Email verified", data.funnel?.verified],
            ["Paid booking", data.funnel?.booked],
            ["Reporting sales", data.funnel?.reportingSales],
          ].map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value || 0}</strong>
              <i
                style={{
                  width: `${data.funnel?.registered ? Math.max(4, ((value || 0) / data.funnel.registered) * 100) : 0}%`,
                }}
              />
            </div>
          ))}
        </div>
      </Card>
      <Card className="dashboard-card chart-card">
        <h2>Entrepreneurs by region</h2>
        <p className="sr-only">
          {chart
            .map((item) => `${item.name}: ${item.value} entrepreneurs`)
            .join("; ")}
        </p>
        {chart.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#f58220" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty">
            Regional data will appear as entrepreneurs register.
          </div>
        )}
      </Card>
    </PortalShell>
  );
}

function EntrepreneurDialog({ item, onSaved }) {
  const editing = Boolean(item);
  const [error, setError] = useState("");
  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const values = Object.fromEntries(new FormData(e.currentTarget));
      if (editing)
        await api.patch(`/admin/entrepreneurs/${item.user.id}`, values);
      else await api.post("/admin/entrepreneurs", values);
      onSaved();
    } catch (err) {
      setError(messageOf(err));
    }
  };
  const initial = editing ? { ...item.user, ...item.profile } : {};
  return (
    <DialogContent>
      <DialogTitle>
        {editing ? "Edit entrepreneur" : "Add entrepreneur"}
      </DialogTitle>
      {error && <Alert>{error}</Alert>}
      <form className="auth-form" onSubmit={save}>
        <div className="form-grid">
          {[
            "firstName",
            "lastName",
            "email",
            "phoneNumber",
            "businessName",
            "businessType",
            "region",
            "district",
            "physicalAddress",
          ].map((k) => (
            <Field key={k} label={k.replace(/([A-Z])/g, " $1")}>
              <Input
                name={k}
                defaultValue={initial[k] || ""}
                disabled={editing && k === "email"}
                required
              />
            </Field>
          ))}
          {!editing && (
            <Field label="Temporary password">
              <Input
                name="password"
                type="password"
                defaultValue="Welcome123!"
                required
              />
            </Field>
          )}
          {editing && (
            <Field label="Status">
              <select name="status" defaultValue={initial.status}>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </Field>
          )}
        </div>
        <Button>Save entrepreneur</Button>
      </form>
    </DialogContent>
  );
}
function AdminEntrepreneurs() {
  const client = useQueryClient();
  const [search, setSearch] = useUrlState("q");
  const [status, setStatus] = useUrlState("status");
  const [deletedValue, setDeletedValue] = useUrlState("archive");
  const [pageValue, setPage] = useUrlState("page", "1");
  const deleted = deletedValue === "true";
  const page = Math.max(1, Number(pageValue) || 1);
  const [selected, setSelected] = useState(null);
  const [dialog, setDialog] = useState(false);
  const deferredSearch = useDebouncedValue(search);
  const query = useQuery({
    queryKey: ["entrepreneurs", deferredSearch, status, deleted, page],
    queryFn: async () =>
      (
        await api.get("/admin/entrepreneurs", {
          params: { search: deferredSearch, status, deleted, page },
        })
      ).data.data,
  });
  const refresh = () => {
    setDialog(false);
    setSelected(null);
    client.invalidateQueries({ queryKey: ["entrepreneurs"] });
    client.invalidateQueries({ queryKey: ["admin-stats"] });
  };
  const remove = async (id) => {
    const restoring = deleted,
      confirmed = await sidoConfirm({
        title: restoring ? "Restore entrepreneur?" : "Archive entrepreneur?",
        text: restoring
          ? "This entrepreneur will regain access to their account."
          : "The entrepreneur will be moved to the archive and lose portal access.",
        confirmText: restoring ? "Restore" : "Move to archive",
        danger: !restoring,
      });
    if (!confirmed) return;
    try {
      restoring
        ? await api.post(`/admin/entrepreneurs/${id}/restore`)
        : await api.delete(`/admin/entrepreneurs/${id}`);
      refresh();
      await sidoSuccess(
        restoring ? "Entrepreneur restored" : "Entrepreneur archived",
        restoring
          ? "The account is active again."
          : "The account was moved to the archive.",
      );
    } catch (error) {
      await sidoError("Unable to update entrepreneur", messageOf(error));
    }
  };
  return (
    <PortalShell admin>
      <div className="page-head">
        <div>
          <h1>Entrepreneurs</h1>
          <p>Search, review and manage SIDO entrepreneur accounts.</p>
        </div>
        <Dialog open={dialog} onOpenChange={setDialog}>
          <Button
            onClick={() => {
              setSelected(null);
              setDialog(true);
            }}
          >
            Add entrepreneur
          </Button>
          {dialog && <EntrepreneurDialog item={selected} onSaved={refresh} />}
        </Dialog>
      </div>
      <Card className="table-card">
        <div className="filters">
          <div>
            <Search size={17} />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name or email"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <Button
            variant={deleted ? "default" : "outline"}
            onClick={() => setDeletedValue(deleted ? "" : "true")}
          >
            <Trash2 size={16} />
            {deleted ? "Viewing archive" : "View archive"}
          </Button>
        </div>
        {query.isLoading ? (
          <PageLoader />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Entrepreneur</th>
                    <th>Business</th>
                    <th>Region</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data?.items.map((item) => (
                    <tr key={item.user.id}>
                      <td>
                        <strong>
                          {item.user.firstName} {item.user.lastName}
                        </strong>
                        <span>{item.user.email}</span>
                      </td>
                      <td>
                        {item.profile?.businessName || "—"}
                        <span>{item.profile?.businessType}</span>
                      </td>
                      <td>{item.profile?.region || "—"}</td>
                      <td>
                        <Badge
                          tone={item.user.status === "active" ? "green" : "red"}
                        >
                          {item.user.status}
                        </Badge>
                      </td>
                      <td>
                        <TableActions label="Entrepreneur actions">
                          <TableAction
                            onSelect={() => {
                              setSelected(item);
                              setDialog(true);
                            }}
                          >
                            <Pencil />
                            Edit
                          </TableAction>
                          <TableAction
                            danger={!deleted}
                            onSelect={() => remove(item.user.id)}
                          >
                            {deleted ? <CheckCircle2 /> : <Trash2 />}
                            {deleted ? "Restore" : "Archive"}
                          </TableAction>
                        </TableActions>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!query.data?.items.length && (
                <div className="empty">No entrepreneurs found.</div>
              )}
            </div>
            <div className="pagination">
              <span>{query.data?.total || 0} records</span>
              <div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span>
                  Page {page} of {query.data?.pages || 1}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= (query.data?.pages || 1)}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </PortalShell>
  );
}

function AdminEntrepreneursWithSales() {
  const [search, setSearch] = useUrlState("q");
  const [pageValue, setPageValue] = useUrlState("page", "1");
  const page = Math.max(1, Number(pageValue) || 1);
  const setPage = (value) => setPageValue(String(value));
  const [selected, setSelected] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [busy, setBusy] = useState(false);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["entrepreneurs-sales", search, page],
    queryFn: async () =>
      (await api.get("/admin/entrepreneurs", { params: { search, page } })).data
        .data,
  });
  const items = query.data?.items || [];
  const visibleIds = items.map((item) => item.user.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
  const runBulkAction = async () => {
    if (!bulkAction || !selected.length) return;
    const approved = await sidoConfirm({
      title: `${bulkAction[0].toUpperCase()}${bulkAction.slice(1)} ${selected.length} account${selected.length === 1 ? "" : "s"}?`,
      text:
        bulkAction === "suspend" || bulkAction === "archive"
          ? "Affected entrepreneurs will be signed out of active sessions."
          : "This updates every selected entrepreneur account.",
      confirmButtonText: "Apply action",
    });
    if (!approved) return;
    setBusy(true);
    try {
      const { data } = await api.post("/admin/entrepreneurs/bulk", {
        ids: selected,
        action: bulkAction,
      });
      sidoSuccess(data.message || "Accounts updated");
      setSelected([]);
      setBulkAction("");
      await client.invalidateQueries({ queryKey: ["entrepreneurs-sales"] });
    } catch (error) {
      sidoError(messageOf(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <PortalShell admin>
      <div className="page-head">
        <div>
          <h1>Entrepreneurs</h1>
          <p>
            Review entrepreneur accounts and their self-reported event sales.
          </p>
        </div>
      </div>
      <Card className="table-card">
        <div className="filters">
          <div>
            <Search size={17} />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search name or email"
            />
          </div>
          <div className="bulk-actions" aria-label="Bulk account actions">
            <select
              aria-label="Bulk action"
              value={bulkAction}
              onChange={(event) => setBulkAction(event.target.value)}
            >
              <option value="">Choose action</option>
              <option value="activate">Activate</option>
              <option value="suspend">Suspend</option>
              <option value="archive">Archive</option>
              <option value="restore">Restore</option>
            </select>
            <Button
              size="sm"
              disabled={!selected.length || !bulkAction || busy}
              onClick={runBulkAction}
            >
              {busy
                ? "Applying…"
                : `Apply${selected.length ? ` (${selected.length})` : ""}`}
            </Button>
          </div>
        </div>
        {query.isLoading ? (
          <PageLoader />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all entrepreneurs on this page"
                        checked={allVisibleSelected}
                        onChange={(event) =>
                          setSelected((current) =>
                            event.target.checked
                              ? [...new Set([...current, ...visibleIds])]
                              : current.filter(
                                  (id) => !visibleIds.includes(id),
                                ),
                          )
                        }
                      />
                    </th>
                    <th>Entrepreneur</th>
                    <th>Business</th>
                    <th>Region</th>
                    <th>Reported sales</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data?.items.map((item) => (
                    <tr key={item.user.id}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select ${item.user.firstName} ${item.user.lastName}`}
                          checked={selected.includes(item.user.id)}
                          onChange={(event) =>
                            setSelected((current) =>
                              event.target.checked
                                ? [...current, item.user.id]
                                : current.filter((id) => id !== item.user.id),
                            )
                          }
                        />
                      </td>
                      <td>
                        <strong>
                          {item.user.firstName} {item.user.lastName}
                        </strong>
                        <span>{item.user.email}</span>
                      </td>
                      <td>
                        <strong>{item.profile?.businessName || "—"}</strong>
                        <span>{item.profile?.businessType}</span>
                      </td>
                      <td>{item.profile?.region || "—"}</td>
                      <td>
                        <strong>
                          {formatSalesMoney(item.reportedSalesMinor)}
                        </strong>
                        <span>{item.reportedDays} booth-day reports</span>
                      </td>
                      <td>
                        <Badge
                          tone={item.user.status === "active" ? "green" : "red"}
                        >
                          {item.user.status}
                        </Badge>
                      </td>
                      <td>
                        <TableActions label="Entrepreneur sales actions">
                          <TableAction asChild>
                            <Link to={`/admin/entrepreneurs/${item.user.id}`}>
                              <Eye />
                              View sales
                            </Link>
                          </TableAction>
                        </TableActions>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>{query.data?.total || 0} records</span>
              <div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span>
                  Page {page} of {query.data?.pages || 1}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= (query.data?.pages || 1)}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </PortalShell>
  );
}

function StaffDialog({ item, onSaved }) {
  const { session } = useApp();
  const [error, setError] = useState("");
  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const values = Object.fromEntries(new FormData(e.currentTarget));
      item
        ? await api.patch(`/admin/staff/${item.id}`, values)
        : await api.post("/admin/staff", values);
      onSaved();
    } catch (x) {
      setError(messageOf(x));
    }
  };
  return (
    <DialogContent>
      <DialogTitle>
        {item ? "Edit staff account" : "Add staff account"}
      </DialogTitle>
      {error && <Alert>{error}</Alert>}
      <form className="auth-form" onSubmit={save}>
        <div className="form-grid">
          <Field label="First name">
            <Input
              name="firstName"
              defaultValue={item?.firstName || ""}
              required
            />
          </Field>
          <Field label="Last name">
            <Input
              name="lastName"
              defaultValue={item?.lastName || ""}
              required
            />
          </Field>
          <Field label="Email">
            <Input
              name="email"
              type="email"
              defaultValue={item?.email || ""}
              disabled={Boolean(item)}
              required
            />
          </Field>
          <Field label="Phone number">
            <Input
              name="phoneNumber"
              defaultValue={item?.phoneNumber || ""}
              required
            />
          </Field>
          <Field label="Role">
            <select name="role" defaultValue={item?.role || "manager"}>
              <option value="manager">Manager</option>
              {session.user.role === "superadmin" && (
                <option value="admin">Admin</option>
              )}
            </select>
          </Field>
          {item ? (
            <Field label="Status">
              <select name="status" defaultValue={item.status}>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </Field>
          ) : (
            <Field label="Temporary password">
              <PasswordInput
                name="password"
                defaultValue="Welcome123!"
                required
              />
            </Field>
          )}
        </div>
        <Button>Save staff account</Button>
      </form>
    </DialogContent>
  );
}

function StaffManagement() {
  const client = useQueryClient();
  const [search, setSearch] = useState(""),
    [role, setRole] = useState(""),
    [status, setStatus] = useState(""),
    [archived, setArchived] = useState(false),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState(null),
    [dialog, setDialog] = useState(false);
  const query = useQuery({
    queryKey: ["staff", search, role, status, archived, page],
    queryFn: async () =>
      (
        await api.get("/admin/staff", {
          params: { search, role, status, archived, page },
        })
      ).data.data,
  });
  const refresh = () => {
    setDialog(false);
    setSelected(null);
    client.invalidateQueries({ queryKey: ["staff"] });
  };
  const archive = async (item) => {
    if (archived) await api.post(`/admin/staff/${item.id}/restore`);
    else if (
      await sidoConfirm({
        title: "Archive staff account?",
        text: `${item.firstName} will immediately lose access.`,
        confirmText: "Archive",
        danger: true,
      })
    )
      await api.delete(`/admin/staff/${item.id}`);
    refresh();
  };
  return (
    <PortalShell admin>
      <div className="page-head">
        <div>
          <h1>Staff Management</h1>
          <p>Create and manage subordinate administrative accounts.</p>
        </div>
        <Dialog open={dialog} onOpenChange={setDialog}>
          <Button
            onClick={() => {
              setSelected(null);
              setDialog(true);
            }}
          >
            <UserCog size={16} />
            Add staff
          </Button>
          {dialog && <StaffDialog item={selected} onSaved={refresh} />}
        </Dialog>
      </div>
      <Card className="table-card">
        <div className="filters">
          <div>
            <Search size={17} />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search staff"
            />
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="manager">Managers</option>
            <option value="admin">Admins</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <Button
            variant={archived ? "default" : "outline"}
            onClick={() => setArchived(!archived)}
          >
            <Trash2 size={16} />
            {archived ? "Viewing archive" : "View archive"}
          </Button>
        </div>
        {query.isLoading ? (
          <PageLoader />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Staff member</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data?.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>
                          {item.firstName} {item.lastName}
                        </strong>
                        <span>{item.email}</span>
                        <span>{item.phoneNumber}</span>
                      </td>
                      <td>
                        <Badge tone={item.role === "admin" ? "blue" : "orange"}>
                          {item.role}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          tone={item.status === "active" ? "green" : "red"}
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>
                        <TableActions label="Staff actions">
                          {!archived && (
                            <TableAction
                              onSelect={() => {
                                setSelected(item);
                                setDialog(true);
                              }}
                            >
                              <Pencil />
                              Edit
                            </TableAction>
                          )}
                          <TableAction
                            danger={!archived}
                            onSelect={() => archive(item)}
                          >
                            {archived ? <CheckCircle2 /> : <Trash2 />}
                            {archived ? "Restore" : "Archive"}
                          </TableAction>
                        </TableActions>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!query.data?.items.length && (
                <div className="empty">No staff accounts found.</div>
              )}
            </div>
            <div className="pagination">
              <span>{query.data?.total || 0} records</span>
              <div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span>
                  Page {page} of {query.data?.pages || 1}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= (query.data?.pages || 1)}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </PortalShell>
  );
}

const durationLabel = (seconds) => {
  const hours = Math.floor(seconds / 3600),
    minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};
const chartDateTime = (value) =>
  new Date(Number(value)).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
function SessionTimelineChart({ rows = [], loading }) {
  if (loading) return <PageLoader />;
  if (!rows.length)
    return <div className="empty">No session timeline data.</div>;
  const now = Date.now();
  const data = rows
    .map((row, index) => {
      const start = new Date(row.startedAt).getTime(),
        last = new Date(row.lastSeenAt || row.startedAt).getTime(),
        end = row.endedAt
          ? new Date(row.endedAt).getTime()
          : row.isOnline
            ? now
            : last;
      return {
        ...row,
        range: [start, Math.max(start, end)],
        chartRow: String(index + 1),
        userLabel: row.user
          ? `${row.user.firstName} ${row.user.lastName}`
          : "Deleted user",
      };
    })
    .reverse();
  const values = data.flatMap((row) => row.range),
    domain = [Math.min(...values), Math.max(...values) + 1000],
    height = Math.max(190, Math.min(420, data.length * 34));
  return (
    <>
      <div className="chart-legend">
        <span>
          <i className="online" />
          Online
        </span>
        <span>
          <i />
          Ended / historical
        </span>
      </div>
      <div className="session-chart">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 18, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              domain={domain}
              tickFormatter={chartDateTime}
              scale="time"
              tick={{ fontSize: 10 }}
            />
            <YAxis type="category" dataKey="chartRow" hide />
            <Tooltip
              cursor={{ fill: "rgba(245,130,32,.06)" }}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.userLabel || "Session"
              }
              formatter={(value, _name, item) => [
                Array.isArray(value)
                  ? `${chartDateTime(value[0])} – ${chartDateTime(value[1])}`
                  : value,
                `${item?.payload?.user?.role || "user"} · ${durationLabel(item?.payload?.durationSeconds || 0)}`,
              ]}
            />
            <Bar dataKey="range" radius={8} barSize={12}>
              {data.map((row) => (
                <Cell
                  key={row.sessionId}
                  fill={row.isOnline ? "#16a36a" : "#f58220"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

const heatDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  heatHours = Array.from({ length: 24 }, (_, hour) => hour);
const heatColor = (count, max) => {
  if (!count) return "hsl(var(--muted))";
  const strength = max ? Math.min(1, count / max) : 0;
  return `color-mix(in srgb, var(--orange) ${Math.round(24 + strength * 76)}%, hsl(var(--card)))`;
};
function ActivityHeatmap({ rows = [], loading }) {
  if (loading) return <PageLoader />;
  const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const row of rows) {
    const day = (new Date(`${row.date}T12:00:00`).getDay() + 6) % 7;
    matrix[day][Number(row.hour) || 0] += Number(row.count) || 0;
  }
  const max = Math.max(0, ...matrix.flat());
  return (
    <div className="activity-heatmap-wrap">
      <div
        className="activity-heatmap-grid"
        role="grid"
        aria-label="Activity by weekday and hour"
      >
        <span className="heat-corner" />
        {heatHours.map((hour) => (
          <span className="heat-hour" key={hour}>
            {hour % 4 === 0 ? hour : ""}
          </span>
        ))}
        {heatDays.flatMap((day, dayIndex) => [
          <strong className="heat-day" key={`${day}-label`}>
            {day}
          </strong>,
          ...heatHours.map((hour) => {
            const count = matrix[dayIndex][hour];
            return (
              <i
                className="heat-cell"
                role="gridcell"
                key={`${day}-${hour}`}
                title={`${day} ${String(hour).padStart(2, "0")}:00 — ${count} event${count === 1 ? "" : "s"}`}
                style={{ backgroundColor: heatColor(count, max) }}
              />
            );
          }),
        ])}
      </div>
      <div className="heatmap-scale">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((level) => (
          <i
            key={level}
            style={{ backgroundColor: heatColor(level * max, max) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
function SessionManagement() {
  const client = useQueryClient();
  const [tab, setTab] = useUrlState("status", "online"),
    [search, setSearch] = useUrlState("q"),
    [from, setFrom] = useUrlState("from"),
    [to, setTo] = useUrlState("to"),
    [pageValue, setPage] = useUrlState("page", "1");
  const page = Math.max(1, Number(pageValue) || 1),
    deferredSearch = useDebouncedValue(search);
  const query = useQuery({
    queryKey: ["sessions", tab, deferredSearch, from, to, page],
    queryFn: async () =>
      (
        await api.get("/admin/sessions", {
          params: { status: tab, search: deferredSearch, from, to, page },
        })
      ).data.data,
    refetchInterval: tab === "online" ? 30000 : false,
  });
  const timeline = useQuery({
    queryKey: ["session-timeline", deferredSearch, from, to],
    queryFn: async () =>
      (
        await api.get("/admin/sessions/timeline", {
          params: { search: deferredSearch, from, to },
        })
      ).data.data,
  });
  const revoke = async (row) => {
    if (
      !(await sidoConfirm({
        title: "Revoke this session?",
        text: "The user will be signed out immediately.",
        confirmText: "Revoke",
        danger: true,
      }))
    )
      return;
    await api.post(`/admin/sessions/${row.sessionId}/revoke`);
    client.invalidateQueries({ queryKey: ["sessions"] });
    client.invalidateQueries({ queryKey: ["session-timeline"] });
  };
  return (
    <PortalShell admin>
      <div className="page-head">
        <div>
          <h1>Session Management</h1>
          <p>Monitor online users and historical login sessions.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            query.refetch();
            timeline.refetch();
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>
      <Card className="session-timeline">
        <h2>Sessions Timeline</h2>
        <SessionTimelineChart
          rows={timeline.data}
          loading={timeline.isLoading}
        />
      </Card>
      <Card className="table-card">
        <div className="security-tabs">
          <button
            className={tab === "online" ? "active" : ""}
            onClick={() => {
              setTab("online");
              setPage(1);
            }}
          >
            Online
          </button>
          <button
            className={tab === "history" ? "active" : ""}
            onClick={() => {
              setTab("history");
              setPage(1);
            }}
          >
            History
          </button>
        </div>
        <div className="filters">
          <div>
            <Search size={17} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email"
            />
          </div>
          {tab === "history" && (
            <>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </>
          )}
        </div>
        {query.isLoading ? (
          <PageLoader />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>IP / device</th>
                    <th>Started</th>
                    <th>Last seen</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data?.items.map((row) => (
                    <tr key={row.sessionId}>
                      <td>
                        <strong>
                          {row.user
                            ? `${row.user.firstName} ${row.user.lastName}`
                            : "Deleted user"}
                        </strong>
                        <span>{row.user?.email}</span>
                        <span>{row.user?.role}</span>
                      </td>
                      <td>
                        <strong>{row.ipAddress}</strong>
                        <span className="device-agent">{row.userAgent}</span>
                      </td>
                      <td>{new Date(row.startedAt).toLocaleString()}</td>
                      <td>{new Date(row.lastSeenAt).toLocaleString()}</td>
                      <td>{durationLabel(row.durationSeconds)}</td>
                      <td>
                        <Badge tone={row.isOnline ? "green" : "orange"}>
                          {row.isOnline ? "Online" : row.endReason || "Ended"}
                        </Badge>
                      </td>
                      <td>
                        <TableActions label="Session actions">
                          <TableAction
                            danger
                            disabled={!row.isActive}
                            onSelect={() => revoke(row)}
                          >
                            <LogOut />
                            Revoke
                          </TableAction>
                        </TableActions>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!query.data?.items.length && (
                <div className="empty">No sessions found.</div>
              )}
            </div>
          </>
        )}
      </Card>
    </PortalShell>
  );
}

function SystemLogs() {
  const [search, setSearch] = useUrlState("q"),
    [type, setType] = useUrlState("type"),
    [severity, setSeverity] = useUrlState("severity"),
    [category, setCategory] = useUrlState("category"),
    [from, setFrom] = useUrlState("from"),
    [to, setTo] = useUrlState("to"),
    [pageValue, setPage] = useUrlState("page", "1"),
    [selected, setSelected] = useState(null);
  const page = Math.max(1, Number(pageValue) || 1);
  const deferredSearch = useDebouncedValue(search);
  const params = {
    search: deferredSearch,
    type,
    severity,
    category,
    from,
    to,
    page,
  };
  const logs = useQuery({
    queryKey: ["system-logs", params],
    queryFn: async () => (await api.get("/system-logs", { params })).data.data,
  });
  const stats = useQuery({
    queryKey: ["system-log-stats", type, severity, category, from, to],
    queryFn: async () =>
      (await api.get("/system-logs/stats", { params })).data.data,
  });
  const heatmap = useQuery({
    queryKey: ["system-log-heatmap", type, severity, category, from, to],
    queryFn: async () =>
      (await api.get("/system-logs/activity-heatmap", { params })).data.data,
  });
  const exportCsv = async () => {
    const data = (
      await api.get("/system-logs", {
        params: { ...params, page: 1, limit: 50000 },
      })
    ).data.data.items;
    const cell = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const csv = [
      [
        "Time",
        "Type",
        "Severity",
        "Action",
        "Category",
        "Actor",
        "Message",
        "IP",
      ],
      ...data.map((x) => [
        x.createdAt,
        x.type,
        x.severity,
        x.action,
        x.actionCategory,
        x.user?.email || "",
        x.message,
        x.ipAddress,
      ]),
    ]
      .map((row) => row.map(cell).join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `sido-system-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <PortalShell admin>
      <div className="page-head">
        <div>
          <h1>System Logs</h1>
          <p>
            Audit system activity, administrative actions, and security events.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download size={16} />
          Export CSV
        </Button>
      </div>
      <div className="stats four">
        <StatCard
          icon={ListTree}
          label="Total logs"
          value={stats.data?.total || 0}
        />
        <StatCard
          icon={Activity}
          label="Today's activity"
          value={stats.data?.todayActivity || 0}
          tone="green"
        />
        <StatCard
          icon={ShieldCheck}
          label="Security alerts"
          value={stats.data?.securityAlerts || 0}
          tone="red"
        />
        <StatCard
          icon={Clock3}
          label="Critical issues"
          value={stats.data?.criticalIssues || 0}
          tone="blue"
        />
      </div>
      <Card className="log-heatmap">
        <h2>Activity heatmap</h2>
        <ActivityHeatmap rows={heatmap.data} loading={heatmap.isLoading} />
      </Card>
      <Card className="table-card">
        <div className="filters log-filters">
          <div>
            <Search size={17} />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search action, message, or IP"
            />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            {[
              "user_activity",
              "admin_action",
              "system_event",
              "security",
              "api_request",
              "error",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="">All severities</option>
            {["info", "success", "warning", "error", "critical"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {["create", "update", "delete", "read", "other"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        {logs.isLoading ? (
          <PageLoader />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Event</th>
                    <th>Severity</th>
                    <th>Actor</th>
                    <th>IP address</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.data?.items.map((log) => (
                    <tr key={log._id}>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                      <td>
                        <strong>{log.action}</strong>
                        <span>
                          {log.type} · {log.actionCategory}
                        </span>
                        <span>{log.message}</span>
                      </td>
                      <td>
                        <Badge
                          tone={
                            ["error", "critical"].includes(log.severity)
                              ? "red"
                              : log.severity === "success"
                                ? "green"
                                : "orange"
                          }
                        >
                          {log.severity}
                        </Badge>
                      </td>
                      <td>
                        {log.user ? (
                          <>
                            <strong>
                              {log.user.firstName} {log.user.lastName}
                            </strong>
                            <span>{log.user.email}</span>
                          </>
                        ) : (
                          "System"
                        )}
                      </td>
                      <td>{log.ipAddress}</td>
                      <td>
                        <TableActions label="Log actions">
                          <TableAction onSelect={() => setSelected(log)}>
                            <Eye />
                            View details
                          </TableAction>
                        </TableActions>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!logs.data?.items.length && (
                <div className="empty">No matching system logs.</div>
              )}
            </div>
            <div className="pagination">
              <span>{logs.data?.total || 0} logs</span>
              <div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span>
                  Page {page} of {logs.data?.pages || 1}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= (logs.data?.pages || 1)}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        {selected && (
          <DialogContent>
            <DialogTitle>Log details</DialogTitle>
            <dl className="log-detail">
              <div>
                <dt>Action</dt>
                <dd>{selected.action}</dd>
              </div>
              <div>
                <dt>Message</dt>
                <dd>{selected.message || "—"}</dd>
              </div>
              <div>
                <dt>User agent</dt>
                <dd>{selected.userAgent}</dd>
              </div>
              <div>
                <dt>Metadata</dt>
                <dd>
                  <pre>{JSON.stringify(selected.metadata, null, 2)}</pre>
                </dd>
              </div>
            </dl>
          </DialogContent>
        )}
      </Dialog>
    </PortalShell>
  );
}

function StatusPage({ forbidden = false }) {
  return (
    <AuthLayout>
      <Card className="auth-card text-center">
        <div className="auth-icon mx-auto">
          <ShieldCheck />
        </div>
        <h1 className="mt-5 text-3xl font-bold">
          {forbidden ? "Access denied" : "Page not found"}
        </h1>
        <p className="my-4 text-muted-foreground">
          {forbidden
            ? "You do not have permission to view this page."
            : "The page you requested does not exist."}
        </p>
        <Button asChild>
          <Link to="/">Return home</Link>
        </Button>
      </Card>
    </AuthLayout>
  );
}
function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/events" element={<PublicEvents />} />
        <Route path="/events/:slug" element={<PublicEvent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/portal"
          element={
            <Protected role="entrepreneur">
              <EntrepreneurDashboard />
            </Protected>
          }
        />
        <Route
          path="/portal/events"
          element={
            <Protected role="entrepreneur">
              <BookingEvents />
            </Protected>
          }
        />
        <Route
          path="/portal/events/:id"
          element={
            <Protected role="entrepreneur">
              <BookingDetail />
            </Protected>
          }
        />
        <Route
          path="/portal/bookings"
          element={
            <Protected role="entrepreneur">
              <MyBookings />
            </Protected>
          }
        />
        <Route
          path="/portal/bookings/:id"
          element={
            <Protected role="entrepreneur">
              <MyBookingDetail />
            </Protected>
          }
        />
        <Route
          path="/portal/sales"
          element={
            <Protected role="entrepreneur">
              <PortalShell>
                <EntrepreneurSales />
              </PortalShell>
            </Protected>
          }
        />
        <Route
          path="/portal/notifications"
          element={
            <Protected role="entrepreneur">
              <Notifications />
            </Protected>
          }
        />
        <Route
          path="/portal/feedback"
          element={
            <Protected role="entrepreneur">
              <MyFeedback shell={PortalShell} />
            </Protected>
          }
        />
        <Route
          path="/portal/profile"
          element={
            <Protected role="entrepreneur">
              <Profile />
            </Protected>
          }
        />
        <Route
          path="/portal/settings"
          element={
            <Protected role="entrepreneur">
              <SettingsPage />
            </Protected>
          }
        />
        <Route
          path="/admin"
          element={
            <Protected roles={staffRoles}>
              <AdminDashboard />
            </Protected>
          }
        />
        <Route
          path="/admin/events"
          element={
            <Protected roles={staffRoles}>
              <AdminEvents />
            </Protected>
          }
        />
        <Route
          path="/admin/events/new"
          element={
            <Protected roles={staffRoles}>
              <AdminCreateEvent />
            </Protected>
          }
        />
        <Route
          path="/admin/events/:id/manage"
          element={
            <Protected roles={staffRoles}>
              <AdminEventManagement />
            </Protected>
          }
        />
        <Route
          path="/admin/events/:id/booths"
          element={
            <Protected roles={staffRoles}>
              <AdminBoothControl />
            </Protected>
          }
        />
        <Route
          path="/admin/revenue"
          element={
            <Protected roles={staffRoles}>
              <AdminRevenue />
            </Protected>
          }
        />
        <Route
          path="/admin/refunds"
          element={
            <Protected roles={staffRoles}>
              <AdminRefunds />
            </Protected>
          }
        />
        <Route
          path="/admin/bookings"
          element={<Navigate to="/admin/revenue" replace />}
        />
        <Route
          path="/admin/entrepreneurs"
          element={
            <Protected roles={staffRoles}>
              <AdminEntrepreneursWithSales />
            </Protected>
          }
        />
        <Route
          path="/admin/entrepreneurs/:id"
          element={
            <Protected roles={staffRoles}>
              <PortalShell admin>
                <AdminEntrepreneurSalesDetail />
              </PortalShell>
            </Protected>
          }
        />
        <Route
          path="/admin/feedback"
          element={
            <Protected roles={staffRoles}>
              <StaffFeedback shell={PortalShell} />
            </Protected>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <Protected roles={["admin", "superadmin"]}>
              <StaffManagement />
            </Protected>
          }
        />
        <Route
          path="/admin/sessions"
          element={
            <Protected role="superadmin">
              <SessionManagement />
            </Protected>
          }
        />
        <Route
          path="/admin/system-logs"
          element={
            <Protected role="superadmin">
              <SystemLogs />
            </Protected>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <Protected role="superadmin">
              <SettingsPage admin />
            </Protected>
          }
        />
        <Route path="/forbidden" element={<StatusPage forbidden />} />
        <Route path="*" element={<StatusPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
export default App;
