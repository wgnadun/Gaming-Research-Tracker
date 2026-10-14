import { PhaseInfo, PhaseId } from '../types';

export const PHASES: Record<PhaseId, PhaseInfo> = {
  P0: {
    id: 'P0',
    code: 'Phase P0',
    name: 'Project Foundations',
    goal: 'Establish the development environment and software architecture.',
    order: 0,
  },
  P1: {
    id: 'P1',
    code: 'Phase P1',
    name: 'Asset Analysis and Validation',
    goal: 'Automatically extract useful information from 3D assets.',
    order: 1,
  },
  P2: {
    id: 'P2',
    code: 'Phase P2',
    name: 'Asset Optimization Modules',
    goal: 'Implement the five core optimization techniques.',
    order: 2,
  },
  P3: {
    id: 'P3',
    code: 'Phase P3',
    name: 'Unreal Engine Integration',
    goal: 'Automatically import optimized assets and evaluate them inside Unreal Engine.',
    order: 3,
  },
  P4: {
    id: 'P4',
    code: 'Phase P4',
    name: 'Automated Evaluation',
    goal: 'Automatically measure optimization results.',
    order: 4,
  },
  P5: {
    id: 'P5',
    code: 'Phase P5',
    name: 'Workflow Orchestration and Baselines',
    goal: 'Build a complete non-agentic optimization pipeline.',
    order: 5,
  },
  P6: {
    id: 'P6',
    code: 'Phase P6',
    name: 'Agentic AI Integration',
    goal: 'Implement autonomous optimization decision-making.',
    order: 6,
  },
  P7: {
    id: 'P7',
    code: 'Phase P7',
    name: 'Experiments and Research Validation',
    goal: 'Evaluate the proposed agentic framework scientifically.',
    order: 7,
  },
};

export const PHASE_LIST: PhaseInfo[] = Object.values(PHASES).sort((a, b) => a.order - b.order);
