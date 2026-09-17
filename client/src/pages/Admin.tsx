import { useState, type ReactNode } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Check, ChevronDown, Inbox, Loader2, LockKeyhole, Mail, RefreshCw } from "lucide-react";
import { Link } from "wouter";

type MessageStatus = "new" | "read" | "replied" | "archived";

const statusLabels: Record<MessageStatus, string> = {
  new: "جديدة",
  read: "مقروءة",
  replied: "تم الرد",
  archived: "مؤرشفة",
};

export default function Admin() {
  const { user, loading, logout } = useAuth();
  const messages = trpc.admin.messages.useQuery(undefined, { enabled: user?.role === "admin", retry: false });
  const updateStatus = trpc.admin.updateMessageStatus.useMutation({
    onSuccess: () => messages.refetch(),
  });

  if (loading) return <AdminLoading />;
  if (!user) return <AdminGate title="سجّل الدخول للوصول إلى لوحة الإدارة" action="تسجيل الدخول" onAction={() => startLogin()}><LocalAdminLogin /></AdminGate>;
  if (user.role !== "admin") return <AdminGate title="الحساب الحالي ما عنده صلاحية إدارة" action="العودة للموقع" onAction={() => (window.location.href = "/")} />;

  return (
    <div className="admin-shell" dir="rtl">
      <header className="admin-header">
        <div className="container admin-header-inner">
          <Link className="detail-brand" href="/" aria-label="MjTop - الرئيسية">
            <span className="brand-mark" aria-hidden="true"><span>Mj</span><i /></span>
            <span><strong>MjTop</strong><small>CONTROL ROOM</small></span>
          </Link>
          <div className="admin-header-actions"><span>{user.name || user.email}</span><button onClick={() => logout()}>خروج</button></div>
        </div>
      </header>

      <main className="container admin-main">
        <div className="admin-heading">
          <div><div className="eyebrow"><span className="eyebrow-dot" /> إدارة التواصل</div><h1>رسائل العملاء</h1><p>تابع الرسائل، راجع تفاصيل التحدي، وحدّث حالة المتابعة من مكان واحد.</p></div>
          <button className="admin-refresh" onClick={() => messages.refetch()} disabled={messages.isFetching}><RefreshCw size={16} className={messages.isFetching ? "is-spinning" : ""} /> تحديث</button>
        </div>

        {messages.isLoading ? <AdminLoading /> : messages.error ? <div className="admin-empty"><LockKeyhole size={24} /><p>تعذر تحميل الرسائل. تأكد من اتصال قاعدة البيانات وصلاحية الحساب.</p></div> : messages.data?.length ? (
          <div className="admin-message-list">
            {messages.data.map((message) => <article className="admin-message-card" key={message.id}>
              <div className="admin-message-top"><span className={`admin-status status-${message.status}`}>{statusLabels[message.status]}</span><span>#{message.id} · {new Date(message.createdAt).toLocaleString("ar-QA")}</span></div>
              <div className="admin-message-body"><div><h2>{message.name}</h2><a href={`mailto:${message.contact}`}><Mail size={15} /> {message.contact}</a>{message.service && <span className="admin-service">{message.service}</span>}</div><p>{message.message}</p></div>
              <div className="admin-message-footer"><span className={`admin-email-state email-${message.emailStatus}`}>البريد: {message.emailStatus === "sent" ? "أُرسل" : message.emailStatus === "failed" ? "فشل" : message.emailStatus === "skipped" ? "غير مفعّل" : "قيد الانتظار"}</span><label>تحديث الحالة<select value={message.status} onChange={(event) => updateStatus.mutate({ id: message.id, status: event.target.value as MessageStatus })} disabled={updateStatus.isPending}><option value="new">جديدة</option><option value="read">مقروءة</option><option value="replied">تم الرد</option><option value="archived">مؤرشفة</option></select><ChevronDown size={14} /></label></div>
            </article>)}
          </div>
        ) : <div className="admin-empty"><Inbox size={28} /><h2>ما في رسائل لحدي الآن</h2><p>رسائل نموذج التواصل حتظهر هنا بعد أول إرسال.</p></div>}
      </main>
    </div>
  );
}

function AdminLoading() {
  return <div className="admin-loading"><Loader2 size={24} className="is-spinning" /> جاري تحميل لوحة الإدارة...</div>;
}

function AdminGate({ title, action, onAction, children }: { title: string; action: string; onAction: () => void; children?: ReactNode }) {
  return <div className="admin-gate" dir="rtl"><LockKeyhole size={32} /><h1>{title}</h1><button className="button button-primary" onClick={onAction}>{action}<Check size={17} /></button>{children}</div>;
}

function LocalAdminLogin() {
  const [username, setUsername] = useState("mjtop249@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = trpc.auth.loginLocal.useMutation({
    onSuccess: () => window.location.reload(),
    onError: (cause) => setError(cause.message),
  });

  return <form className="admin-local-login" onSubmit={(event) => { event.preventDefault(); setError(""); login.mutate({ username, password }); }}>
    <label>أو الدخول المحلي للإدارة<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" /></label>
    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="كلمة المرور" autoComplete="current-password" />
    <button className="button button-ghost" type="submit" disabled={login.isPending}>{login.isPending ? "جاري التحقق..." : "دخول محلي"}</button>
    {error && <small role="alert">{error}</small>}
  </form>;
}
