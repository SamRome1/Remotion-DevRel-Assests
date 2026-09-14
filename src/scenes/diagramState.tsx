import React from 'react';
import { SlotBadge, SlotRow } from '../Components/system';
import type { SlotId } from '../Components/system';

/**
 * Settled slot contents — what earlier scenes have already docked into the
 * ArchDiagram. Each scene spreads the state it inherits, then animates its
 * own additions on top.
 */
export const frontendSettled = (
  <SlotRow>
    <SlotBadge src="assets/react.svg" animate={false} />
    <SlotBadge src="assets/nextjs.svg" animate={false} />
  </SlotRow>
);

export const agentSettled = <SlotBadge src="assets/rust.svg" animate={false} />;

export const backendSettled = <SlotBadge src="assets/python.svg" word="Python" animate={false} />;

export const infraSettled = (
  <>
    <SlotBadge src="assets/kubernetes.svg" word="Kubernetes" animate={false} />
    <SlotBadge src="assets/azure.svg" word="Azure" animate={false} />
  </>
);

export const afterScene2: Partial<Record<SlotId, React.ReactNode>> = { frontend: frontendSettled };
export const afterScene3: Partial<Record<SlotId, React.ReactNode>> = { ...afterScene2, agent: agentSettled };
export const afterScene4: Partial<Record<SlotId, React.ReactNode>> = {
  ...afterScene3,
  backend: backendSettled,
  infra: infraSettled,
};
