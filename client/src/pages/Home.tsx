import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  ArrowUpLeft,
  Bot,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleCheck,
  CloudCog,
  Cpu,
  Globe2,
  Instagram,
  Linkedin,
  LogIn,
  Mail,
  MapPin,
  Menu,
  Network,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from "lucide-react";

const primaryEmail = "mjtop294@gmail.com";

const services = [
  {
    icon: BrainCircuit,
    index: "01",
    slug: "ai-automation",
    title: "الذكاء الاصطناعي والأتمتة",
    description:
      "نحوّل الأعمال المتكررة إلى تدفقات ذكية تساعد فريقك يركّز على القرارات المهمة.",
    tone: "lime",
  },
  {
    icon: ShieldCheck,
    index: "02",
    slug: "cybersecurity",
    title: "الأمن السيبراني",
    description:
      "نصمّم طبقات حماية عملية ترفع جاهزية أنظمتك وتقلّل مساحة المخاطر الرقمية.",
    tone: "cyan",
  },
  {
    icon: CloudCog,
    index: "03",
    slug: "cloud-infrastructure",
    title: "السحابة والبنية التحتية",
    description:
      "نبني أساساً مرناً وموثوقاً لتشغيل خدماتك ونموها بدون تعقيد تشغيلي زائد.",
    tone: "purple",
  },
  {
    icon: Network,
    index: "04",
    slug: "data-integration",
    title: "تكامل الأنظمة والبيانات",
    description:
      "نربط الأدوات والبيانات في منظومة واحدة واضحة، قابلة للتوسع والقياس.",
    tone: "orange",
  },
];

const processSteps = [
  { number: "01", title: "نسمع", text: "نفهم واقعك، أولوياتك، والنتيجة البتفتش عليها." },
  { number: "02", title: "نصمّم", text: "نحوّل التحدي إلى مسار تقني واضح وقابل للتنفيذ." },
  { number: "03", title: "نبني", text: "نطوّر الحل وندمجه مع فريقك وبيئتك الحالية." },
  { number: "04", title: "نطوّر", text: "نقيس الأثر ونحسّن الحل مع نمو احتياجك." },
];

const navItems = [
  { label: "الرئيسية", href: "#top" },
  { label: "الخدمات", href: "#services" },
  { label: "طريقتنا", href: "#process" },
  { label: "تواصل معنا", href: "#contact" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [sent, setSent] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const authProviders = trpc.auth.providers.useQuery();
  const loginLocal = trpc.auth.loginLocal.useMutation({
    onSuccess: () => { setAuthMessage("تم تسجيل الدخول بنجاح."); setPassword(""); },
    onError: (error) => setAuthMessage(error.message),
  });
  const loginGuest = trpc.auth.loginGuest.useMutation({
    onSuccess: () => { setAuthMessage("دخلت كضيف. بعض خصائص الإدارة غير متاحة للضيف."); },
    onError: (error) => setAuthMessage(error.message),
  });
  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => setSent(true),
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (key: string) => {
      const item = data.get(key);
      return typeof item === "string" ? item : "";
    };
    submitContact.mutate({
      name: value("name"),
      contact: value("contact"),
      service: value("service"),
      message: value("message"),
      website: value("website"),
    });
  };

  const ActiveServiceIcon = services[activeService].icon;

  return (
    <div className="site-shell" dir="rtl">
      <a className="skip-link" href="#main-content">
        تخطّي إلى المحتوى الرئيسي
      </a>

      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="MjTop - الرئيسية" onClick={closeMenu}>
            <span className="brand-mark" aria-hidden="true">
              <span>Mj</span>
              <i />
            </span>
            <span className="brand-copy">
              <strong>MjTop</strong>
              <small>SMART TECHNOLOGY</small>
            </span>
          </a>

          <nav id="main-navigation" className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="التنقل الرئيسي">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            ))}
            <a className="nav-mobile-cta" href="#contact" onClick={closeMenu}>
              ابدأ حواراً <ArrowUpLeft size={16} aria-hidden="true" />
            </a>
          </nav>

          <div className="header-actions">
            <a className="header-cta" href="#contact" onClick={closeMenu}>
              ابدأ حواراً <ArrowUpLeft size={17} aria-hidden="true" />
            </a>
            <button className="auth-trigger" type="button" onClick={() => setAuthOpen(true)}>
              <LogIn size={16} aria-hidden="true" /> دخول
            </button>
            <button
              className="menu-toggle"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="main-navigation"
              aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {authOpen && (
        <div className="auth-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-title">
          <div className="auth-card">
            <button className="auth-close" type="button" aria-label="إغلاق" onClick={() => setAuthOpen(false)}><X size={18} /></button>
            <div className="eyebrow"><span className="eyebrow-dot" /> حساب MjTop</div>
            <h2 id="auth-title">سجّل دخولك بالطريقة المناسبة</h2>
            <p>Google وFacebook جاهزان كتكاملات placeholder إلى حين إضافة مفاتيح OAuth.</p>
            <div className="auth-provider-row">
              <button type="button" className="auth-provider" disabled={!authProviders.data?.google}>Google <small>{authProviders.data?.google ? "متاح" : "Placeholder"}</small></button>
              <button type="button" className="auth-provider" disabled={!authProviders.data?.facebook}>Facebook <small>{authProviders.data?.facebook ? "متاح" : "Placeholder"}</small></button>
            </div>
            <form className="auth-form" onSubmit={(event) => { event.preventDefault(); setAuthMessage(""); loginLocal.mutate({ username, password }); }}>
              <label>اسم المستخدم<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="mjtop249@gmail.com" autoComplete="username" /></label>
              <label>كلمة المرور<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="أدخل كلمة المرور" autoComplete="current-password" /></label>
              <button className="button button-primary" type="submit" disabled={loginLocal.isPending || !authProviders.data?.local}>{loginLocal.isPending ? "جاري التحقق..." : "دخول الإدارة"}</button>
            </form>
            <button className="guest-button" type="button" onClick={() => loginGuest.mutate()} disabled={loginGuest.isPending}>الدخول كضيف</button>
            {authMessage && <p className="auth-message" role="status">{authMessage}</p>}
          </div>
        </div>
      )}

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-image" aria-hidden="true" />
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-glow hero-glow-one" aria-hidden="true" />
          <div className="hero-glow hero-glow-two" aria-hidden="true" />
          <div className="container hero-content">
            <div className="hero-copy">
              <div className="eyebrow eyebrow-light">
                <span className="eyebrow-dot" />
                حلول أذكى. أثر أوضح.
              </div>
              <h1>
                التقنية ما مفروض تكون
                <span>عقبة.</span>
                <em>خلّها تكون ميزتك.</em>
              </h1>
              <p>
                في MjTop بنحوّل التعقيد التقني إلى حلول ذكية، مرنة، ومصمّمة عشان تخلّي عملك يتقدّم بثقة.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#contact">
                  احكِ لينا عن فكرتك <ArrowLeft size={17} aria-hidden="true" />
                </a>
                <a className="button button-ghost" href="#services">
                  استكشف خدماتنا <span className="button-arrow">↓</span>
                </a>
              </div>
              <div className="hero-proof">
                <div className="avatar-stack" aria-hidden="true">
                  <span>MT</span>
                  <span>AI</span>
                  <span>+</span>
                </div>
                <p>
                  من الفكرة إلى الأثر
                  <strong>نبني معاك، خطوة بخطوة.</strong>
                </p>
              </div>
            </div>

            <div className="hero-orbit-card">
              <div className="orbit-card-top">
                <span className="live-dot"><i /> متصل الآن</span>
                <span className="orbit-label">MJ / 001</span>
              </div>
              <div className="orbit-visual" aria-hidden="true">
                <div className="orbit-ring ring-one" />
                <div className="orbit-ring ring-two" />
                <div className="orbit-ring ring-three" />
                <div className="orbit-core"><Cpu size={34} /></div>
                <span className="orbit-node node-one"><Zap size={13} /></span>
                <span className="orbit-node node-two"><Globe2 size={13} /></span>
                <span className="orbit-node node-three"><Bot size={13} /></span>
              </div>
              <div className="orbit-card-bottom">
                <span>أنظمة تفهمك</span>
                <strong>وتنمو معاك</strong>
              </div>
            </div>
          </div>
          <div className="hero-scroll-hint" aria-hidden="true">
            <span>مرّر للاستكشاف</span>
            <span className="scroll-line" />
          </div>
        </section>

        <section className="signal-strip" aria-label="قيم MjTop">
          <div className="container signal-inner">
            <span className="signal-kicker">من التحدي إلى الإمكان</span>
            <div className="signal-items">
              <span><CircleCheck size={16} /> وضوح</span>
              <span><CircleCheck size={16} /> مرونة</span>
              <span><CircleCheck size={16} /> أثر</span>
            </div>
            <span className="signal-number">MJ<span>•</span>TOP</span>
          </div>
        </section>

        <section className="section services-section" id="services">
          <div className="container">
            <div className="section-heading services-heading">
              <div>
                <div className="eyebrow"><span className="eyebrow-dot" /> ما نقدّمه</div>
                <h2>نخلّي التقنية<br /><span>تشتغل لصالحك.</span></h2>
              </div>
              <p>ما بنبيعك أدوات زيادة. بنصمّم معاك منظومة تقنية أهدأ، أذكى، ومتصلة بهدفك الحقيقي.</p>
            </div>

            <div className="services-layout">
              <div className="service-list">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  const isActive = activeService === index;
                  return (
                    <button
                      className={`service-row ${isActive ? "is-active" : ""}`}
                      key={service.index}
                      type="button"
                      onClick={() => setActiveService(index)}
                      aria-pressed={isActive}
                    >
                      <span className={`service-icon tone-${service.tone}`}><Icon size={21} /></span>
                      <span className="service-row-text">
                        <small>{service.index}</small>
                        <strong>{service.title}</strong>
                      </span>
                      <ArrowLeft className="service-row-arrow" size={19} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
              <div key={services[activeService].index} className={`service-feature tone-${services[activeService].tone}`}>
                <div className="service-feature-top">
                  <span>خدمة {services[activeService].index}</span>
                  <Sparkles size={19} aria-hidden="true" />
                </div>
                <div className="service-feature-icon"><ActiveServiceIcon size={38} /></div>
                <h3>{services[activeService].title}</h3>
                <p>{services[activeService].description}</p>
                <a href={`/services/${services[activeService].slug}`}>خلّينا نبدأ من هنا <ArrowUpLeft size={17} /></a>
                <div className="feature-metric" aria-hidden="true">
                  <span /><span /><span /><span /><span /><span /><span /><span />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section process-section" id="process">
          <div className="process-backdrop" aria-hidden="true"><span>MJ</span></div>
          <div className="container process-inner">
            <div className="process-intro">
              <div className="eyebrow"><span className="eyebrow-dot" /> طريقتنا</div>
              <h2>نشتغل معاك،<br /><span>ما نشتغل بدالك.</span></h2>
              <p>أفضل الحلول التقنية بتطلع من فهم عميق للمشكلة، وتعاون حقيقي مع الناس البتستخدمها كل يوم.</p>
              <a className="text-link" href="#contact">تعرّف على طريقتنا <ArrowLeft size={17} /></a>
            </div>
            <div className="process-steps">
              {processSteps.map((step, index) => (
                <div className="process-step" key={step.number}>
                  <div className="process-step-number">{step.number}</div>
                  <div className="process-step-content">
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                  {index < processSteps.length - 1 && <span className="process-connector" aria-hidden="true" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section values-section">
          <div className="container values-grid">
            <div className="values-copy">
              <div className="eyebrow"><span className="eyebrow-dot" /> لماذا MjTop</div>
              <h2>تقنية فيها<br /><span>عقل وقلب.</span></h2>
              <p>لأن الحل القوي ما بس بيشتغل. بيكون مفهوم، قابل للتوسع، ومبني حول الناس البتستخدمه.</p>
            </div>
            <div className="value-cards">
              <article className="value-card value-card-dark">
                <span className="value-card-number">01</span>
                <Workflow size={27} />
                <h3>نبسّط التعقيد</h3>
                <p>نترجم اللغة التقنية لقرارات واضحة تقدر تتحرك بيها.</p>
              </article>
              <article className="value-card value-card-lime">
                <span className="value-card-number">02</span>
                <Zap size={27} />
                <h3>نسرّع الأثر</h3>
                <p>نبني أول نسخة عملية بسرعة، ثم نطوّرها مع الواقع.</p>
              </article>
              <article className="value-card value-card-outline">
                <span className="value-card-number">03</span>
                <Bot size={27} />
                <h3>نفكّر للمستقبل</h3>
                <p>حلول مرنة تواكب نموك بدل ما تعيد بناء كل شيء من الصفر.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-noise" aria-hidden="true" />
          <div className="container contact-inner">
            <div className="contact-copy">
              <div className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> الخطوة الجاية</div>
              <h2>عندك تحدّي؟<br /><span>خلّينا نفكّر فيه.</span></h2>
              <p>أرسل لينا نبذة بسيطة. ما محتاج تكون عارف الحل — دي شغلتنا.</p>
              <div className="contact-details">
                <a href={`mailto:${primaryEmail}`}><Mail size={17} /> {primaryEmail}</a>
                <span><MapPin size={17} /> الدوحة · قطر</span>
              </div>
            </div>
            <form className="contact-form" onSubmit={handleSubmit}>
              {sent ? (
                <div className="success-state" role="status">
                  <div className="success-icon"><Check size={25} /></div>
                  <h3>وصلتنا رسالتك.</h3>
                  <p>شكراً لثقتك. حنرجع ليك قريباً عشان نبدأ الحوار.</p>
                  <button className="button button-dark" type="button" onClick={() => setSent(false)}>إرسال رسالة أخرى</button>
                </div>
              ) : (
                <>
                  <div className="form-heading"><span>01</span><h3>خلّينا نتعارف</h3></div>
                  <label>اسمك الكريم<input required name="name" placeholder="مثلاً: محمد أحمد" /></label>
                  <label>البريد الإلكتروني أو الهاتف<input required name="contact" placeholder="كيف نتواصل معاك؟" /></label>
                  <label>نوع المساعدة<select name="service" defaultValue=""><option value="" disabled>اختار المجال الأقرب</option><option>أتمتة وذكاء اصطناعي</option><option>أمن سيبراني</option><option>سحابة وبنية تحتية</option><option>تكامل أنظمة وبيانات</option></select></label>
                  <label>احكِ لينا عن التحدي<textarea required name="message" rows={3} placeholder="شنو الحاجة العايز تطورها أو تحلّها؟" /></label>
                  <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="honeypot" />
                  {submitContact.error && <p className="form-error" role="alert">{submitContact.error.message}</p>}
                  <button className="button button-primary form-submit" type="submit" disabled={submitContact.isPending}>
                    {submitContact.isPending ? "جاري الإرسال..." : "أرسل الرسالة"} <Send size={17} />
                  </button>
                </>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-top">
          <a className="brand footer-brand" href="#top">
            <span className="brand-mark" aria-hidden="true"><span>Mj</span><i /></span>
            <span className="brand-copy"><strong>MjTop</strong><small>SMART TECHNOLOGY</small></span>
          </a>
          <p>نصمّم مستقبل أذكى،<br /><span>مع الناس البتصنعه.</span></p>
          <div className="footer-socials">
            <a href={`mailto:${primaryEmail}`} aria-label={`البريد الإلكتروني ${primaryEmail}`}><Mail size={18} /></a>
            <a href="#contact" aria-label="تواصل معنا"><Phone size={18} /></a>
            <a href="#top" aria-label="لينكدإن"><Linkedin size={18} /></a>
            <a href="#top" aria-label="إنستغرام"><Instagram size={18} /></a>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 MjTop. كل الحقوق محفوظة.</span>
          <span>Built for what’s next <span className="footer-star">✦</span></span>
        </div>
      </footer>
    </div>
  );
}
