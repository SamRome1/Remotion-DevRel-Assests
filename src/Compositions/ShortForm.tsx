import React from 'react';
import { AbsoluteFill, Series } from 'remotion';
import { colors } from '../theme';
import * as S from '../scenes';

/** Ordered scene list — total duration (2700f) is derived from this. */
export const SHORT_FORM_SCENES = [
  { id: 'ColdOpen', component: S.ColdOpen, duration: S.COLD_OPEN_DURATION }, // 0–135
  { id: 'FrontendReveal', component: S.FrontendReveal, duration: S.FRONTEND_REVEAL_DURATION }, // 135–420
  { id: 'CodexRewrite', component: S.CodexRewrite, duration: S.CODEX_REWRITE_DURATION }, // 420–750
  { id: 'BackendStack', component: S.BackendStack, duration: S.BACKEND_STACK_DURATION }, // 750–855
  { id: 'CollapseToElephant', component: S.CollapseToElephant, duration: S.COLLAPSE_DURATION }, // 855–1065
  { id: 'ShardsOne', component: S.ShardsOne, duration: S.SHARDS_ONE_DURATION }, // 1065–1365
  { id: 'OpenLoop', component: S.OpenLoop, duration: S.OPEN_LOOP_DURATION }, // 1365–1470
  { id: 'RuleDenied', component: S.RuleDenied, duration: S.RULE_DENIED_DURATION }, // 1470–1635
  { id: 'RulesAndExile', component: S.RulesAndExile, duration: S.RULES_EXILE_DURATION }, // 1635–2100
  { id: 'NineMonths', component: S.NineMonths, duration: S.NINE_MONTHS_DURATION }, // 2100–2295
  { id: 'TheReceipt', component: S.TheReceipt, duration: S.RECEIPT_DURATION }, // 2295–2490
  { id: 'Closer', component: S.Closer, duration: S.CLOSER_DURATION }, // 2490–2700
] as const;

export const SHORT_FORM_DURATION = SHORT_FORM_SCENES.reduce((n, s) => n + s.duration, 0);

export const ShortForm: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.bg }}>
    <Series>
      {SHORT_FORM_SCENES.map((s) => (
        <Series.Sequence key={s.id} durationInFrames={s.duration} name={s.id}>
          <s.component />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
