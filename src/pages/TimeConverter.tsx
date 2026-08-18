import { useState, useEffect, useCallback } from 'react';

const ALL_ZONES = [
  { id: 'UTC',                  label: 'UTC',                  short: 'UTC'  },
  { id: 'America/Los_Angeles',  label: 'Pacific Time (PST)',   short: 'PST'  },
  { id: 'America/Toronto',      label: 'Canada Eastern (CA)',  short: 'CA'   },
  { id: 'America/New_York',     label: 'New York (ET)',         short: 'ET'   },
  { id: 'America/Chicago',      label: 'Chicago (CT)',          short: 'CT'   },
  { id: 'Europe/London',        label: 'Europe / London (EU)', short: 'EU'   },
  { id: 'Europe/Paris',         label: 'Paris (CET)',           short: 'CET'  },
  { id: 'Europe/Berlin',        label: 'Berlin (CET)',          short: 'CET'  },
  { id: 'Asia/Riyadh',          label: 'Saudi Arabia (KSA)',   short: 'KSA'  },
  { id: 'Asia/Dubai',           label: 'UAE / Dubai (GST)',     short: 'UAE'  },
  { id: 'Asia/Kolkata',         label: 'India (IST)',           short: 'IST'  },
  { id: 'Asia/Singapore',       label: 'Singapore (SGT)',       short: 'SGT'  },
  { id: 'Asia/Tokyo',           label: 'Tokyo (JST)',           short: 'JST'  },
  { id: 'Asia/Shanghai',        label: 'Shanghai (CST)',        short: 'CST'  },
  { id: 'Australia/Sydney',     label: 'Australia / Sydney',   short: 'AU'   },
];

// Always-pinned (cannot be removed)
const PINNED = ['Asia/Kolkata'];

const fmt = (date: Date, tz: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { ...opts, timeZone: tz }).format(date);

const getHourInZone = (utcDate: Date, tz: string): number =>
  parseInt(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: tz }).format(utcDate), 10) % 24;

const getOffsetLabel = (tz: string, date: Date): string => {
  const utcMs = date.getTime();
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const diff = (tzDate.getTime() - utcDate.getTime()) / 3600000;
  const sign = diff >= 0 ? '+' : '−';
  const h = Math.floor(Math.abs(diff));
  const m = Math.round((Math.abs(diff) - h) * 60);
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2,'0')}` : ''}`;
};

const hourBg = (h: number) => {
  if (h >= 9 && h <= 17)  return '#dcfce7'; // work – green
  if (h >= 7 && h < 9)   return '#fef9c3'; // early – yellow
  if (h > 17 && h <= 21) return '#fef3c7'; // evening – amber
  return '#f1f5f9';                          // night – slate
};
const hourFg = (h: number) => {
  if (h >= 9 && h <= 17)  return '#15803d';
  if (h >= 7 && h < 9)   return '#854d0e';
  if (h > 17 && h <= 21) return '#92400e';
  return '#94a3b8';
};

const TimeConverter = () => {
  const [now, setNow] = useState(new Date());
  const [activeZones, setActiveZones] = useState<string[]>([
    'America/Los_Angeles', // PST  UTC−7
    'America/Toronto',     // CA   UTC−4
    'UTC',                 //      UTC+0
    'Europe/London',       // EU   UTC+1
    'Asia/Riyadh',         // KSA  UTC+3
    'Asia/Dubai',          // UAE  UTC+4
    'Asia/Kolkata',        // IST  UTC+5:30  (pinned)
    'Australia/Sydney',    // AU   UTC+10
  ]);
  const [hoverHour, setHoverHour] = useState<number | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [customTs, setCustomTs] = useState<Date | null>(null);
  const [customError, setCustomError] = useState('');
  const [addZone, setAddZone] = useState('');

  // Live clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const displayDate = customTs ?? now;

  // Current UTC hour for the timeline reference
  const currentUtcHour = now.getUTCHours();

  const handleCustom = useCallback((val: string) => {
    setCustomInput(val);
    setCustomError('');
    if (!val.trim()) { setCustomTs(null); return; }
    const d = new Date(val);
    if (isNaN(d.getTime())) {
      // try unix timestamp
      const n = Number(val);
      if (!isNaN(n)) { setCustomTs(new Date(n > 1e10 ? n : n * 1000)); return; }
      setCustomError('Invalid date — try ISO format or Unix timestamp');
    } else {
      setCustomTs(d);
    }
  }, []);

  const addZoneToList = () => {
    if (addZone && !activeZones.includes(addZone)) {
      setActiveZones(z => [...z, addZone]);
    }
    setAddZone('');
  };

  const removeZone = (id: string) => {
    if (PINNED.includes(id)) return;
    setActiveZones(z => z.filter(z => z !== id));
  };

  const zones = activeZones.map(id => ALL_ZONES.find(z => z.id === id)).filter(Boolean) as typeof ALL_ZONES;
  const available = ALL_ZONES.filter(z => !activeZones.includes(z.id));

  // For the timeline: 24 columns representing UTC hours 0–23
  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="tc-root">
      {/* Header */}
      <div className="tc-header">
        <div className="tc-header-left">
          <span className="tc-title">Time Zone Converter</span>
          <span className="tc-subtitle">Default IST · Always shown</span>
        </div>
        <div className="tc-header-right">
          <div className="tc-now-badge">
            <span className="tc-now-dot" />
            <span className="tc-now-time">
              {fmt(now, 'Asia/Kolkata', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} IST
            </span>
          </div>
        </div>
      </div>

      {/* Current time cards */}
      <div className="tc-cards">
        {zones.map(z => {
          const isPinned = PINNED.includes(z.id);
          const timeStr  = fmt(displayDate, z.id, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
          const dateStr  = fmt(displayDate, z.id, { weekday: 'short', month: 'short', day: 'numeric' });
          const offset   = getOffsetLabel(z.id, now);
          return (
            <div key={z.id} className={`tc-card${isPinned ? ' pinned' : ''}`}>
              {!isPinned && (
                <button className="tc-card-remove" onClick={() => removeZone(z.id)} title="Remove">✕</button>
              )}
              <div className="tc-card-label">{z.label}</div>
              <div className="tc-card-time">{timeStr}</div>
              <div className="tc-card-date">{dateStr}</div>
              <div className="tc-card-offset">{offset}</div>
            </div>
          );
        })}

        {/* Add zone card */}
        {available.length > 0 && (
          <div className="tc-card tc-card-add">
            <div className="tc-card-label">Add timezone</div>
            <select
              className="tc-add-select"
              value={addZone}
              onChange={e => setAddZone(e.target.value)}
            >
              <option value="">Select…</option>
              {available.map(z => (
                <option key={z.id} value={z.id}>{z.label}</option>
              ))}
            </select>
            <button
              className="ws-btn ws-btn-primary ws-btn-sm"
              style={{ marginTop: 8 }}
              onClick={addZoneToList}
              disabled={!addZone}
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Custom time input */}
      <div className="tc-custom">
        <div className="tc-custom-label">Convert a specific time</div>
        <div className="tc-custom-row">
          <input
            className={`tc-custom-input${customError ? ' error' : ''}`}
            type="text"
            placeholder="2024-06-15T09:00:00Z  or  1718438400  or  Jun 15 2024 09:00 UTC"
            value={customInput}
            onChange={e => handleCustom(e.target.value)}
          />
          {customTs && (
            <button className="ws-btn ws-btn-ghost ws-btn-sm" onClick={() => { setCustomInput(''); setCustomTs(null); }}>
              Clear → use live clock
            </button>
          )}
        </div>
        {customError && <div className="tc-custom-error">{customError}</div>}
        {customTs && (
          <div className="tc-custom-hint">
            Showing: {customTs.toISOString()} — <strong>Unix: {Math.floor(customTs.getTime()/1000)}</strong>
          </div>
        )}
      </div>

      {/* Timeline grid */}
      <div className="tc-timeline-wrap">
        <div className="tc-timeline-label">
          24-hour timeline
          <span className="tc-tl-legend">
            <span className="tc-tl-dot" style={{ background: '#dcfce7', border: '1px solid #86efac' }} /> Work
            <span className="tc-tl-dot" style={{ background: '#fef9c3', border: '1px solid #fde047' }} /> Morning
            <span className="tc-tl-dot" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }} /> Evening
            <span className="tc-tl-dot" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }} /> Night
          </span>
        </div>
        <div className="tc-timeline-scroll">
          <table className="tc-timeline">
            <thead>
              <tr>
                <th className="tc-tl-zone-header">Zone</th>
                {HOURS.map(h => (
                  <th
                    key={h}
                    className={`tc-tl-h-header${h === currentUtcHour ? ' current' : ''}`}
                    onMouseEnter={() => setHoverHour(h)}
                    onMouseLeave={() => setHoverHour(null)}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map(z => (
                <tr key={z.id}>
                  <td className="tc-tl-zone-cell">
                    <span className="tc-tl-zone-name">{z.short}</span>
                    <span className="tc-tl-zone-offset">{getOffsetLabel(z.id, now)}</span>
                  </td>
                  {HOURS.map(utcH => {
                    // Create a date at this UTC hour today
                    const d = new Date(now);
                    d.setUTCHours(utcH, 0, 0, 0);
                    const localH = getHourInZone(d, z.id);
                    const isCurrent = utcH === currentUtcHour;
                    const isHover   = utcH === hoverHour;
                    return (
                      <td
                        key={utcH}
                        className={`tc-tl-cell${isCurrent ? ' current' : ''}${isHover ? ' hover' : ''}`}
                        style={{ background: isHover ? '#eeeeff' : hourBg(localH), color: isHover ? '#5b5bd6' : hourFg(localH) }}
                        onMouseEnter={() => setHoverHour(utcH)}
                        onMouseLeave={() => setHoverHour(null)}
                        title={`UTC ${utcH}:00 = ${z.short} ${localH}:00`}
                      >
                        {localH}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tc-tl-footer">Hover any column to compare the same moment across all zones. Current UTC hour highlighted.</div>
      </div>
    </div>
  );
};

export default TimeConverter;
