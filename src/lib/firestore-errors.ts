import { auth } from '../firebase';
import { useAppStore } from '../store/useAppStore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  code?: string;
  operationType: OperationType;
  path: string | null;
  userId: string | undefined;
}

const READ_OPERATIONS = new Set([OperationType.LIST, OperationType.GET]);

function friendlyMessage(code: string | undefined, operationType: OperationType): string {
  switch (code) {
    case 'permission-denied':
      return 'Você não tem permissão para realizar esta ação.';
    case 'unavailable':
      return 'Sem conexão. Suas alterações serão sincronizadas quando a internet voltar.';
    case 'resource-exhausted':
      return 'Limite de uso atingido. Tente novamente em alguns minutos.';
    case 'invalid-argument':
      return 'Dados inválidos. Verifique as informações e tente novamente.';
    default:
      return READ_OPERATIONS.has(operationType)
        ? 'Não foi possível carregar os dados agora.'
        : 'Não foi possível salvar. Tente novamente.';
  }
}

/**
 * Logs a Firestore error and informs the user with a toast.
 * It never throws: throwing from snapshot listeners or async handlers
 * produced unhandled rejections and left the app stuck on loading screens.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const code = (error as { code?: string } | null)?.code;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    code,
    operationType,
    path,
    userId: auth.currentUser?.uid,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));

  // Offline reads are served from the local cache; no need to alarm the user.
  if (code === 'unavailable' && READ_OPERATIONS.has(operationType)) return;

  try {
    useAppStore.getState().addToast('Ops!', friendlyMessage(code, operationType), 'info');
  } catch {
    /* store not ready */
  }
}
