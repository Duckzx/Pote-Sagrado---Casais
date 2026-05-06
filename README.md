<div align="center">

# 💑 Pote Sagrado

### *O app que transforma sonhos de casal em realidade*

[![Deploy](https://img.shields.io/badge/🌐_Demo_ao_vivo-Vercel-black?style=for-the-badge&logo=vercel)](https://pote-sagrado-casais.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 📖 Sobre o Projeto

**Pote Sagrado** é um app para casais que querem planejar e realizar viagens juntos de forma organizada e divertida. O casal define metas de economia, acompanha o progresso em tempo real e celebra cada conquista no caminho até o destino dos sonhos.

> 💡 *"Cada real no pote é um passo mais perto da sua próxima aventura."*

---

## ✨ Funcionalidades

- 💰 **Pote compartilhado** — saldo em tempo real para os dois parceiros
- 🗺️ **Metas de viagem** — defina destino, valor alvo e prazo
- 📊 **Progresso visual** — acompanhe quanto falta para a viagem dos sonhos
- 🤖 **IA integrada** — sugestões inteligentes com Google Gemini API
- 🔐 **Autenticação segura** — login com verificação 2FA via Twilio
- ☁️ **Sincronização em nuvem** — dados sempre atualizados via Firestore

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | TypeScript · CSS |
| Build Tool | Vite |
| Backend / DB | Firebase Firestore |
| Autenticação | Firebase Auth · Twilio 2FA |
| IA | Google Gemini API |
| Deploy | Vercel |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Node.js 18+
- Conta no Firebase
- Chave da Gemini API

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/Duckzx/Pote-Sagrado---Casais.git
cd Pote-Sagrado---Casais

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Adicione sua GEMINI_API_KEY no .env.local

# 4. Rode o projeto
npm run dev
```

Acesse: `http://localhost:5173`

---

## 🌐 Deploy

O projeto está disponível em produção via Vercel:

**[pote-sagrado-casais.vercel.app](https://pote-sagrado-casais.vercel.app)**

---

## 📁 Estrutura do Projeto

```
Pote-Sagrado---Casais/
├── src/              # Código-fonte principal
├── public/           # Assets estáticos
├── functions/        # Firebase Cloud Functions
├── firebase.json     # Configuração do Firebase
├── vite.config.ts    # Configuração do Vite
└── .env.example      # Variáveis de ambiente (modelo)
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

1. Faça um **fork** do projeto
2. Crie uma branch: `git checkout -b feat/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona minha feature'`
4. Push para a branch: `git push origin feat/minha-feature`
5. Abra um **Pull Request**

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

<div align="center">

Feito com ❤️ por [Francisco (Duckzx)](https://github.com/Duckzx)

[![GitHub](https://img.shields.io/badge/GitHub-Duckzx-181717?style=flat-square&logo=github)](https://github.com/Duckzx)

</div>
