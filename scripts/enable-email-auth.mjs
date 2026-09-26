import { readFile } from 'node:fs/promises';
import { GoogleAuth } from 'google-auth-library';

const config = JSON.parse(await readFile(new URL('../firebase-applet-config.json', import.meta.url), 'utf8'));
const projectId = process.env.FIREBASE_PROJECT_ID || config.projectId;
if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId)) {
  throw new Error('FIREBASE_PROJECT_ID inválido.');
}
const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`;
const dryRun = process.argv.includes('--dry-run');

async function main() {
  if (dryRun) {
    console.log(`[dry-run] Projeto ${projectId}: habilitar signIn.email.enabled. Nenhuma alteração enviada.`);
    return;
  }
  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await auth.getClient();
  const current = await client.request({ url });
  if (current.data.signIn?.email?.enabled === true) {
    console.log(`Login por e-mail/senha já está ativo em ${projectId}.`);
    return;
  }
  // Atualiza somente a ativação; preserva login por link e os outros provedores.
  await client.request({
    url,
    method: 'PATCH',
    params: { updateMask: 'signIn.email.enabled' },
    data: { signIn: { email: { enabled: true } } },
  });
  const verified = await client.request({ url });
  if (verified.data.signIn?.email?.enabled !== true) {
    throw new Error('O Firebase não confirmou a ativação do provedor.');
  }
  console.log(`Login por e-mail/senha ativado e confirmado em ${projectId}.`);
}

main().catch((error) => {
  // Não imprime o objeto da requisição, que pode conter o token OAuth.
  const status = error.response?.status;
  console.error(`Falha ao configurar Firebase${status ? ` (HTTP ${status})` : ''}.`);
  console.error('Verifique GOOGLE_APPLICATION_CREDENTIALS e o papel Firebase Authentication Admin no projeto.');
  process.exitCode = 1;
});
