import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMG = "https://cdn.poehali.dev/projects/ab370efa-2244-49be-aa2e-79e9684ca6a9/files/a5dd6373-8db7-4512-ab7e-e160afb2de73.jpg";

const API_REGISTER = "https://functions.poehali.dev/79cdc81a-3cea-4057-b6e3-50630a685c7b";
const API_LOGIN    = "https://functions.poehali.dev/cf908c86-a07c-452d-aaca-e5c95d27766d";
const API_ME       = "https://functions.poehali.dev/0d927dc2-0457-4935-afcd-3b313289b6a4";

interface User { id: number; name: string; email: string; }

type AuthMode = "login" | "register";

const CATEGORIES = [
  { icon: "Wrench", label: "Сантехника", count: 48, color: "bg-blue-100 text-blue-600" },
  { icon: "Zap", label: "Электрика", count: 35, color: "bg-yellow-100 text-yellow-600" },
  { icon: "Hammer", label: "Ремонт", count: 92, color: "bg-orange-100 text-orange-600" },
  { icon: "Leaf", label: "Сад и огород", count: 27, color: "bg-green-100 text-green-600" },
  { icon: "PaintBucket", label: "Покраска", count: 31, color: "bg-pink-100 text-pink-600" },
  { icon: "Wifi", label: "Интернет и ТВ", count: 19, color: "bg-purple-100 text-purple-600" },
  { icon: "Sofa", label: "Мебель", count: 44, color: "bg-amber-100 text-amber-600" },
  { icon: "Car", label: "Авто", count: 22, color: "bg-red-100 text-red-600" },
];

const MASTERS = [
  {
    id: 1,
    name: "Андрей Петров",
    specialty: "Сантехник",
    rating: 4.9,
    reviews: 127,
    price: "от 800 ₽",
    verified: true,
    badge: "Топ мастер",
    distance: "0.8 км",
    avatar: "🔧",
    tags: ["Срочно", "Гарантия"],
  },
  {
    id: 2,
    name: "Ольга Смирнова",
    specialty: "Электрик",
    rating: 4.8,
    reviews: 89,
    price: "от 600 ₽",
    verified: true,
    badge: "",
    distance: "1.2 км",
    avatar: "⚡",
    tags: ["Гарантия"],
  },
  {
    id: 3,
    name: "Дмитрий Козлов",
    specialty: "Мастер ремонта",
    rating: 4.7,
    reviews: 214,
    price: "от 1200 ₽",
    verified: true,
    badge: "Проверен",
    distance: "2.1 км",
    avatar: "🔨",
    tags: ["Опыт 10 лет"],
  },
  {
    id: 4,
    name: "Мария Иванова",
    specialty: "Садовод",
    rating: 5.0,
    reviews: 43,
    price: "от 500 ₽",
    verified: false,
    badge: "",
    distance: "0.5 км",
    avatar: "🌿",
    tags: ["Новый"],
  },
];

const REVIEWS = [
  {
    id: 1,
    author: "Алина К.",
    master: "Андрей Петров",
    text: "Пришёл быстро, сделал всё чисто и аккуратно. Объяснил причину поломки и как избежать в будущем. Однозначно рекомендую!",
    rating: 5,
    date: "2 дня назад",
    avatar: "👩",
  },
  {
    id: 2,
    author: "Павел М.",
    master: "Ольга Смирнова",
    text: "Отличный мастер! Решила все проблемы с проводкой за один визит. Очень профессионально и по разумной цене.",
    rating: 5,
    date: "5 дней назад",
    avatar: "👨",
  },
  {
    id: 3,
    author: "Татьяна Р.",
    master: "Дмитрий Козлов",
    text: "Делал ремонт в ванной — результат превзошёл ожидания. Аккуратный, пунктуальный, работает с удовольствием.",
    rating: 5,
    date: "1 неделю назад",
    avatar: "👩",
  },
];

const CHAT_MESSAGES = [
  { from: "master", text: "Здравствуйте! Чем могу помочь?" },
  { from: "user", text: "Нужно починить кран, течёт уже 2 дня" },
  { from: "master", text: "Понял! Смогу приехать сегодня в 15:00 или 18:00. Что удобнее?" },
  { from: "user", text: "В 15:00 отлично, жду!" },
  { from: "master", text: "Договорились 👍 Запишите: Андрей, 8-999-123-45-67" },
];

type Tab = "home" | "catalog" | "map" | "profile" | "chat";

function MasterCard({
  master,
  onChat,
}: {
  master: (typeof MASTERS)[0];
  onChat: () => void;
}) {
  return (
    <div className="card-warm rounded-3xl p-4">
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-warm-100 flex items-center justify-center text-3xl">
            {master.avatar}
          </div>
          {master.verified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full verified-badge flex items-center justify-center shadow">
              <Icon name="Check" size={11} className="text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-display font-semibold text-sm text-foreground">
                  {master.name}
                </span>
                {master.badge && (
                  <span className="text-xs bg-warm-100 text-warm-700 px-1.5 py-0.5 rounded-full font-medium">
                    {master.badge}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-xs mt-0.5">{master.specialty}</p>
            </div>
            <span className="font-bold text-warm-600 text-sm flex-shrink-0">{master.price}</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <span className="rating-star text-sm">★</span>
              <span className="font-semibold text-sm">{master.rating}</span>
              <span className="text-muted-foreground text-xs">({master.reviews})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Icon name="MapPin" size={11} />
              <span className="text-xs">{master.distance}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {master.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-white border border-warm-200 text-warm-600 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t border-warm-100">
        <button
          onClick={onChat}
          className="flex-1 flex items-center justify-center gap-1.5 bg-warm-50 border border-warm-200 rounded-xl py-2 text-sm text-warm-700 font-medium hover:bg-warm-100 transition-colors"
        >
          <Icon name="MessageCircle" size={15} />
          Написать
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 btn-primary rounded-xl py-2 text-sm text-white font-medium transition-all duration-200">
          <Icon name="CalendarCheck" size={15} />
          Заказать
        </button>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: (typeof REVIEWS)[0] }) {
  return (
    <div className="card-warm rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-warm-100 flex items-center justify-center text-xl">
          {review.avatar}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{review.author}</div>
          <div className="text-muted-foreground text-xs">{review.master}</div>
        </div>
        <div className="text-right">
          <div className="flex gap-0.5">
            {[...Array(review.rating)].map((_, i) => (
              <span key={i} className="rating-star text-sm">★</span>
            ))}
          </div>
          <div className="text-muted-foreground text-xs mt-0.5">{review.date}</div>
        </div>
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed">{review.text}</p>
    </div>
  );
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const token = localStorage.getItem("sn_token");
    if (!token) { setAuthChecking(false); return; }
    fetch(API_ME, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.text())
      .then(text => {
        const data = JSON.parse(typeof JSON.parse(text) === "string" ? JSON.parse(text) : text);
        if (data.id) setUser(data);
        else localStorage.removeItem("sn_token");
      })
      .catch(() => localStorage.removeItem("sn_token"))
      .finally(() => setAuthChecking(false));
  }, []);

  const handleAuth = async () => {
    setAuthError("");
    if (!form.email || !form.password) { setAuthError("Заполните все поля"); return; }
    if (authMode === "register" && !form.name) { setAuthError("Введите имя"); return; }
    setAuthLoading(true);
    try {
      const url = authMode === "register" ? API_REGISTER : API_LOGIN;
      const body: Record<string, string> = { email: form.email, password: form.password };
      if (authMode === "register") body.name = form.name;
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const text = await res.text();
      const parsed = JSON.parse(typeof JSON.parse(text) === "string" ? JSON.parse(text) : text);
      if (!res.ok) { setAuthError(parsed.error || "Ошибка"); return; }
      localStorage.setItem("sn_token", parsed.token);
      setUser(parsed.user);
      setShowAuth(false);
      setForm({ name: "", email: "", password: "" });
    } catch {
      setAuthError("Ошибка сети, попробуйте снова");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sn_token");
    setUser(null);
  };

  const filteredMasters = MASTERS.filter((m) => {
    const matchQuery =
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      !activeCategory || m.specialty.toLowerCase().includes(activeCategory.toLowerCase());
    return matchQuery && matchCategory;
  });

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: chatInput }]);
    setChatInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "master", text: "Получил ваше сообщение! Отвечу в ближайшее время 🙂" },
      ]);
    }, 800);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-warm-400 to-terra-500 flex items-center justify-center shadow-lg animate-float">
            <span className="text-2xl">🏠</span>
          </div>
          <p className="text-muted-foreground text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-cream relative shadow-2xl">
      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-4 sm:pb-0" onClick={() => setShowAuth(false)}>
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl">
                {authMode === "login" ? "Вход в аккаунт" : "Регистрация"}
              </h2>
              <button onClick={() => setShowAuth(false)} className="w-8 h-8 rounded-xl bg-warm-100 flex items-center justify-center">
                <Icon name="X" size={16} className="text-warm-600" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {authMode === "register" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ваше имя</label>
                  <input
                    type="text"
                    placeholder="Иван Иванов"
                    value={form.name}
                    onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    className="w-full bg-warm-50 border border-warm-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-warm-400 transition-colors"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                <input
                  type="email"
                  placeholder="ivan@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  className="w-full bg-warm-50 border border-warm-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-warm-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Пароль</label>
                <input
                  type="password"
                  placeholder="Минимум 6 символов"
                  value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  onKeyDown={e => e.key === "Enter" && handleAuth()}
                  className="w-full bg-warm-50 border border-warm-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-warm-400 transition-colors"
                />
              </div>

              {authError && (
                <div className="bg-terra-50 border border-terra-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <Icon name="AlertCircle" size={15} className="text-terra-500 flex-shrink-0" />
                  <span className="text-terra-700 text-sm">{authError}</span>
                </div>
              )}

              <button
                onClick={handleAuth}
                disabled={authLoading}
                className="btn-primary text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 mt-1"
              >
                {authLoading ? "Подождите..." : authMode === "login" ? "Войти" : "Создать аккаунт"}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                {authMode === "login" ? "Ещё нет аккаунта? " : "Уже есть аккаунт? "}
                <button
                  onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }}
                  className="text-warm-600 font-medium"
                >
                  {authMode === "login" ? "Зарегистрироваться" : "Войти"}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-warm-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-warm-400 to-terra-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm">🏠</span>
          </div>
          <span className="font-display font-bold text-lg text-warm-700">Сосед Поможет</span>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center hover:bg-warm-200 transition-colors">
                <Icon name="Bell" size={16} className="text-warm-600" />
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className="flex items-center gap-1.5 bg-warm-100 hover:bg-warm-200 transition-colors rounded-full pl-1.5 pr-3 py-1"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-terra-300 to-terra-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-warm-700 max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => { setShowAuth(true); setAuthMode("login"); setAuthError(""); }}
              className="btn-primary text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200"
            >
              Войти
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {/* HOME */}
        {activeTab === "home" && (
          <div className="animate-fade-in">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-b-3xl">
              <img
                src={HERO_IMG}
                alt="Соседи помогают друг другу"
                className="w-full h-52 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-warm-900/80 via-warm-800/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="font-handwritten text-2xl text-warm-200 mb-1">{user ? `Привет, ${user.name.split(" ")[0]}! 👋` : "Привет! 👋"}</p>
                <h1 className="font-display font-bold text-2xl text-white leading-tight">
                  Найди мастера<br />в своём районе
                </h1>
              </div>
            </div>

            {/* Search */}
            <div className="px-4 -mt-4 relative z-10">
              <div className="bg-white rounded-2xl shadow-lg border border-warm-100 flex items-center gap-3 px-4 py-3">
                <Icon name="Search" size={18} className="text-warm-400" />
                <input
                  type="text"
                  placeholder="Что нужно сделать?"
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm font-sans"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn-primary text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200">
                  Найти
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="px-4 mt-4 grid grid-cols-3 gap-3">
              {[
                { value: "320+", label: "Мастеров", icon: "Users" },
                { value: "4.9", label: "Рейтинг", icon: "Star" },
                { value: "98%", label: "Довольны", icon: "ThumbsUp" },
              ].map((stat) => (
                <div key={stat.label} className="card-warm rounded-2xl p-3 text-center">
                  <Icon name={stat.icon} size={18} className="text-warm-500 mx-auto mb-1" />
                  <div className="font-display font-bold text-warm-700 text-lg">{stat.value}</div>
                  <div className="text-muted-foreground text-xs">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Categories */}
            <div className="px-4 mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-bold text-base text-foreground">Категории услуг</h2>
                <button
                  className="text-warm-500 text-sm font-medium"
                  onClick={() => setActiveTab("catalog")}
                >
                  Все →
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white border border-warm-100 hover:border-warm-300 transition-all duration-200 hover-scale"
                    onClick={() => {
                      setActiveTab("catalog");
                      setActiveCategory(cat.label);
                    }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                      <Icon name={cat.icon} size={18} />
                    </div>
                    <span className="text-xs text-foreground font-medium leading-tight text-center">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Top masters */}
            <div className="px-4 mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-bold text-base text-foreground">Топ мастеров</h2>
                <button
                  className="text-warm-500 text-sm font-medium"
                  onClick={() => setActiveTab("catalog")}
                >
                  Все →
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {MASTERS.slice(0, 2).map((master) => (
                  <MasterCard key={master.id} master={master} onChat={() => setActiveTab("chat")} />
                ))}
              </div>
            </div>

            {/* Verification Banner */}
            <div className="px-4 mt-6 mb-2">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sage-500 to-sage-700 p-5 text-white">
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -right-2 bottom-2 w-16 h-16 rounded-full bg-white/5" />
                <div className="flex items-start gap-3 relative">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="ShieldCheck" size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base mb-1">Проверка мастеров</h3>
                    <p className="text-sage-100 text-sm leading-relaxed">
                      Каждый мастер проходит верификацию: проверка документов, тестовое задание и собеседование
                    </p>
                    <button className="mt-3 bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-4 py-1.5 text-sm font-medium">
                      Подробнее
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent reviews */}
            <div className="px-4 mt-4 mb-4">
              <h2 className="font-display font-bold text-base text-foreground mb-3">Отзывы клиентов</h2>
              <div className="flex flex-col gap-3">
                {REVIEWS.slice(0, 2).map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CATALOG */}
        {activeTab === "catalog" && (
          <div className="animate-fade-in">
            <div className="px-4 pt-4">
              <h2 className="font-display font-bold text-xl text-foreground mb-4">Найти мастера</h2>

              <div className="bg-white rounded-2xl border border-warm-100 flex items-center gap-3 px-4 py-3 mb-4">
                <Icon name="Search" size={18} className="text-warm-400" />
                <input
                  type="text"
                  placeholder="Поиск по имени или услуге..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    !activeCategory
                      ? "bg-warm-500 text-white shadow-sm"
                      : "bg-white border border-warm-200 text-warm-600"
                  }`}
                >
                  Все
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeCategory === cat.label
                        ? "bg-warm-500 text-white shadow-sm"
                        : "bg-white border border-warm-200 text-warm-600"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-muted-foreground text-sm">Сортировать:</span>
                {["По рейтингу", "По цене", "Рядом"].map((s) => (
                  <button
                    key={s}
                    className="text-xs text-warm-600 font-medium bg-warm-50 border border-warm-200 px-2.5 py-1 rounded-full"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                {filteredMasters.length > 0 ? (
                  filteredMasters.map((master) => (
                    <MasterCard key={master.id} master={master} onChat={() => setActiveTab("chat")} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <span className="text-4xl">🔍</span>
                    <p className="text-muted-foreground mt-3">Мастера не найдены</p>
                    <button
                      className="mt-2 text-warm-500 text-sm"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveCategory(null);
                      }}
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MAP */}
        {activeTab === "map" && (
          <div className="animate-fade-in">
            <div className="px-4 pt-4 mb-3">
              <h2 className="font-display font-bold text-xl text-foreground">Мастера на карте</h2>
              <p className="text-muted-foreground text-sm mt-1">Показаны мастера в радиусе 5 км</p>
            </div>

            <div className="mx-4 rounded-3xl overflow-hidden bg-gradient-to-br from-sage-100 to-sage-200 relative h-64 flex items-center justify-center border border-sage-200">
              <div className="absolute inset-0 opacity-20">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute border border-sage-400"
                    style={{
                      left: `${(i % 4) * 25}%`,
                      top: `${Math.floor(i / 4) * 50}%`,
                      width: "25%",
                      height: "50%",
                    }}
                  />
                ))}
              </div>

              {MASTERS.map((master, i) => (
                <div
                  key={master.id}
                  className="absolute flex flex-col items-center animate-float"
                  style={{
                    left: `${20 + i * 18}%`,
                    top: `${25 + (i % 2) * 35}%`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-lg border-2 border-warm-400 flex items-center justify-center text-lg">
                    {master.avatar}
                  </div>
                  {master.verified && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full verified-badge flex items-center justify-center">
                      <Icon name="Check" size={10} className="text-white" />
                    </div>
                  )}
                  <div className="mt-1 bg-white rounded-lg px-1.5 py-0.5 shadow text-xs font-medium text-warm-700 whitespace-nowrap">
                    ⭐ {master.rating}
                  </div>
                </div>
              ))}

              <div className="absolute w-5 h-5 rounded-full bg-terra-500 border-2 border-white shadow-lg flex items-center justify-center" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>

              <div className="absolute bottom-3 right-3 bg-white rounded-xl px-3 py-1.5 shadow text-xs text-muted-foreground">
                📍 Ваш район
              </div>
            </div>

            <div className="mx-4 mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-terra-500" />
                <span>Вы</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-white border-2 border-warm-400 flex items-center justify-center text-xs">🔧</div>
                <span>Мастер</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full verified-badge" />
                <span>Верифицирован</span>
              </div>
            </div>

            <div className="px-4 mt-4">
              <h3 className="font-display font-semibold text-base mb-3">Рядом с вами</h3>
              <div className="flex flex-col gap-3">
                {[...MASTERS].sort((a, b) =>
                  parseFloat(a.distance) - parseFloat(b.distance)
                ).map((master) => (
                  <div key={master.id} className="card-warm rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-warm-100 flex items-center justify-center text-2xl">
                      {master.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm">{master.name}</span>
                        {master.verified && (
                          <div className="w-4 h-4 rounded-full verified-badge flex items-center justify-center">
                            <Icon name="Check" size={10} className="text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">{master.specialty}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-warm-600 font-bold text-sm">{master.distance}</div>
                      <div className="flex items-center gap-0.5 justify-end">
                        <span className="rating-star text-xs">★</span>
                        <span className="text-xs text-muted-foreground">{master.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="animate-fade-in">
            {!user && (
              <div className="px-4 pt-12 pb-8 flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-3xl bg-warm-100 flex items-center justify-center text-5xl">👤</div>
                <h3 className="font-display font-bold text-xl text-foreground">Вы не вошли</h3>
                <p className="text-muted-foreground text-sm text-center">Войдите, чтобы видеть историю заказов и настройки</p>
                <button
                  onClick={() => { setShowAuth(true); setAuthMode("login"); setAuthError(""); }}
                  className="btn-primary text-white font-semibold px-8 py-3 rounded-2xl transition-all duration-200"
                >
                  Войти в аккаунт
                </button>
                <button
                  onClick={() => { setShowAuth(true); setAuthMode("register"); setAuthError(""); }}
                  className="text-warm-600 font-medium text-sm"
                >
                  Создать аккаунт
                </button>
              </div>
            )}
            {user && (<>
            <div className="bg-gradient-to-b from-warm-100 to-cream px-4 pt-6 pb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-warm-300 to-terra-400 flex items-center justify-center text-4xl shadow-lg font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-foreground">{user.name}</h2>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full font-medium">Клиент</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { value: "12", label: "Заказов" },
                  { value: "4", label: "Мастера" },
                  { value: "₽24к", label: "Потрачено" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl p-3 text-center shadow-sm">
                    <div className="font-display font-bold text-warm-600 text-lg">{s.value}</div>
                    <div className="text-muted-foreground text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 mt-4">
              <h3 className="font-display font-semibold text-base mb-3">История заказов</h3>
              <div className="flex flex-col gap-3">
                {[
                  { service: "Починка крана", master: "Андрей Петров", date: "28 марта", price: "1 200 ₽", status: "Завершён", statusColor: "text-sage-600 bg-sage-50" },
                  { service: "Замена розетки", master: "Ольга Смирнова", date: "15 марта", price: "800 ₽", status: "Завершён", statusColor: "text-sage-600 bg-sage-50" },
                  { service: "Поклейка обоев", master: "Дмитрий Козлов", date: "2 марта", price: "4 500 ₽", status: "Завершён", statusColor: "text-sage-600 bg-sage-50" },
                  { service: "Стрижка газона", master: "Мария Иванова", date: "18 февраля", price: "600 ₽", status: "Отменён", statusColor: "text-terra-600 bg-terra-50" },
                ].map((order, i) => (
                  <div key={i} className="card-warm rounded-2xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-sm text-foreground">{order.service}</div>
                        <div className="text-muted-foreground text-xs mt-0.5">{order.master} · {order.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-warm-700 text-sm">{order.price}</div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 mt-6 mb-4">
              <h3 className="font-display font-semibold text-base mb-3">Настройки</h3>
              <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
                {[
                  { icon: "Bell", label: "Уведомления" },
                  { icon: "MapPin", label: "Мой адрес" },
                  { icon: "CreditCard", label: "Способы оплаты" },
                  { icon: "HelpCircle", label: "Поддержка" },
                  { icon: "LogOut", label: "Выйти", danger: true },
                ].map((item, i, arr) => (
                  <button
                    key={item.label}
                    onClick={item.danger ? handleLogout : undefined}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-warm-50 transition-colors text-left ${
                      i < arr.length - 1 ? "border-b border-warm-100" : ""
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                      className={item.danger ? "text-terra-500" : "text-warm-500"}
                    />
                    <span className={`text-sm font-medium ${item.danger ? "text-terra-600" : "text-foreground"}`}>
                      {item.label}
                    </span>
                    {!item.danger && (
                      <Icon name="ChevronRight" size={16} className="text-muted-foreground ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            </>)}
          </div>
        )}

        {/* CHAT */}
        {activeTab === "chat" && (
          <div className="animate-fade-in flex flex-col" style={{ minHeight: "calc(100vh - 130px)" }}>
            <div className="px-4 pt-4 pb-3 bg-white border-b border-warm-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-warm-100 flex items-center justify-center text-xl">🔧</div>
                <div>
                  <div className="font-semibold text-sm">Андрей Петров</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-sage-400" />
                    <span className="text-muted-foreground text-xs">Онлайн</span>
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="w-8 h-8 rounded-xl bg-warm-100 flex items-center justify-center">
                    <Icon name="Phone" size={14} className="text-warm-600" />
                  </button>
                  <button className="w-8 h-8 rounded-xl bg-warm-100 flex items-center justify-center">
                    <Icon name="MoreVertical" size={14} className="text-warm-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.from === "user"
                        ? "bg-gradient-to-br from-warm-500 to-terra-500 text-white rounded-br-md"
                        : "bg-white border border-warm-100 text-foreground rounded-bl-md shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 bg-white border-t border-warm-100">
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-xl bg-warm-100 flex items-center justify-center flex-shrink-0">
                  <Icon name="Paperclip" size={16} className="text-warm-500" />
                </button>
                <input
                  type="text"
                  placeholder="Написать сообщение..."
                  className="flex-1 bg-warm-50 border border-warm-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-warm-300 transition-colors"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="w-9 h-9 rounded-xl btn-primary flex items-center justify-center flex-shrink-0 transition-all duration-200"
                >
                  <Icon name="Send" size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-warm-100 px-2 py-2 z-50">
        <div className="flex items-center justify-around">
          {(
            [
              { tab: "home" as Tab, icon: "Home", label: "Главная" },
              { tab: "catalog" as Tab, icon: "Grid3x3", label: "Каталог" },
              { tab: "map" as Tab, icon: "MapPin", label: "Карта" },
              { tab: "chat" as Tab, icon: "MessageCircle", label: "Чат" },
              { tab: "profile" as Tab, icon: "User", label: "Профиль" },
            ] as { tab: Tab; icon: string; label: string }[]
          ).map(({ tab, icon, label }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200 ${
                activeTab === tab
                  ? "text-warm-600 bg-warm-100"
                  : "text-muted-foreground hover:text-warm-500"
              }`}
            >
              <Icon name={icon} size={20} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;