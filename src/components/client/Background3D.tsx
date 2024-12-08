import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Background3D = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Create floating spheres with gradient materials
    const spheres: THREE.Mesh[] = [];
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    
    const colors = [
      new THREE.Color(0x9b87f5),
      new THREE.Color(0x7E69AB),
      new THREE.Color(0x6E59A5),
    ];

    for (let i = 0; i < 8; i++) {
      const sphereMaterial = new THREE.MeshPhongMaterial({
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0.3,
        shininess: 50,
      });

      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 20 - 15
      );
      sphere.scale.setScalar(Math.random() * 1.5 + 0.5);
      spheres.push(sphere);
      scene.add(sphere);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    camera.position.z = 15;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      spheres.forEach((sphere, i) => {
        const time = Date.now() * 0.001;
        sphere.position.y += Math.sin(time + i) * 0.003;
        sphere.position.x += Math.cos(time + i) * 0.003;
        sphere.rotation.x += 0.001;
        sphere.rotation.y += 0.001;
      });

      renderer.render(scene, camera);
    };

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      scene.clear();
    };
  }, []);

  return <div ref={mountRef} className="fixed top-0 left-0 -z-10 w-full h-full opacity-50" />;
};

export default Background3D;