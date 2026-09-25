import { PoteMode, TabId } from '../types';
import { useAppStore } from '../store/useAppStore';

export interface ModeCopy {
  /** "do casal" / "do grupo" / "meu" */
  potOwner: string;
  /** Home header, e.g. "Reserva do Casal" */
  reserveTitle: string;
  muralTitle: string;
  muralSubtitle: string;
  /** Who you invite */
  inviteTarget: string;
  inviteCta: string;
  /** Capsule recipient wording */
  capsuleHint: string;
  capsulePlaceholder: string;
  /** Label for the other people in the pot */
  othersLabel: string;
}

export const MODE_OPTIONS: { id: PoteMode; emoji: string; title: string; subtitle: string; gradient: string }[] = [
  {
    id: 'solo',
    emoji: '🌷',
    title: 'Só eu',
    subtitle: 'Minhas metas, meu ritmo. Autocuidado com o dinheiro.',
    gradient: 'from-amber-200/70 via-rose-100/60 to-transparent',
  },
  {
    id: 'casal',
    emoji: '💞',
    title: 'Em casal',
    subtitle: 'Sonhos a dois, mêsversário, cartas e duelos.',
    gradient: 'from-rose-300/70 via-pink-100/60 to-transparent',
  },
  {
    id: 'grupo',
    emoji: '🫶',
    title: 'Com amigos',
    subtitle: 'Viagem da turma, vaquinha, república ou família.',
    gradient: 'from-violet-300/70 via-fuchsia-100/60 to-transparent',
  },
];

export function getModeCopy(mode: PoteMode, groupName = ''): ModeCopy {
  const group = groupName.trim();
  switch (mode) {
    case 'solo':
      return {
        potOwner: 'meu',
        reserveTitle: 'Minha Reserva',
        muralTitle: 'Meu Mural',
        muralSubtitle: 'Inspirações, memórias e conquistas',
        inviteTarget: 'alguém',
        inviteCta: 'Convidar alguém para o pote',
        capsuleHint: 'Cartas para o seu eu do futuro.',
        capsulePlaceholder: 'Querida eu do futuro, quando você ler isso...',
        othersLabel: 'Você',
      };
    case 'grupo':
      return {
        potOwner: 'do grupo',
        reserveTitle: group ? `Pote ${group}` : 'Reserva do Grupo',
        muralTitle: group ? `Mural ${group}` : 'Mural do Grupo',
        muralSubtitle: 'Planos, fotos e conquistas da turma',
        inviteTarget: 'amigos',
        inviteCta: 'Convidar amigos',
        capsuleHint: 'Cartas lacradas para a turma abrir no futuro.',
        capsulePlaceholder: 'Galera, quando vocês lerem isso...',
        othersLabel: 'A turma',
      };
    default:
      return {
        potOwner: 'do casal',
        reserveTitle: 'Reserva de Casal',
        muralTitle: 'Mural de Casal',
        muralSubtitle: 'Inspirações, memórias e histórico',
        inviteTarget: 'seu par',
        inviteCta: 'Convidar meu amor',
        capsuleHint: 'Cartas lacradas para abrir no futuro.',
        capsulePlaceholder: 'Meu amor, quando você ler isso...',
        othersLabel: 'Seu par',
      };
  }
}

/** Tabs available in each mode (the rest fall back to Home). */
export const MODE_TABS: Record<PoteMode, TabId[]> = {
  solo: ['home', 'missoes', 'extrato', 'mural', 'config'],
  casal: ['home', 'missoes', 'extrato', 'disputa', 'mural', 'lovecards', 'config'],
  grupo: ['home', 'missoes', 'extrato', 'disputa', 'mural', 'config'],
};

export function useModeCopy() {
  const mode = useAppStore((s) => s.mode);
  const groupName = useAppStore((s) => s.groupName);
  return { mode, ...getModeCopy(mode, groupName) };
}
