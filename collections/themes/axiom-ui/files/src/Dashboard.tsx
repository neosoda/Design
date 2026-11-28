import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, Dispatch, FormEvent, ReactNode, SetStateAction } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell,
  CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3,
  CreditCard, Download, Ellipsis, Filter, Home, LayoutGrid, LifeBuoy, Menu,
  Moon, Package, Plus, Search, Settings2, Shield, ShoppingBag, SlidersHorizontal,
  Sparkles, Sun, TrendingUp, UserRound, Users, Wallet, X,
  type LucideIcon,
} from 'lucide-react';
import type { DashboardConfig, DashboardProduct, DashboardUser, Metric, PageId, UserRole, UserStatus } from './types';

const NAV: { id: PageId; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const METRIC_ICONS: Record<Metric['icon'], LucideIcon> = {
  users: Users, revenue: Wallet, cart: ShoppingBag, growth: TrendingUp,
  clock: Clock3, conversion: Activity,
};

function money(value: number, config: DashboardConfig) {
  return new Intl.NumberFormat(config.locale, { style: 'currency', currency: config.currency, maximumFractionDigits: 0 }).format(value);
}
function initials(name: string) { return name.split(/\s+/).slice(0, 2).map(x => x[0]?.toUpperCase() ?? '').join(''); }
function toCSV(rows: DashboardUser[]) {
  const headers = ['id', 'name', 'email', 'role', 'status', 'orders', 'spent', 'joined'] as const;
  return [headers.join(','), ...rows.map(row => headers.map(key => { const value = String(row[key]); const safe = /^[=+@\-\t\r]/.test(value) ? '\'' + value : value; return `"${safe.replaceAll('"', '""')}"`; }).join(','))].join('\r\n');
}
function exportCSV(rows: DashboardUser[]) {
  const blob = new Blob(['\ufeff' + toCSV(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = 'dashboard-users.csv'; anchor.click();
  URL.revokeObjectURL(url);
}

function StatCard({ metric, index }: { metric: Metric; index: number }) {
  const Icon = METRIC_ICONS[metric.icon];
  return <motion.article className="stat-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} whileHover={{ y: -4 }}>
    <div className="stat-top"><span className="stat-icon"><Icon size={17} strokeWidth={1.75} /></span><ArrowUpRight className="stat-corner" size={16} /></div>
    <div className="stat-value">{metric.value}</div>
    <div className="stat-footer"><span className="muted">{metric.label}</span><span className={`trend trend-${metric.trend}`}>
      {metric.trend === 'down' ? <ArrowDownRight size={12} /> : metric.trend === 'up' ? <ArrowUpRight size={12} /> : null}{metric.change}</span>
    </div>
  </motion.article>;
}

function Metrics({ metrics }: { metrics: Metric[] }) { return <div className="stats-grid">{metrics.map((metric, index) => <StatCard key={metric.label} metric={metric} index={index} />)}</div>; }

function Graph({ data, compact = false }: { data: number[]; compact?: boolean }) {
  const w = 800, h = 248;
  const points = data.map((v, i) => `${i * w / Math.max(1, data.length - 1)},${h - (v / Math.max(...data, 1)) * (h - 24) - 8}`);
  const p = points.join(' ');
  const area = `M ${points[0]} L ${points.slice(1).join(' L ')} L ${w},${h} L 0,${h} Z`;
  return <div className={`graph-wrap ${compact ? 'graph-compact' : ''}`}>
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label={data.length ? `Activity: ${data.length} values, minimum ${Math.min(...data)}, maximum ${Math.max(...data)}` : "No activity data"}>
      <defs><linearGradient id={compact ? 'graph-fill-small' : 'graph-fill'} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8b7ae4" stopOpacity=".34" /><stop offset="100%" stopColor="#8b7ae4" stopOpacity="0" /></linearGradient></defs>
      {[.15, .37, .59, .81].map(v => <line key={v} x1="0" x2={w} y1={h * v} y2={h * v} stroke="#e5e2ee" strokeDasharray="5 7" />)}
      <path d={area} fill={`url(#${compact ? 'graph-fill-small' : 'graph-fill'})`} />
      <polyline points={p} fill="none" stroke="#7f70d8" strokeWidth="3.4" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div className="graph-months"><span>Start</span><span>Mid-period</span><span>Latest</span></div><details className="chart-summary"><summary>Chart data ({data.length} values)</summary><ol className="chart-values">{data.map((v,i)=><li key={i}>{v.toLocaleString()}</li>)}</ol></details>
  </div>;
}
function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <div className="section-header"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action}</div>;
}

function Donut({ traffic }: { traffic: DashboardConfig['traffic'] }) {
  const entries = traffic.reduce<{ name: string; value: number; color: string; start: number }[]>((prev, t) => {
    const start = prev.length ? prev[prev.length - 1].start + prev[prev.length - 1].value : 0;
    return [...prev, { ...t, start }];
  }, []);
  const parts = entries.map(item => `${item.color} ${item.start}% ${item.start + item.value}%`).join(', ');
  return <div className="traffic-body"><div className="donut" style={{ background: `conic-gradient(${parts})` }}><div className="donut-center"><strong>100%</strong><span>Traffic</span></div></div>
    <div className="traffic-legend">{entries.map(entry => <div className="traffic-item" key={entry.name}><span className="traffic-dot" style={{ background: entry.color }} /><span>{entry.name}</span><strong>{entry.value}%</strong></div>)}</div>
  </div>;
}

function Overview({ config, changePage }: { config: DashboardConfig; changePage: (id: PageId) => void }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstWeekday = month.getDay();
  return <>
    <div className="hero-grid">
      <section className="welcome-card"><div className="welcome-copy"><span className="tiny-badge"><Sparkles size={13} /> WORKSPACE INSIGHTS</span><h2>Your store is having a<br /><em>great month.</em></h2><p>Here's what's happening today. Keep the momentum going.</p><button className="welcome-btn" onClick={() => changePage('analytics')}>View analytics <ArrowUpRight size={15} /></button></div><div className="hero-decoration"><span className="hero-circle one"/><span className="hero-circle two"/><span className="hero-circle three"/></div></section>
      <section className="calendar-card panel"><div className="calendar-top"><strong>{new Intl.DateTimeFormat(config.locale, { month: 'long', year: 'numeric' }).format(month)}</strong><span className="calendar-buttons"><button aria-label="Previous month" onClick={() => setMonthOffset(x => x-1)}><ChevronLeft size={16} /></button><button aria-label="Next month" onClick={() => setMonthOffset(x => x+1)}><ChevronRight size={16} /></button></span></div><div className="calendar-grid">{['S','M','T','W','T','F','S'].map((d,i) => <b key={i}>{d}</b>)}{Array.from({length: 35}, (_,i) => { const day = i - firstWeekday + 1; const inMonth = day > 0 && day <= monthDays; const displayDay = day <= 0 ? new Date(month.getFullYear(), month.getMonth(), 0).getDate() + day : day > monthDays ? day - monthDays : day; const today = inMonth && month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth() && day === now.getDate(); return <span key={i} className={`${today ? 'today' : ''} ${!inMonth ? 'not-month' : ''}`}>{displayDay}</span>; })}</div><p className="calendar-foot"><span className="event-dot" /> 3 events scheduled this week</p></section>
    </div>
    <Metrics metrics={config.metrics.overview} />
    <div className="two-columns wide-left"><section className="panel chart-panel"><SectionHeader eyebrow="PERFORMANCE" title="Revenue overview" action={<span className="period-pill"><CalendarDays size={14}/> Last 30 days <ChevronDown size={14}/></span>} /><div className="chart-large-value">€84,320 <span className="trend trend-up"><ArrowUpRight size={13}/> +12.8%</span></div><Graph data={config.revenue} /></section>
    <section className="panel activity-panel"><SectionHeader eyebrow="WHAT'S NEW" title="Recent activity" action={<button className="text-btn" onClick={() => changePage('users')}>View all <ArrowRight size={15}/></button>} /><div className="activities">{config.activities.map((activity, i) => { const Icon = activity.kind === 'cart' ? ShoppingBag : activity.kind === 'user' ? UserRound : CreditCard; return <div className="activity" key={`${activity.title}-${i}`}><span className={`activity-icon activity-${activity.kind}`}><Icon size={17}/></span><div><b>{activity.title}</b><p>{activity.description}</p></div><small>{activity.minutesAgo}m</small></div>; })}</div><div className="activity-bottom"><span className="pulse"/> All systems operational</div></section></div>
  </>;
}

function UsersPage({ config, users, setUsers }: { config: DashboardConfig; users: DashboardUser[]; setUsers: Dispatch<SetStateAction<DashboardUser[]>> }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'All' | UserStatus>('All');
  const [role, setRole] = useState<'All' | UserRole>('All');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<DashboardUser | null>(null);
  const [draft, setDraft] = useState({ name: '', email: '', role: 'Customer' as UserRole, status: 'Active' as UserStatus });
  const pageSize = 6;
  const filtered = useMemo(() => users.filter(user =>
    (`${user.name} ${user.email} ${user.id}`).toLowerCase().includes(query.toLowerCase()) &&
    (status === 'All' || user.status === status) && (role === 'All' || user.role === role)), [users, query, status, role]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [query, status, role]);
  function openAdd() { setDraft({ name: '', email: '', role: 'Customer', status: 'Active' }); setSelected(null); setModal('add'); }
  function openEdit(user: DashboardUser) { setSelected(user); setDraft({ name: user.name, email: user.email, role: user.role, status: user.status }); setModal('edit'); }
  function saveUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.name.trim() || !draft.email.includes('@')) return;
    if (modal === 'edit' && selected) setUsers(prev => prev.map(user => user.id === selected.id ? { ...user, ...draft, avatar: initials(draft.name) } : user));
    else setUsers(prev => [{ ...draft, id: `USR-${Date.now()}`, orders: 0, spent: 0, joined: new Date().toISOString().slice(0, 10), avatar: initials(draft.name) }, ...prev]);
    setModal(null); setPage(1);
  }
  return <>
    <Metrics metrics={config.metrics.users} />
    <section className="panel user-panel">
      <div className="table-heading"><div><p className="eyebrow">USER DIRECTORY</p><h2>All users <span className="count-pill">{filtered.length}</span></h2><p>Manage your customers, roles and access.</p></div><div className="table-actions"><button className="outline-btn" onClick={() => exportCSV(filtered)}><Download size={16}/> Export CSV</button><button className="primary-btn" onClick={openAdd}><Plus size={17}/> Add user</button></div></div>
      <div className="filter-bar"><div className="tab-list" role="group" aria-label="User status">{(['All','Active','Pending','Inactive'] as const).map(s => <button className={status === s ? 'active' : ''} key={s} onClick={() => setStatus(s)}>{s}</button>)}</div><div className="filter-controls"><label className="search-input"><Search size={17}/><input aria-label="Search users" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search users..." /></label><label className="select-wrap"><SlidersHorizontal size={15}/><select aria-label="Filter user role" value={role} onChange={e => setRole(e.target.value as 'All' | UserRole)}><option value="All">All roles</option><option value="Customer">Customer</option><option value="Editor">Editor</option><option value="Admin">Admin</option></select><ChevronDown size={14}/></label></div></div>
      <div className="table-scroll"><table className="user-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Orders</th><th>Amount spent</th><th>Joined</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{rows.map((user, i) => <motion.tr key={user.id} initial={{opacity:0,y:7}} animate={{opacity:1,y:0}} transition={{delay:i*.025}}><td><div className="user-cell"><div className={`avatar avatar-${i%6}`}>{user.avatar}</div><div><strong>{user.name}</strong><span>{user.email}</span></div></div></td><td><span className="role-label">{user.role}<ChevronDown size={12}/></span></td><td><span className={`status status-${user.status.toLowerCase()}`}><span/> {user.status}</span></td><td>{user.orders}</td><td className="amount">{money(user.spent, config)}</td><td className="date-cell">{new Intl.DateTimeFormat(config.locale, { day:'2-digit',month:'short',year:'numeric' }).format(new Date(`${user.joined}T12:00:00`))}</td><td><button className="icon-btn" title={`Edit ${user.name}`} aria-label={`Edit ${user.name}`} onClick={() => openEdit(user)}><Ellipsis size={20}/></button></td></motion.tr>)}</tbody></table>{!rows.length && <div className="empty-state"><Search size={24}/><b>No users found</b><span>Try another search or filter.</span></div>}</div>
      <div className="table-footer"><span>Showing {filtered.length ? (page-1)*pageSize+1 : 0}–{Math.min(page*pageSize, filtered.length)} of {filtered.length} users</span><div className="pagination"><button disabled={page === 1} onClick={()=>setPage(p=>Math.max(1,p-1))} aria-label="Previous page"><ChevronLeft size={16}/></button><span>{page} / {totalPages}</span><button disabled={page === totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} aria-label="Next page"><ChevronRight size={16}/></button></div></div>
    </section>
    <AnimatePresence>{modal && <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={e => {if(e.target === e.currentTarget) setModal(null)}}><motion.section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" initial={{scale:.95,y:12}} animate={{scale:1,y:0}} exit={{scale:.95,y:12}}><div className="modal-heading"><div><p className="eyebrow">USER MANAGEMENT</p><h2 id="modal-title">{modal==='add' ? 'Add new user' : 'Edit user'}</h2></div><button className="icon-btn" onClick={()=>setModal(null)} aria-label="Close"><X size={19}/></button></div><form onSubmit={saveUser} className="modal-form"><label>Full name<input autoFocus required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="e.g. Alex Rivera" /></label><label>Email<input required type="email" value={draft.email} onChange={e=>setDraft({...draft,email:e.target.value})} placeholder="alex@example.com" /></label><div className="modal-two"><label>Role<select value={draft.role} onChange={e=>setDraft({...draft,role:e.target.value as UserRole})}><option>Customer</option><option>Editor</option><option>Admin</option></select></label><label>Status<select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value as UserStatus})}><option>Active</option><option>Pending</option><option>Inactive</option></select></label></div><p className="demo-notice">Demo mode: changes are kept in memory until reload.</p><div className="modal-actions"><button type="button" className="outline-btn" onClick={()=>setModal(null)}>Cancel</button><button type="submit" className="primary-btn"><Check size={16}/> {modal==='add'?'Create user':'Save changes'}</button></div></form></motion.section></motion.div>}</AnimatePresence>
  </>;
}

function ProductCard({ product, config, idx }: { product: DashboardProduct; config: DashboardConfig; idx: number }) {
  return <motion.article className="product-card" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:idx*.035}} whileHover={{y:-4}}>
    <div className={`product-art product-${product.color}`}><span className="product-orb" /><span className="product-glint" />{product.featured && <span className="feature-badge">Bestseller</span>}<span className="product-id">{product.id}</span></div><div className="product-details"><div className="product-cat">{product.category}</div><h3>{product.name}</h3><div className="product-row"><strong>{money(product.price,config)}</strong><span className={product.stock < 10 ? 'stock-low' : 'stock-ok'}>{product.stock < 10 ? 'Low stock' : `${product.stock} in stock`}</span></div></div>
  </motion.article>;
}
function ProductsPage({ config }: { config: DashboardConfig }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All products');
  const [sort, setSort] = useState('Featured');
  const categories = ['All products', ...new Set(config.products.map(x=>x.category))];
  const products = useMemo(() => {
    const filtered = config.products.filter(x=>(category==='All products'||x.category===category) && `${x.name} ${x.category}`.toLowerCase().includes(query.toLowerCase()));
    return [...filtered].sort((a,b)=>sort==='Price: low to high'?a.price-b.price:sort==='Price: high to low'?b.price-a.price:Number(!!b.featured)-Number(!!a.featured));
  },[config.products,query,category,sort]);
  return <><section className="products-banner"><div><span className="products-banner-dot"/> Inventory is looking healthy <span className="products-banner-secondary">— {config.products.length} products across {categories.length-1} categories</span></div><span className="banner-check"><Check size={14}/> All synced</span></section>
    <section className="panel product-panel"><div className="table-heading"><div><p className="eyebrow">YOUR CATALOG</p><h2>Products <span className="count-pill">{products.length}</span></h2><p>Browse and manage your product collection.</p></div><button className="primary-btn" onClick={()=>{setQuery('');setCategory('All products');setSort('Featured')}}><Filter size={16}/> Reset filters</button></div><div className="filter-bar"><div className="tab-list" role="group" aria-label="Product category">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="filter-controls"><label className="search-input"><Search size={17}/><input value={query} aria-label="Search products" placeholder="Search products..." onChange={e=>setQuery(e.target.value)}/></label><label className="select-wrap"><select aria-label="Sort products" value={sort} onChange={e=>setSort(e.target.value)}><option>Featured</option><option>Price: low to high</option><option>Price: high to low</option></select><ChevronDown size={14}/></label></div></div><div className="products-grid">{products.map((product,idx)=><ProductCard key={product.id} product={product} config={config} idx={idx}/>)}</div>{!products.length&&<div className="empty-state"><Package size={24}/><b>No products found</b><span>Try another category or search.</span></div>}</section>
  </>;
}
function AnalyticsPage({ config }: { config: DashboardConfig }) {
  const [period, setPeriod] = useState<'7 days' | '30 days' | '90 days'>('30 days');
  const size = period==='7 days'?7:period==='30 days'?24:config.revenue.length;
  const chart = config.revenue.slice(-size);
  return <><Metrics metrics={config.metrics.analytics}/><div className="two-columns wide-left"><section className="panel chart-panel"><SectionHeader eyebrow="TRAFFIC & REVENUE" title="Performance over time" action={<div className="segmented">{(['7 days','30 days','90 days'] as const).map(p=><button key={p} className={period===p?'active':''} onClick={()=>setPeriod(p)}>{p}</button>)}</div>}/><div className="chart-large-value">€84,320 <span className="trend trend-up"><ArrowUpRight size={13}/> +12.8%</span></div><Graph data={chart}/></section><section className="panel traffic-panel"><SectionHeader eyebrow="AUDIENCE" title="Traffic sources" action={<Ellipsis size={18} className="muted"/>}/><Donut traffic={config.traffic}/></section></div><div className="two-columns"><section className="panel funnel-panel"><SectionHeader eyebrow="CUSTOMER JOURNEY" title="Conversion funnel"/><div className="funnel"><div className="funnel-row"><span>Visitors</span><b>24,826</b><div className="funnel-bar" style={{width:'100%'}}/></div><div className="funnel-row"><span>Product views</span><b>12,540</b><div className="funnel-bar" style={{width:'70%',opacity:.85}}/></div><div className="funnel-row"><span>Add to cart</span><b>5,432</b><div className="funnel-bar" style={{width:'46%',opacity:.7}}/></div><div className="funnel-row"><span>Purchases</span><b>1,206</b><div className="funnel-bar" style={{width:'24%',opacity:.58}}/></div></div></section><section className="panel countries-panel"><SectionHeader eyebrow="LOCATION INSIGHTS" title="Top countries"/><div className="countries">{[['France','42%'],['United States','28%'],['Germany','18%'],['Other','12%']].map(([name,value])=><div key={name} className="country-row"><div><span>{name}</span><b>{value}</b></div><div className="progress-track"><span style={{width:value}}/></div></div>)}</div></section></div></>;
}

export default function Dashboard({ config }: { config: DashboardConfig }) {
  const [page, setPage] = useState<PageId>('users');
  const [users, setUsers] = useState<DashboardUser[]>(config.users);
  type Density = 'compact' | 'standard' | 'comfortable';
  const [dark, setDark] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [density, setDensity] = useState<Density>('standard');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const p = JSON.parse(localStorage.getItem('axiom-ui.preferences') || '{}');
      if (typeof p.dark === 'boolean') setDark(p.dark);
      if (typeof p.expanded === 'boolean') setExpanded(p.expanded);
      if (p.density === 'compact' || p.density === 'standard' || p.density === 'comfortable') setDensity(p.density);
    } catch { /* storage unavailable */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem('axiom-ui.preferences', JSON.stringify({dark,expanded,density})); } catch {} } }, [ready,dark,expanded,density]);

  const [mobileNav, setMobileNav] = useState(false);
  useEffect(() => { if (!mobileNav) return; const close = (e: KeyboardEvent) => {if(e.key==='Escape')setMobileNav(false)}; window.addEventListener('keydown',close); return ()=>window.removeEventListener('keydown',close); }, [mobileNav]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const current = NAV.find(x=>x.id===page)!;
  function navigate(id: PageId){setPage(id);setMobileNav(false);setNotificationsOpen(false)}
  return <MotionConfig reducedMotion="user"><div data-density={density} className={`dashboard-root ${dark?'theme-dark':''}`} style={{'--accent':config.brand.accent} as CSSProperties}>
    <div className="app-background"><span className="ambient ambient-one"/><span className="ambient ambient-two"/><span className="ambient ambient-three"/></div>
    <div className="dashboard-shell">
      <aside className={`sidebar ${mobileNav?'sidebar-open':''} ${expanded?'sidebar-expanded':''}`} aria-label="Main navigation"><div className="sidebar-logo" title={config.brand.name}><span>{config.brand.initial}</span><i/></div><div className="side-group"><span className="side-group-label">WORKSPACE</span><button className="side-button nav-size" title={expanded?"Collapse menu":"Expand menu"} aria-label={expanded?"Collapse menu":"Expand menu"} aria-expanded={expanded} onClick={()=>setExpanded(x=>!x)}>{expanded?<ChevronLeft size={19}/>:<ChevronRight size={19}/>}<span className="side-tooltip">{expanded?"Collapse":"Expand"}</span></button>{NAV.map(item=><button title={item.label} aria-label={item.label} aria-current={page===item.id?'page':undefined} key={item.id} className={`side-button ${page===item.id?'selected':''}`} onClick={()=>navigate(item.id)}><item.icon size={19} strokeWidth={1.75}/><span className="side-tooltip">{item.label}</span></button>)}</div><div className="sidebar-spacer"/><div className="side-group side-bottom"><button title="Help" aria-label="Help" onClick={()=>setHelpOpen(x=>!x)} className={`side-button ${helpOpen?'selected':''}`}><LifeBuoy size={19}/></button><button title="Toggle dark mode" aria-label="Toggle dark mode" aria-pressed={dark} onClick={()=>setDark(x=>!x)} className="side-button">{dark?<Sun size={19}/>:<Moon size={19}/>}</button><button title="Settings" aria-label="Settings" onClick={()=>setHelpOpen(x=>!x)} className="side-button"><Settings2 size={19}/></button></div><div className="side-profile"><span>{config.profile.initials}</span></div></aside>
      {mobileNav&&<button className="mobile-scrim" aria-label="Close menu" onClick={()=>setMobileNav(false)}/>}
      <div className="content-column"><header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-btn" aria-label="Open menu" onClick={()=>setMobileNav(true)}><Menu size={20}/></button><span className="breadcrumb-brand">{config.brand.name}</span><ChevronRight size={14} className="crumb-chevron"/><span className="breadcrumb-page">{current.label}</span></div><div className="topbar-right"><span className="topbar-date"><CalendarDays size={15}/> {new Intl.DateTimeFormat(config.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</span><div className="topbar-divider"/><div className="notification-wrapper"><button className="topbar-icon" aria-label="Notifications" onClick={()=>setNotificationsOpen(x=>!x)}><Bell size={18}/><span/></button>{notificationsOpen&&<div className="notifications-popover"><b>Notifications</b><p>Everything is up to date.</p><span>Demo notification center</span></div>}</div><span className="topbar-user"><span className="avatar-tiny">{config.profile.initials}</span><span>{config.profile.name}</span><ChevronDown size={14}/></span></div></header>
      <main className="main-content"><div className="page-heading"><div><p className="page-eyebrow">DASHBOARD <span>·</span> {current.label.toUpperCase()}</p><h1>{current.label}<span className="heading-period">.</span></h1><p className="page-description">{page==='overview'?'Your business at a glance. Everything in one beautiful place.':page==='users'?'Manage and monitor your community in one place.':page==='products'?'A curated view of your entire product universe.':'Understand your performance, discover what matters.'}</p></div><div className="heading-actions"><span className="period-pill"><span className="online-dot"/> System online</span><button className="outline-btn small-btn" onClick={()=>setPage('overview')}><LayoutGrid size={16}/> Workspace</button></div></div>
      <div className="axiom-prefs"><label>Table density <select value={density} onChange={e=>setDensity(e.target.value as Density)}><option value="compact">Compact</option><option value="standard">Standard</option><option value="comfortable">Comfortable</option></select></label></div><AnimatePresence mode="wait"><motion.div key={page} initial={{opacity:0,y:7}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-7}} transition={{duration:.2}} className="page-body">{page==='overview'&&<Overview config={config} changePage={navigate}/>}{page==='users'&&<UsersPage config={config} users={users} setUsers={setUsers}/>}{page==='products'&&<ProductsPage config={config}/>}{page==='analytics'&&<AnalyticsPage config={config}/>}</motion.div></AnimatePresence>
      <footer className="app-footer"><span>© 2026 {config.brand.name} · Axiom UI</span><span>Designed for beautiful workflows <span className="footer-star">✦</span></span></footer>
      </main></div></div>
      {helpOpen&&<div className="help-float"><button aria-label="Close help" onClick={()=>setHelpOpen(false)}><X size={16}/></button><CircleHelp size={20}/><b>Demo dashboard</b><p>Switch sections with the sidebar. Users can be added, edited, filtered and exported. All data is local demo content.</p><div><Shield size={14}/> No external service connected</div></div>}
    </div></MotionConfig>;
}
