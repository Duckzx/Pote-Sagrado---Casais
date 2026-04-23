import React, { useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Environment, MeshTransmissionMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const RealWater = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Simulate pouring physics
  const progress = spring({
    fps,
    frame: frame - 15,
    config: { damping: 15, mass: 1, stiffness: 35 },
  });

  // Calculate height and scale correctly so water scales up from the bottom
  const fillHeight = interpolate(progress, [0, 1], [0.01, 2.7], { extrapolateRight: "clamp" });
  const positionY = -1.45 + (fillHeight / 2);

  // Surface agitation
  const agitation = interpolate(progress, [0, 0.5, 1], [0.0, 0.1, 0.0], { extrapolateRight: "clamp" });

  return (
    <group position={[0, positionY, 0]}>
      <mesh>
        <cylinderGeometry args={[0.93, 0.93, fillHeight, 32, 8]} />
        <MeshTransmissionMaterial
          transmission={1}
          thickness={0.8}
          roughness={0.0}
          ior={1.33}
          color="#66c2ff"
          attenuationDistance={1.2}
          attenuationColor="#0055ff"
          distortion={agitation}
          distortionScale={0.5}
          temporalDistortion={agitation > 0 ? 0.2 : 0}
          samples={4}
          resolution={256}
        />
      </mesh>
      {/* Surface ripples/highlight */}
      {fillHeight > 0.1 && (
        <mesh position={[0, fillHeight / 2 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.93, 32]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            transmission={0.5} 
            opacity={0.3} 
            transparent 
            roughness={0.0}
            ior={1.33}
          />
        </mesh>
      )}
    </group>
  );
};

const PouringStream = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ fps, frame: frame - 12, config: { damping: 10 } });

  // Stream starts full, then narrows and vanishes as progress finishes
  const streamScale = interpolate(progress, [0, 0.1, 0.8, 1], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  const streamY = interpolate(progress, [0, 0.1, 0.8, 1], [4, 1.5, 1.5, 0], { extrapolateRight: "clamp" });
  
  if (streamScale === 0) return null;

  return (
    <group position={[0, streamY, 0]}>
      <mesh scale={[streamScale, 1, streamScale]}>
        <cylinderGeometry args={[0.1, 0.08, 6, 8]} />
        <MeshTransmissionMaterial
          transmission={1}
          thickness={0.5}
          roughness={0.1}
          ior={1.33}
          color="#aaccff"
          distortion={0.3}
          distortionScale={1}
          temporalDistortion={0.5}
        />
      </mesh>
      {/* Active splashes around the hit point */}
      {streamScale > 0.5 && (
        <Sparkles count={30} scale={0.5} size={4} speed={2} opacity={0.6} color="#ffffff" position={[0, -2.5, 0]} />
      )}
    </group>
  );
};

const GlassPot = () => {
  return (
    <group>
      {/* Main Glass Cylinder (open top) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 3, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={1}
          transparent
          opacity={1}
          roughness={0.05}
          ior={1.5}
          thickness={0.2}
          envMapIntensity={2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Glass Bottom */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[1, 1, 0.1, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={1}
          roughness={0.05}
          ior={1.5}
          envMapIntensity={2}
        />
      </mesh>
      {/* Glass Lip */}
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.06, 16, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={1}
          roughness={0.05}
          envMapIntensity={2}
        />
      </mesh>
    </group>
  );
};

const ThreeDScene: React.FC = () => {
  const frame = useCurrentFrame();
  // Animate camera moving slightly closer and panning
  const cameraZ = interpolate(frame, [0, 180], [8, 5.5]);
  const cameraY = interpolate(frame, [0, 180], [4, 1.5]);

  return (
    <AbsoluteFill>
      <ThreeCanvas
        linear
        width={400}
        height={500}
        camera={{ position: [0, cameraY, cameraZ], fov: 40 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, 5, -5]} intensity={1} color="#C5A059" />

        {/* Realism via environment lighting */}
        <Environment preset="city" />

        <group position={[0, -0.5, 0]} rotation={[0.1, frame * 0.005, 0]}>
          <GlassPot />
          <RealWater />
          <PouringStream />
          {/* Bubbles in the water */}
          <Sparkles count={20} scale={1.8} size={2} speed={0.8} opacity={0.4} color="#ffffff" position={[0, -0.2, 0]} />
        </group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

export const RemotionIntro: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-dismiss handler
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPlaying(false);
      onComplete();
    }, 6000); // 6s duration
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isPlaying) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-cookbook-bg/95 backdrop-blur-xl animate-fade-in"
      onClick={() => { setIsPlaying(false); onComplete(); }}
    >
      <div className="w-full max-w-sm flex flex-col items-center" onClick={e => e.stopPropagation()}>
        <div className="relative w-full aspect-[4/5]">
          <Player
            component={ThreeDScene}
            durationInFrames={180} // 6 seconds
            compositionWidth={400}
            compositionHeight={500}
            fps={30}
            style={{ width: '100%', height: '100%' }}
            autoPlay
            loop={false}
          />
          {/* Fading text overlay */}
          <div 
            className="absolute bottom-10 left-0 w-full text-center pointer-events-none animate-fade-in"
            style={{ animationDelay: '3s', animationDuration: '2s', animationFillMode: 'both' }}
          >
            <h2 className="font-serif text-3xl text-cookbook-text drop-shadow-md">
              O Pote Sagrado
            </h2>
          </div>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); setIsPlaying(false); onComplete(); }}
          className="mt-4 bg-cookbook-gold text-white px-8 py-3 rounded-full font-sans text-xs uppercase tracking-widest font-bold shadow-lg animate-fade-in transition-transform active:scale-95"
          style={{ animationDelay: '4s', animationFillMode: 'both' }}
        >
          Iniciar
        </button>
      </div>
    </div>
  );
};
