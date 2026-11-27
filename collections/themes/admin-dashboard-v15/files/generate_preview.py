"""Generate a static HTML visual check of the Users view, without JavaScript/npm."""
import json
from pathlib import Path
from html import escape
root = Path(__file__).resolve().parent
cfg = json.loads((root/'src/dashboard.config.json').read_text())
icons = {
 'grid':'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 'users':'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 'box':'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 7v10l9 5 9-5V7M12 12v10"/>',
 'chart':'<path d="M3 3v18h18M7 16v-4M12 16V7M17 16v-6"/>',
 'bell':'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
 'search':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
 'settings':'<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="8" cy="7" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="17" r="2"/>',
 'help':'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a3 3 0 0 1 5 2c0 2-2.5 2-2.5 4M12 18h.01"/>',
 'calendar':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
 'plus':'<path d="M12 5v14M5 12h14"/>',
 'download':'<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>',
 'dots':'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
 'up':'<path d="M7 17 17 7M9 7h8v8"/>',
 'chevron':'<path d="m9 18 6-6-6-6"/>',
 'down':'<path d="m6 9 6 6 6-6"/>',
 'user':'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 'growth':'<path d="M3 17l7-7 4 4 7-7"/>',
}
def ico(name,size=18):
 return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{icons[name]}</svg>'

rows=[]
for i,user in enumerate(cfg['users'][:6]):
 rows.append(f'''<tr><td><div class="user-cell"><div class="avatar avatar-{i%6}">{escape(user['avatar'])}</div><div><strong>{escape(user['name'])}</strong><span>{escape(user['email'])}</span></div></div></td><td><span class="role-label">{escape(user['role'])}{ico('down',12)}</span></td><td><span class="status status-{user['status'].lower()}"><span></span>{escape(user['status'])}</span></td><td>{user['orders']}</td><td class="amount">{user['spent']:,} €</td><td class="date-cell">{user['joined']}</td><td><span class="icon-btn">{ico('dots',20)}</span></td></tr>''')
metrics=[]
for i,m in enumerate(cfg['metrics']['users']):
 metricico= {'users':'users','growth':'growth','clock':'clock'}.get(m['icon'],'grid')
 metrics.append(f'''<article class="stat-card"><div class="stat-top"><span class="stat-icon">{ico(metricico,17)}</span><span class="stat-corner">{ico('up',16)}</span></div><div class="stat-value">{escape(m['value'])}</div><div class="stat-footer"><span class="muted">{escape(m['label'])}</span><span class="trend trend-{m['trend']}">{ico('up',12)} {escape(m['change'])}</span></div></article>''')

html=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Dashboard static preview</title><link rel="stylesheet" href="src/styles.css"/></head><body><div class="dashboard-root"><div class="app-background"><span class="ambient ambient-one"></span><span class="ambient ambient-two"></span><span class="ambient ambient-three"></span></div><div class="dashboard-shell"><aside class="sidebar"><div class="sidebar-logo"><span>A</span><i></i></div><div class="side-group"><span class="side-group-label">WORKSPACE</span><span class="side-button">{ico('grid')}</span><span class="side-button selected">{ico('users')}</span><span class="side-button">{ico('box')}</span><span class="side-button">{ico('chart')}</span></div><div class="sidebar-spacer"></div><div class="side-group side-bottom"><span class="side-button">{ico('help')}</span><span class="side-button">{ico('settings')}</span></div><div class="side-profile"><span>AM</span></div></aside><div class="content-column"><header class="topbar"><div class="topbar-left"><span class="breadcrumb-brand">AUREL</span><span class="crumb-chevron">{ico('chevron',14)}</span><span class="breadcrumb-page">Users</span></div><div class="topbar-right"><span class="topbar-date">{ico('calendar',15)} Sunday, 22 November 2026</span><div class="topbar-divider"></div><span class="topbar-icon">{ico('bell',18)}<span></span></span><span class="topbar-user"><span class="avatar-tiny">AM</span><span>Alex Morgan</span>{ico('down',14)}</span></div></header><main class="main-content"><div class="page-heading"><div><p class="page-eyebrow">DASHBOARD <span>·</span> USERS</p><h1>Users<span class="heading-period">.</span></h1><p class="page-description">Manage and monitor your community in one place.</p></div><div class="heading-actions"><span class="period-pill"><span class="online-dot"></span> System online</span><span class="outline-btn small-btn">{ico('grid',16)} Workspace</span></div></div><div class="page-body"><div class="stats-grid">{''.join(metrics)}</div><section class="panel user-panel"><div class="table-heading"><div><p class="eyebrow">USER DIRECTORY</p><h2>All users <span class="count-pill">9</span></h2><p>Manage your customers, roles and access.</p></div><div class="table-actions"><span class="outline-btn">{ico('download',16)} Export CSV</span><span class="primary-btn">{ico('plus',17)} Add user</span></div></div><div class="filter-bar"><div class="tab-list"><button class="active">All</button><button>Active</button><button>Pending</button><button>Inactive</button></div><div class="filter-controls"><label class="search-input">{ico('search',17)}<input disabled placeholder="Search users..."></label><label class="select-wrap">{ico('settings',15)}<select disabled><option>All roles</option></select>{ico('down',14)}</label></div></div><div class="table-scroll"><table class="user-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Orders</th><th>Amount spent</th><th>Joined</th><th></th></tr></thead><tbody>{''.join(rows)}</tbody></table></div><div class="table-footer"><span>Showing 1–6 of 9 users</span><div class="pagination"><button>‹</button><span>1 / 2</span><button>›</button></div></div></section></div><footer class="app-footer"><span>© 2026 AUREL · Dashboard V15</span><span>Designed for beautiful workflows <span class="footer-star">✦</span></span></footer></main></div></div></div></body></html>'''
(root/'preview-users.html').write_text(html)
print('Created static HTML preview (not interactive).')
