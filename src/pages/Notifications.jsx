import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/api';
import useLoad from '../hooks/useLoad';
import { formatDateTime } from '../utils/format';
import PageShell from '../components/PageShell';
import AsyncView from '../components/AsyncView';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

export default function Notifications() {
  const state = useLoad(() => getNotifications());
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function open(n) {
    try { if (!n.isRead) await markNotificationRead(n.id); } catch { /* opening the page matters more */ }
    window.dispatchEvent(new Event('campusbridge:notifications'));
    if (n.link) navigate(n.link); else state.reload();
  }
  async function readAll() {
    setError('');
    try { await markAllNotificationsRead(); window.dispatchEvent(new Event('campusbridge:notifications')); state.reload(); }
    catch (err) { setError(err.message); }
  }

  return (
    <PageShell title="Notifications" subtitle="Updates about your courses, grades and applications." maxWidth={720}
      action={state.data?.unread > 0 && <button type="button" className="btn btn-secondary btn-sm" onClick={readAll}><CheckCheck size={16} /> Mark all as read</button>}>
      <Alert>{error}</Alert>
      <AsyncView state={state} loadingText="Loading notifications...">
        {({ data }) => data.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications yet" description="You will be notified here about grades, new assignments and application decisions." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.map((n) => (
              <button key={n.id} type="button" onClick={() => open(n)} className="card card-hover"
                style={{ padding: '0.9rem 1.1rem', textAlign: 'left', width: '100%', display: 'flex', gap: 12, alignItems: 'flex-start', borderLeft: n.isRead ? undefined : '3px solid var(--teal-600)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: n.isRead ? 400 : 600, fontSize: '0.92rem' }}>{n.message}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{formatDateTime(n.createdAt)}</div>
                </div>
                {!n.isRead && <span className="badge badge-teal">New</span>}
              </button>
            ))}
          </div>
        )}
      </AsyncView>
    </PageShell>
  );
}
