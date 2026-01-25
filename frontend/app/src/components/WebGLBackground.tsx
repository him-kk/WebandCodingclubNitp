import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function FluidMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const uniforms = useRef({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    varying vec2 vUv;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
    }

    float smoothNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float a = noise(i);
      float b = noise(i + vec2(1.0, 0.0));
      float c = noise(i + vec2(0.0, 1.0));
      float d = noise(i + vec2(1.0, 1.0));

      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
      vec2 uv = vUv;
      float mouseDist = length(uv - uMouse*0.5 - 0.5);
      float mouseInfluence = smoothstep(0.5,0.0, mouseDist) * 0.3;

      float n1 = smoothNoise(uv*3.0 + uTime*0.1);
      float n2 = smoothNoise(uv*5.0 - uTime*0.15);
      float n3 = smoothNoise(uv*8.0 + uTime*0.05);

      float combined = n1*0.5 + n2*0.3 + n3*0.2;
      combined += mouseInfluence;

      vec3 voidColor = vec3(0.059,0.063,0.075);
      vec3 blueHint = vec3(0.09,0.09,0.2);
      vec3 orangeHint = vec3(0.15,0.09,0.03);

      vec3 finalColor = mix(voidColor, blueHint, combined*0.3);
      finalColor = mix(finalColor, orangeHint, mouseInfluence*0.5);

      float vignette = 1.0 - length(uv-0.5)*0.5;
      finalColor *= vignette;

      gl_FragColor = vec4(finalColor,1.0);
    }
  `;

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uMouse.value.x +=
      (mouseRef.current.x - material.uniforms.uMouse.value.x) * 0.05;
    material.uniforms.uMouse.value.y +=
      (mouseRef.current.y - material.uniforms.uMouse.value.y) * 0.05;
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
      />
    </mesh>
  );
}

export default function WebGLBackground() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // ensures Canvas only renders on client
  }, []);

  if (!isClient) return null;

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false }}
      >
        <FluidMesh />
      </Canvas>
    </div>
  );
}
