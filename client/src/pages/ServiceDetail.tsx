import { ArrowLeft, ArrowUpLeft, Check, ChevronRight, CircleCheck, Sparkles } from "lucide-react";
import { Link, useRoute } from "wouter";

type ServiceDetailData = {
  number: string;
  title: string;
  eyebrow: string;
  intro: string;
  outcome: string;
  accent: string;
  examples: { title: string; text: string; result: string }[];
  deliverables: string[];
};

const serviceDetails: Record<string, ServiceDetailData> = {
  "ai-automation": {
    number: "01",
    title: "الذكاء الاصطناعي والأتمتة",
    eyebrow: "خدمة 01 · أنظمة أذكى",
    intro: "نحوّل الأعمال المتكررة إلى تدفقات ذكية تساعد فريقك يركّز على القرارات المهمة بدل الشغل اليدوي المتواصل.",
    outcome: "وقت أقل في التكرار. قرارات أسرع. تشغيل أكثر وضوحاً.",
    accent: "lime",
    examples: [
      { title: "مساعد داخلي للمعرفة", text: "نربط سياساتك وملفاتك في واجهة بحث ومحادثة يفهمها الفريق.", result: "إجابات أسرع بدون البحث بين عشرات الملفات." },
      { title: "أتمتة الموافقات", text: "نحوّل الطلبات المتكررة إلى مسار واضح من الطلب إلى المراجعة والتنفيذ.", result: "تتبّع كامل وتقليل التأخير بين الفرق." },
      { title: "تقارير تشغيلية ذكية", text: "نجمع البيانات من أدواتك ونحوّلها إلى مؤشرات مفهومة للإدارة.", result: "رؤية يومية أفضل بدل التقارير المتأخرة." },
    ],
    deliverables: ["خريطة فرص الأتمتة", "نموذج أولي قابل للتجربة", "تدفق عمل موثق", "خطة قياس الأثر"],
  },
  cybersecurity: {
    number: "02",
    title: "الأمن السيبراني",
    eyebrow: "خدمة 02 · حماية عملية",
    intro: "نصمّم طبقات حماية عملية ترفع جاهزية أنظمتك وتقلّل مساحة المخاطر الرقمية بدون تعقيد يعطّل الفريق.",
    outcome: "مخاطر أوضح. استجابة أسرع. ثقة أعلى في البنية الحالية.",
    accent: "cyan",
    examples: [
      { title: "مراجعة الجاهزية", text: "نراجع الوصول، الأصول، السياسات، ونقاط الضعف الأكثر تأثيراً.", result: "قائمة أولويات واضحة بدل تقرير طويل غير قابل للتنفيذ." },
      { title: "تقوية الهوية والوصول", text: "نرتّب الصلاحيات ونقلّل الحسابات الزائدة ونبني قواعد وصول مفهومة.", result: "مساحة هجوم أقل وحسابات أسهل في الإدارة." },
      { title: "خطة الاستجابة", text: "نجهّز خطوات عملية للتعامل مع الحوادث وتحديد المسؤوليات.", result: "وقت استجابة أقصر وقرارات أهدأ وقت الأزمة." },
    ],
    deliverables: ["تقييم مخاطر مختصر", "سجل أصول وصلاحيات", "أولويات معالجة", "خطة استجابة للحوادث"],
  },
  "cloud-infrastructure": {
    number: "03",
    title: "السحابة والبنية التحتية",
    eyebrow: "خدمة 03 · أساس قابل للنمو",
    intro: "نبني أساساً مرناً وموثوقاً لتشغيل خدماتك ونموها بدون تعقيد تشغيلي زائد أو اعتماد على حلول مؤقتة.",
    outcome: "تشغيل أكثر استقراراً. توسّع محسوب. تكلفة مفهومة.",
    accent: "purple",
    examples: [
      { title: "نقل تدريجي للسحابة", text: "نقسّم الانتقال إلى مراحل آمنة بدل تغيير كل شيء في يوم واحد.", result: "مخاطر أقل ووضوح أفضل في كل مرحلة." },
      { title: "مراقبة الخدمات", text: "نبني مؤشرات تنبيه ومراقبة تساعد فريقك يعرف المشكلة قبل العميل.", result: "اكتشاف مبكر للأعطال وتحسين تجربة المستخدم." },
      { title: "تحسين التكلفة", text: "نراجع الموارد والاستخدام ونزيل الهدر من البنية الحالية.", result: "إنفاق مرتبط بالاستخدام الفعلي والنمو." },
    ],
    deliverables: ["خريطة البنية الحالية", "تصميم البنية المستهدفة", "خطة انتقال تدريجي", "لوحة مؤشرات تشغيلية"],
  },
  "data-integration": {
    number: "04",
    title: "تكامل الأنظمة والبيانات",
    eyebrow: "خدمة 04 · منظومة متصلة",
    intro: "نربط الأدوات والبيانات في منظومة واحدة واضحة، قابلة للتوسع والقياس، بدل الجزر المنفصلة والنسخ اليدوية.",
    outcome: "بيانات أنظف. عمليات مترابطة. صورة واحدة للقرار.",
    accent: "orange",
    examples: [
      { title: "ربط أنظمة المبيعات", text: "نوحّد انتقال العميل من الطلب إلى المتابعة والفوترة.", result: "سياق كامل للفريق بدون إدخال البيانات مرتين." },
      { title: "مركز بيانات تشغيلي", text: "نجمع مصادر مختلفة في نموذج واضح يصلح للتقارير والتحليل.", result: "أرقام متسقة يمكن الاعتماد عليها." },
      { title: "تنبيهات مرتبطة بالعمل", text: "نرسل الحدث للشخص الصحيح في الوقت الصحيح بدل التنبيهات العشوائية.", result: "قرارات أسرع ومسؤولية أوضح." },
    ],
    deliverables: ["خريطة تدفق البيانات", "تعريف مصادر الحقيقة", "تكامل أولي قابل للقياس", "خطة توسعة وصيانة"],
  },
};

export default function ServiceDetail() {
  const [, params] = useRoute("/services/:slug");
  const service = params?.slug ? serviceDetails[params.slug] : undefined;

  if (!service) {
    return (
      <main className="detail-missing">
        <p>الخدمة المطلوبة غير موجودة.</p>
        <Link href="/">العودة للرئيسية</Link>
      </main>
    );
  }

  return (
    <div className="detail-shell" dir="rtl">
      <header className="detail-header">
        <div className="container detail-header-inner">
          <Link className="detail-brand" href="/" aria-label="MjTop - الرئيسية">
            <span className="brand-mark" aria-hidden="true"><span>Mj</span><i /></span>
            <span><strong>MjTop</strong><small>SMART TECHNOLOGY</small></span>
          </Link>
          <Link className="detail-back" href="/">
            العودة للرئيسية <ArrowLeft size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main>
        <section className={`detail-hero detail-tone-${service.accent}`}>
          <div className="container detail-hero-inner">
            <div className="detail-hero-copy">
              <div className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> {service.eyebrow}</div>
              <h1>{service.title}</h1>
              <p>{service.intro}</p>
              <div className="detail-actions">
                <a className="button button-primary" href="#examples">شوف الأمثلة <ArrowDownIcon /></a>
                <a className="button button-ghost" href="#contact">ابدأ حواراً <ArrowUpLeft size={16} /></a>
              </div>
            </div>
            <div className="detail-signal-card">
              <Sparkles size={20} />
              <span>{service.number}</span>
              <strong>{service.outcome}</strong>
              <small>مصمّم حول واقع فريقك، وليس حول أداة واحدة.</small>
            </div>
          </div>
        </section>

        <section className="detail-section" id="examples">
          <div className="container">
            <div className="detail-section-heading">
              <div><div className="eyebrow"><span className="eyebrow-dot" /> نماذج عملية</div><h2>نبدأ من المشكلة،<br /><span>ونقيس الأثر.</span></h2></div>
              <p>دي أمثلة على نوع الشغل الممكن. الحل النهائي يتصمّم بعد ما نفهم بيئتك وأولوياتك.</p>
            </div>
            <div className="detail-example-grid">
              {service.examples.map((example, index) => (
                <article className="detail-example-card" key={example.title}>
                  <span className="detail-example-number">0{index + 1}</span>
                  <h3>{example.title}</h3>
                  <p>{example.text}</p>
                  <div className="detail-result"><Check size={16} /> {example.result}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="detail-method">
          <div className="container detail-method-grid">
            <div><div className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> مخرجات واضحة</div><h2>ما بتطلع من المشروع<br /><span>بكلام عام.</span></h2><p>كل مرحلة بتسلّم حاجة قابلة للمراجعة والاستخدام، عشان تعرف وين وصلنا وشنو الخطوة الجاية.</p></div>
            <div className="detail-deliverables">{service.deliverables.map((item) => <div key={item}><CircleCheck size={18} /> <span>{item}</span><ChevronRight size={16} /></div>)}</div>
          </div>
        </section>

        <section className="detail-contact" id="contact">
          <div className="container detail-contact-inner"><div><div className="eyebrow"><span className="eyebrow-dot" /> الخطوة الجاية</div><h2>عندك حالة مشابهة؟<br /><span>خلّينا نفكّر فيها.</span></h2></div><Link className="button button-primary" href="/#contact">أرسل تفاصيل التحدي <ArrowUpLeft size={17} /></Link></div>
        </section>
      </main>
    </div>
  );
}

function ArrowDownIcon() {
  return <span aria-hidden="true">↓</span>;
}

export { serviceDetails };
