import { Trophy } from 'lucide-react';
import { getLeaderboard } from '../services/api';
import useLoad from '../hooks/useLoad';
import PageShell from '../components/PageShell';
import AsyncView from '../components/AsyncView';
import EmptyState from '../components/EmptyState';

export default function Leaderboard() {
  const state = useLoad(() => getLeaderboard().then((r) => r.data));
  return (
    <PageShell title="Leaderboard" subtitle="Top students by points earned from graded assignments." maxWidth={720}>
      <AsyncView state={state} loadingText="Loading the leaderboard...">
        {(rows) => rows.length === 0 ? (
          <EmptyState icon={Trophy} title="No rankings yet" description="Points appear here once instructors grade submissions." />
        ) : (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.8rem 1rem' }}>Rank</th><th style={{ padding: '0.8rem 1rem' }}>Student</th>
                  <th style={{ padding: '0.8rem 1rem' }}>University</th><th style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.rank} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>{r.rank}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>{r.name}</td>
                    <td style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)' }}>{r.university}</td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 600 }}>{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AsyncView>
    </PageShell>
  );
}
