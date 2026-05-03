import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    Composition,
    Sequence,
    Easing,
    registerRoot,
    Img,
} from 'remotion';

// ==========================================
// 1. COMPONENTES BASE (DESIGN SYSTEM & VFX)
// ==========================================

// Efeito Cinematográfico de Fundo
const AmbientGlow: React.FC<{ color: string; opacity?: number }> = ({ color, opacity = 0.3 }) => (
    <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '1200px', height: '1200px',
        background: `radial-gradient(circle, ${color} 0%, rgba(15,15,15,0) 60%)`,
        opacity, filter: 'blur(80px)',
    }} />
);

// Texto Animado Premium
const AnimatedText: React.FC<{ text: string; delay?: number; className?: string }> = ({ text, delay = 0, className = '' }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const progress = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 90 } });
    const opacity = interpolate(frame - delay, [0, 15], [0, 1], { extrapolateLeft: 'clamp' });
    const translateY = interpolate(progress, [0, 1], [30, 0]);

    return (
        <div style={{ opacity, transform: `translateY(${translateY}px)` }} className={`text-center font-bold tracking-tight text-white drop-shadow-2xl ${className}`}>
            {text}
        </div>
    );
};

// ==========================================
// 2. O CURSOR ANIMADO E INTERAÇÕES
// ==========================================

// Ripple effect (Ondulação) que dispara quando o rato clica
const ClickRipple: React.FC<{ clickFrame: number; x: number; y: number }> = ({ clickFrame, x, y }) => {
    const frame = useCurrentFrame();
    if (frame < clickFrame || frame > clickFrame + 30) return null;

    const progress = interpolate(frame - clickFrame, [0, 20], [0, 1], { easing: Easing.out(Easing.quad) });
    const scale = interpolate(progress, [0, 1], [0.5, 3]);
    const opacity = interpolate(progress, [0, 1], [0.8, 0]);

    return (
        <div style={{
            position: 'absolute', left: x - 25, top: y - 25,
            width: 50, height: 50, borderRadius: '50%',
            backgroundColor: 'rgba(212, 175, 55, 0.6)',
            transform: `scale(${scale})`, opacity,
            boxShadow: '0 0 20px #d4af37', zIndex: 9999,
            pointerEvents: 'none',
        }} />
    );
};

// ==========================================
// 3. MOCKUP DA UI DO APP "POTE SAGRADO"
// ==========================================

const AppUI: React.FC<{ activeTab: 'home' | 'bingo' }> = ({ activeTab }) => {
    const frame = useCurrentFrame();

    return (
        <div className="w-full h-full bg-[#121212] flex flex-col relative text-white font-sans overflow-hidden">

            {/* Header */}
            <div className="pt-16 pb-6 px-8 bg-gradient-to-b from-[#1a1a1a] to-transparent border-b border-white/5 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white/90">Pote Sagrado</h1>
                    <p className="text-sm text-[#d4af37]">Você e Sarah</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#f5d76e] shadow-[0_0_15px_rgba(212,175,55,0.3)] border-2 border-[#121212]" />
            </div>

            {/* Conteúdo Dinâmico (Home vs Bingo) */}
            <div className="flex-1 px-6 pt-8 relative">
                {activeTab === 'home' ? (
                    // TELA: HOME / DASHBOARD
                    <div className="flex flex-col gap-6" style={{ opacity: interpolate(frame, [90, 100], [1, 0]) }}>
                        <div className="bg-[#1e1e1e] rounded-3xl p-6 border border-white/10 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37] blur-[60px] opacity-20" />
                            <p className="text-white/60 text-sm mb-2">Saldo Conjunto</p>
                            <h2 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#d4af37] to-[#f5d76e]">
                                R$ 3.450
                            </h2>

                            <div className="mt-8">
                                <div className="flex justify-between text-xs text-white/50 mb-2">
                                    <span>Progresso da Meta</span>
                                    <span>50%</span>
                                </div>
                                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[#d4af37] to-[#f5d76e] w-1/2 rounded-full" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">↓</div>
                                <div><p className="text-xs text-white/50">Receitas</p><p className="font-bold">+ R$ 4k</p></div>
                            </div>
                            <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">↑</div>
                                <div><p className="text-xs text-white/50">Despesas</p><p className="font-bold">- R$ 550</p></div>
                            </div>
                        </div>

                        {/* Botão Flutuante Adicionar (Alvo do Clique) */}
                        <div className="absolute bottom-6 right-6 w-16 h-16 bg-[#d4af37] rounded-full shadow-[0_10px_25px_rgba(212,175,55,0.5)] flex items-center justify-center text-3xl font-light text-black">
                            +
                        </div>
                    </div>
                ) : (
                    // TELA: BINGO / GAMIFICAÇÃO
                    <div className="flex flex-col gap-6" style={{ opacity: interpolate(frame, [100, 110], [0, 1]) }}>
                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-bold text-[#d4af37]">Bingo do Casal</h2>
                            <p className="text-white/60 text-sm">Complete desafios para recompensas</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                                // O quadrado 5 será clicado no frame 180
                                const isClicked = num === 5 && frame >= 180;
                                return (
                                    <div key={num} className={`aspect-square rounded-2xl flex items-center justify-center text-2xl font-bold transition-all duration-300 ${isClicked
                                            ? 'bg-gradient-to-br from-[#d4af37] to-[#855c0b] text-black scale-105 shadow-[0_0_20px_rgba(212,175,55,0.5)]'
                                            : 'bg-[#1e1e1e] text-white/40 border border-white/5'
                                        }`}>
                                        {num === 5 && isClicked ? '🎯' : num}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Navigation Fake */}
            <div className="h-24 bg-[#1a1a1a] border-t border-white/5 flex justify-around items-center px-6 pb-6">
                <div className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ${activeTab === 'home' ? 'text-[#d4af37]' : 'text-white/30'}`}>
                    <div className="w-6 h-6 rounded bg-current opacity-80" />
                    <span className="text-[10px]">Início</span>
                </div>
                <div className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ${activeTab === 'bingo' ? 'text-[#d4af37]' : 'text-white/30'}`}>
                    <div className="w-6 h-6 rounded-full border-2 border-current opacity-80" />
                    <span className="text-[10px]">Bingo</span>
                </div>
                <div className="w-12 h-12 flex flex-col items-center justify-center gap-1 text-white/30">
                    <div className="w-6 h-6 rounded bg-current opacity-80" />
                    <span className="text-[10px]">Ajustes</span>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 4. A COMPOSIÇÃO PRINCIPAL (CENAS E CÂMERA)
// ==========================================

const ProductDemoVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Movimento de Câmera 3D Cinematic (Zoom in/out suave)
    const cameraScale = interpolate(frame, [0, 60, 240, 300], [1.3, 1, 1.05, 1.4], { easing: Easing.inOut(Easing.ease) });
    const phoneRotateX = interpolate(frame, [0, 60, 240, 300], [20, 0, 5, 25], { easing: Easing.inOut(Easing.ease) });
    const phoneRotateY = interpolate(frame, [0, 60, 240, 300], [-15, 0, -2, -15], { easing: Easing.inOut(Easing.ease) });

    // === CORE: ROTEIRO DO MOUSE E CLIQUES ===

    // Caminho X do Mouse
    const mouseX = interpolate(frame,
        [50, 80, 100, 130, 160],
        [800, 280, 280, 180, 180], // Entra pela direita -> Botão "+" -> Aba Bingo -> Quadrado Bingo
        { easing: Easing.inOut(Easing.bezier(0.25, 0.1, 0.25, 1)) }
    );

    // Caminho Y do Mouse
    const mouseY = interpolate(frame,
        [50, 80, 100, 130, 160],
        [900, 560, 560, 800, 400], // Sobe -> Botão "+" -> Desce pra Nav -> Sobe pro Bingo
        { easing: Easing.inOut(Easing.bezier(0.25, 0.1, 0.25, 1)) }
    );

    // Efeito de "apertar" o botão do rato
    const isClicking = (frame > 82 && frame < 88) || (frame > 132 && frame < 138) || (frame > 162 && frame < 168);
    const mouseScale = spring({ frame: isClicking ? 5 : 0, fps, config: { damping: 10 } });
    const finalMouseScale = interpolate(mouseScale, [0, 1], [1, 0.8]);

    // Lógica de Tabs da UI simulada
    const activeTab = frame < 135 ? 'home' : 'bingo';

    return (
        <AbsoluteFill className="bg-[#050505] overflow-hidden flex items-center justify-center perspective-[1000px]">

            {/* Background Cinematic */}
            <AmbientGlow color="#d4af37" opacity={0.15} />

            {/* Título de Entrada (0 a 60) */}
            <Sequence from={0} durationInFrames={70}>
                <AbsoluteFill className="items-center justify-start pt-32 z-50">
                    <AnimatedText text="A revolução nas finanças do casal." className="text-5xl" />
                </AbsoluteFill>
            </Sequence>

            {/* Câmera / Espaço 3D */}
            <AbsoluteFill style={{
                transform: `scale(${cameraScale}) rotateX(${phoneRotateX}deg) rotateY(${phoneRotateY}deg)`,
                transformStyle: 'preserve-3d',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>

                {/* O "Device" Móvel (Vidro e Sombras) */}
                <div style={{
                    width: '390px', height: '844px',
                    borderRadius: '50px',
                    padding: '12px',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%)',
                    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.1), 0 0 40px rgba(212,175,55,0.1)',
                    transform: 'translateZ(50px)'
                }}>
                    {/* Tela do App */}
                    <div className="w-full h-full rounded-[38px] overflow-hidden relative bg-[#121212]">
                        <AppUI activeTab={activeTab} />
                    </div>
                </div>

            </AbsoluteFill>

            {/* O CURSOR DO MOUSE (Renderizado no topo de tudo, sem rotação 3D para manter a sensação de ecrã do espetador) */}
            <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: `translate(calc(-50% + ${mouseX - 195}px), calc(-50% + ${mouseY - 422}px))`, // Ajuste de offset para o centro do telemóvel
                zIndex: 9999,
                pointerEvents: 'none',
            }}>
                <ClickRipple clickFrame={85} x={0} y={0} /> {/* Clique no + */}
                <ClickRipple clickFrame={135} x={0} y={0} /> {/* Clique na Tab Bingo */}
                <ClickRipple clickFrame={165} x={0} y={0} /> {/* Clique na Missão */}

                {/* Ícone de Cursor SVG Nativo/Premium */}
                <div style={{ transform: `scale(${finalMouseScale})`, transformOrigin: 'top left' }}>
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}>
                        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L5.5 3.21z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Título de Saída (230+) */}
            <Sequence from={240}>
                <AbsoluteFill className="items-center justify-end pb-32 z-50">
                    <div className="bg-black/60 backdrop-blur-md px-10 py-6 rounded-3xl border border-white/10">
                        <AnimatedText text="Crie o seu Pote Sagrado." className="text-4xl text-[#d4af37]" />
                    </div>
                </AbsoluteFill>
            </Sequence>

        </AbsoluteFill>
    );
};

// ==========================================
// 5. REGISTRO ROOT
// ==========================================
export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="ProductDemo"
                component={ProductDemoVideo}
                durationInFrames={330} // 11 segundos focados em ação rápida e impactante
                fps={30}
                width={1080}
                height={1920} // Formato TikTok / Reels
            />
        </>
    );
};

registerRoot(RemotionRoot);