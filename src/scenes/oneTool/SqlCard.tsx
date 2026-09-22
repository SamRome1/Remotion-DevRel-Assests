import React from 'react';
import { Database } from 'lucide-react';
import { Card, Pill } from './Card';
import { CODE, GREEN_INK, GREEN_TINT, INK, INK_2, T, sp } from './theme';

type Tok = { t: string; kw?: boolean };
const SQL: Tok[][] = [
  [{ t: 'select ', kw: true }, { t: 'u.id, ' }, { t: 'count', kw: true }, { t: '(o.*) ' }, { t: 'as ', kw: true }, { t: 'orders' }],
  [{ t: 'from ', kw: true }, { t: 'users u' }],
  [{ t: 'join ', kw: true }, { t: 'orders o ' }, { t: 'on ', kw: true }, { t: 'o.user_id = u.id' }],
  [{ t: 'where ', kw: true }, { t: 'o.created_at > ' }, { t: 'now', kw: true }, { t: "() - interval '30 days'" }],
  [{ t: 'group by ', kw: true }, { t: 'u.id' }],
  [{ t: 'order by ', kw: true }, { t: 'orders ' }, { t: 'desc', kw: true }, { t: ';' }],
];

const T_TYPE = T.SQL + 10;
const CPF = 4;

export const SqlCard: React.FC<{ frame: number; x: number; y: number; w: number; h: number }> = ({ frame, x, y, w, h }) => {
  const typed = Math.max(0, Math.floor((frame - T_TYPE) * CPF));
  const total = SQL.reduce((a, l) => a + l.reduce((b, t) => b + t.t.length, 0), 0);
  const done = typed >= total;
  const resP = sp(frame, T_TYPE + Math.ceil(total / CPF) + 4);

  let consumed = 0;
  return (
    <Card
      x={x} y={y} w={w} h={h} frame={frame} at={T.SQL} title="query.sql"
      right={done ? (
        <div style={{ opacity: resP, transform: `translateX(${(1 - resP) * 10}px)` }}>
          <Pill color={GREEN_INK} bg={GREEN_TINT}><Database size={14} strokeWidth={2} color={GREEN_INK} />1,284 rows · 12 ms</Pill>
        </div>
      ) : null}
    >
      <div style={{ fontFamily: CODE, fontSize: 20, lineHeight: '36px', color: INK, whiteSpace: 'pre' }}>
        {SQL.map((line, i) => (
          <div key={i}>
            {line.map((tok, k) => {
              const n = Math.min(tok.t.length, Math.max(0, typed - consumed));
              consumed += tok.t.length;
              return (
                <span key={k} style={{ color: tok.kw ? GREEN_INK : INK_2, fontWeight: tok.kw ? 700 : 400 }}>
                  {tok.t.slice(0, n)}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
};
