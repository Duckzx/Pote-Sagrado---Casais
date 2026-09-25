<div align="center">
  <img width="1200" height="475" alt="Pote Sagrado Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Pote Sagrado - Casais 🍯❤️

**Pote Sagrado** transforma guardar dinheiro em uma jornada de conexão e conquistas — sozinha(o), em casal ou com a turma. Combinando tecnologia, gamificação e um design premium, o app permite que casais economizem juntos para seus maiores sonhos.

## ✨ Funcionalidades Principais

- **Três modos**: *Só eu* (metas pessoais), *Em casal* (cartas, mêsversário, duelos) e *Com amigos* (vaquinha, ranking da turma, qualquer número de pessoas).
- **Entrar como quiser**: Google ou e-mail e senha (com recuperação de senha).
- **Pote e Metas Compartilhadas**: economizem para viagens, casa, carro, casamento ou qualquer sonho.
- **Sincronia entre aparelhos**: tudo em tempo real e offline-first (as alterações feitas sem internet sobem quando a conexão volta).
- **Humor do dia 🥰**: cada pessoa conta como está e o par recebe uma dica de carinho.
- **Mêsversário 💐**: contagem regressiva para o próximo mêsversário e aniversário de namoro.
- **Cápsula do Tempo 💌**: cartas lacradas que só abrem na data escolhida.
- **Love Cards**: perguntas e desafios para fortalecer a conexão, com match quando os dois respondem.
- **Missões, Disputa do mês, Mural e Álbum do casal**.
- **Temas**: Rosé Champagne (padrão para novas contas), Lavanda, Cookbook, Mediterranean, Nordic, Tropical e, no Premium, Cereja Noir, Midnight e Noir.
- **Notificações push** quando o par registra um depósito.
- **Segurança e Privacidade**: dados isolados por casal, seguindo a LGPD.

## 🚀 Como Rodar Localmente

1. **Instale as dependências**:
   ```bash
   npm ci
   ```

2. **Variáveis de ambiente (opcionais)**: copie `.env.example` para `.env`.

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Testar sem tocar na produção** (emuladores do Firebase, precisa de Java):
   ```bash
   npm run dev:emulators   # app em http://localhost:5173 com Auth/Firestore locais
   npm run test:rules      # testa as regras do Firestore contra todas as operações do app
   ```

## ☁️ Publicação

- **Site (Vercel)**: `npm run build` gera `dist/`. O `vercel.json` já cuida das rotas do app (ex: `/termos`).
- **Firebase (obrigatório após atualizar)**: publique regras, índices e a função de push:
  ```bash
  npx firebase-tools deploy --only firestore,storage,functions
  ```
  Sem publicar as novas regras, recursos como Love Cards, notificações, álbum e Cápsula do Tempo ficam bloqueados.

## 🛠️ Tecnologias

- **Frontend**: React 19, Vite, Tailwind CSS 4, Lucide Icons, Motion, componentes [Magic UI](https://magicui.design) (MIT).
- **Backend/DB**: Firebase (Auth, Firestore com cache offline, Storage, Cloud Functions, Messaging).
- **Estado**: Zustand.

---
*Desenvolvido com carinho para casais que sonham alto.*
