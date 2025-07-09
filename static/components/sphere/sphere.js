import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


export class Sphere extends HTMLElement {
  #time = 0;
  #renderer;
  #camera;
  #coreSphere;
  #orbitRings;
  #controls;
  #scene;
  #timeout = null;

  #pointMaterialShader = {
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      varying float vDistance;
      uniform float time;
      
      void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDistance = -mvPosition.z;
          float pulse = sin(time * 2.0 + length(position)) * 0.15 + 1.0;
          vec3 pos = position;
          pos.x += sin(time + position.z * 0.5) * 0.05;
          pos.y += cos(time + position.x * 0.5) * 0.05;
          pos.z += sin(time + position.y * 0.5) * 0.05;
          mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z) * pulse;
          gl_Position = projectionMatrix * mvPosition;
      }
  `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vDistance;
      uniform float time;
      
      void main() {
          vec2 cxy = 2.0 * gl_PointCoord - 1.0;
          float r = dot(cxy, cxy);
          if (r > 1.0) discard;
          float glow = exp(-r * 2.5);
          float outerGlow = exp(-r * 1.5) * 0.3;
          vec3 finalColor = vColor * (1.2 + sin(time * 0.5) * 0.1);
          finalColor += vec3(0.2, 0.4, 0.6) * outerGlow;
          float distanceFade = 1.0 - smoothstep(0.0, 50.0, vDistance);
          float intensity = mix(0.7, 1.0, distanceFade);
          gl_FragColor = vec4(finalColor * intensity, (glow + outerGlow) * distanceFade);
      }
  `
  };
  
  #createSpiralSphere(radius, particleCount, colors) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const particleColors = [];
    const sizes = [];

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      positions.push(x, y, z);
      const colorPos = i / particleCount;
      const color1 = colors[Math.floor(colorPos * (colors.length - 1))];
      const color2 = colors[Math.ceil(colorPos * (colors.length - 1))];
      const mixRatio = (colorPos * (colors.length - 1)) % 1;
      const finalColor = new THREE.Color().lerpColors(color1, color2, mixRatio);
      particleColors.push(finalColor.r, finalColor.g, finalColor.b);
      sizes.push(Math.random() * 0.15 + 0.08);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: this.#pointMaterialShader.vertexShader,
      fragmentShader: this.#pointMaterialShader.fragmentShader,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    return new THREE.Points(geometry, material);
  }

  #createOrbitRings(radius, count, thickness) {
    const group = new THREE.Group();

    for (let i = 0; i < count; i++) {
      const ringGeometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];
      const sizes = [];
      const particleCount = 3000;

      const ringColors = [
        new THREE.Color('#4B0082'),
        new THREE.Color('#979CA2'),
        new THREE.Color('#5D478B'),
        new THREE.Color('#3D0066'),
        new THREE.Color('#ADBCC2'),
        new THREE.Color('#B8F3FF')
      ];

      for (let j = 0; j < particleCount; j++) {
        const angle = (j / particleCount) * Math.PI * 2;
        const radiusVariation = radius + (Math.random() - 0.5) * thickness;
        const x = Math.cos(angle) * radiusVariation;
        const y = (Math.random() - 0.5) * thickness;
        const z = Math.sin(angle) * radiusVariation;
        positions.push(x, y, z);
        const color = ringColors[i];
        colors.push(color.r, color.g, color.b);
        sizes.push(Math.random() * 0.12 + 0.06);
      }
      ringGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      ringGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      ringGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: this.#pointMaterialShader.vertexShader,
        fragmentShader: this.#pointMaterialShader.fragmentShader,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      const ring = new THREE.Points(ringGeometry, material);
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      group.add(ring);
    }

    return group;
  }

  #animate = () => {
    requestAnimationFrame(this.#animate);
    this.#time += 0.002;
    this.#coreSphere.material.uniforms.time.value = this.#time;
    this.#orbitRings.children.forEach(ring => {
      ring.material.uniforms.time.value = this.#time;
    });
    this.#coreSphere.rotation.y += 0.001;
    this.#coreSphere.rotation.x = Math.sin(this.#time * 0.5) * 0.15;
    this.#orbitRings.children.forEach((ring, index) => {
      const dynamicSpeed = 0.001 * (Math.sin(this.#time * 0.2) + 2.0) * (index + 1);
      ring.rotation.z += dynamicSpeed;
      ring.rotation.x += dynamicSpeed * 0.6;
      ring.rotation.y += dynamicSpeed * 0.4;
    });
    this.#controls.update();
    this.#renderer.render(this.#scene, this.#camera);
  }

  #updateRendererSize = () => {
    const renderDom = this;
    const width = renderDom.clientWidth;
    const height = renderDom.clientHeight;
    this.#renderer.setSize(width, height);
    this.#camera.aspect = width / height;
    this.#camera.updateProjectionMatrix();
  }

  #updateRendererSizeTimeout = () => {
    if (this.#timeout != null) return;
    this.#timeout = setTimeout(() => {
      this.#updateRendererSize();
      this.#timeout = null;
    }, 1000);
  }

  #initRenderer() {
    this.#scene = new THREE.Scene();
    this.#scene.fog = new THREE.FogExp2(0xffffff00, 0.01);

    this.#camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.#renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });
    const renderDom = this;

    this.#updateRendererSize();

    this.#renderer.setClearColor(0x060A33, 0);
    this.#renderer.setPixelRatio(window.devicePixelRatio);
    renderDom.appendChild(this.#renderer.domElement);

    this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
    this.#controls.enableDamping = true;
    this.#controls.dampingFactor = 0.05;
    this.#controls.rotateSpeed = 0.5;
    this.#controls.minDistance = 15;
    this.#controls.maxDistance = 15;
    this.#controls.enableZoom = false;

    this.#camera.position.z = 15;
    this.#camera.position.y = 5;
    this.#controls.target.set(0, 0, 0);
    this.#controls.update();

    const sphereColors = [
      new THREE.Color('#0B0A13'),
      new THREE.Color('#13193E'),
      new THREE.Color('#3D0066'),
      new THREE.Color('#7A9DCB'),
      new THREE.Color('#C0C0C0'),
      new THREE.Color('#FFFFFF')
    ];

    this.#coreSphere = this.#createSpiralSphere(4, 25000, sphereColors);
    this.#orbitRings = this.#createOrbitRings(5.8, 6, 0.4);

    const mainGroup = new THREE.Group();
    mainGroup.scale.set(1.2, 1.2, 1.2);
    mainGroup.add(this.#coreSphere);
    mainGroup.add(this.#orbitRings);
    this.#scene.add(mainGroup);   
    this.#animate();
  }  

  #initResize() {
    window.addEventListener('resize', this.#updateRendererSizeTimeout);
  }

  #releaseResize() {    
    window.removeEventListener('resize', this.#updateRendererSizeTimeout);
  }


  disconnectedCallback() {
    this.#releaseResize();
  }

  connectedCallback() {
    this.#initResize();
    this.#initRenderer();
  }
}

customElements.define('i-sphere', Sphere);