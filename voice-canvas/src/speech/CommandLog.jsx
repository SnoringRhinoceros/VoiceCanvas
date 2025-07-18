// src/speech/CommandLog.jsx
import { useCommandBus } from '../context/CommandContext';

export function CommandLog() {
  const { log } = useCommandBus();

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: '#1f1f1f',
      color: '#fff',
      padding: '10px 12px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxHeight: '200px',
      width: '240px',
      overflowY: 'auto',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      zIndex: 9999
    }}>
      <strong style={{ fontSize: '13px' }}>🗣️ Command Log</strong>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '6px' }}>
        {log.map((entry, idx) => (
          <li key={idx} style={{ marginBottom: '4px' }}>
            <span style={{ opacity: 0.5, marginRight: 4 }}>
              [{entry.time.toLocaleTimeString().split(' ')[0]}]
            </span>
            {entry.command}
          </li>
        ))}
      </ul>
    </div>
  );
}
