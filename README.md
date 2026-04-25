# 🏺 Pote Sagrado — Finanças para Casais

<div align="center">
  <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" alt="Banner Pote Sagrado" width="100%">
  
  <p align="center">
    <strong>Transformando sonhos em realidade, um centavo de cada vez.</strong>
  </p>

  [![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://pote-sagrado-casais.vercel.app/)
  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-Store-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
</div>

---

## ✨ Sobre o Projeto

O **Pote Sagrado** é uma aplicação progressiva (PWA) desenhada exclusivamente para casais que desejam organizar suas economias de forma lúdica, elegante e eficiente. Inspirado na estética de livros de receitas clássicos e no minimalismo moderno, o app transforma o hábito de poupar em uma jornada compartilhada.

Seja para a viagem dos sonhos, o carro novo ou a casa própria, o Pote Sagrado ajuda você e seu parceiro a visualizarem o progresso e celebrarem cada conquista.

---

## 🚀 Funcionalidades Principais

### 💰 Gestão de Economias Compartilhada
*   **Depósitos Rápidos**: Adicione valores ao pote em segundos.
*   **Histórico Detalhado**: Veja quem guardou, quando e para quê.
*   **Metas Visuais**: O pote se enche fisicamente à medida que vocês se aproximam do objetivo.

### 🎨 Design Premium & Experiência Imersiva
*   **Estética "Cookbook"**: Tons pastéis, tipografia clássica (Playfair Display) e glassmorphism.
*   **Feedback Háptico & Sonoro**: Sinta e ouça a satisfação de guardar dinheiro.
*   **Animações Fluidas**: Transições suaves que tornam o uso do app um prazer diário.

### 📸 Compartilhamento Social
*   **Cartões Personalizados**: Gere imagens lindas com o progresso atual para postar nos Stories do Instagram e inspirar outros casais.

### 📱 Experiência de App Nativo
*   **Instalação PWA**: Adicione à tela inicial e use como um aplicativo nativo.
*   **Offline Ready**: Consulte seu saldo mesmo sem internet.

---

## 🛠️ Tecnologias Utilizadas

O projeto utiliza o que há de mais moderno no ecossistema web para garantir performance e estabilidade:

*   **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
*   **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
*   **Animações**: [Framer Motion](https://www.framer.com/motion/)
*   **Backend & Auth**: [Firebase](https://firebase.google.com/) (Firestore & Authentication)
*   **Ícones**: [Lucide React](https://lucide.dev/)
*   **Processamento de Imagem**: [html-to-image](https://github.com/bubkoo/html-to-image)

---

## 💻 Como Rodar Localmente

### Pré-requisitos
*   Node.js (v18+)
*   NPM ou Yarn

### Passo a Passo

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/Duckzx/Pote-Sagrado---Casais.git
    cd Pote-Sagrado---Casais
    ```

2.  **Instale as dependências**:
    ```bash
    npm install
    ```

3.  **Configuração do Firebase**:
    Crie um arquivo `.env.local` na raiz do projeto e adicione suas credenciais do Firebase:
    ```env
    VITE_FIREBASE_API_KEY=sua_key
    VITE_FIREBASE_AUTH_DOMAIN=seu_dominio
    VITE_FIREBASE_PROJECT_ID=seu_id
    VITE_FIREBASE_STORAGE_BUCKET=seu_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
    VITE_FIREBASE_APP_ID=seu_app_id
    ```

4.  **Inicie o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```

---

## 📈 Potencial de Evolução

O Pote Sagrado foi construído com uma arquitetura escalável, permitindo futuras expansões como:
- [ ] Múltiplos potes para diferentes objetivos.
- [ ] Sistema de recompensas e badges para marcos alcançados.
- [ ] Gráficos avançados de evolução mensal.
- [ ] Integração com APIs bancárias para atualização automática.

---

<div align="center">
  <p>Desenvolvido com ❤️ para casais que planejam o futuro juntos.</p>
  <a href="https://pote-sagrado-casais.vercel.app/"><strong>Visite o Site Oficial</strong></a>
</div>
