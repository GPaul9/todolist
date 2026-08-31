import { RefObject, useEffect, useRef } from 'react';
import { Puff } from '../model/type';
import styles from './CanvasVacuumGame.module.scss';
import CrossIcon from 'assets/cross-icon.svg?react';
import ScoreIcon from 'assets/canvasVacuum/score-icon.svg?react';
import { useMediaQuery } from 'react-responsive';
import { breakpoints } from 'app/styles/breakpoints';

import puff1 from 'assets/canvasVacuum/puff1.png';
import puff2 from 'assets/canvasVacuum/puff2.png';
import puff3 from 'assets/canvasVacuum/puff3.png';
import puff4 from 'assets/canvasVacuum/puff4.png';
import puff5 from 'assets/canvasVacuum/puff5.png';
import puff6 from 'assets/canvasVacuum/puff6.png';
import puff7 from 'assets/canvasVacuum/puff7.png';

import car1 from 'assets/canvasVacuum/car1.webp';
import car2 from 'assets/canvasVacuum/car2.webp';
import car3 from 'assets/canvasVacuum/car3.webp';
import car4 from 'assets/canvasVacuum/car4.webp';

type StreamParticle = {
  x: number;
  y: number;
  life: number;
  maxLife: number;
};

type Player = {
  x: number;
  y: number;
  radius: number;
}

const spawnStreamParticle = (player: Player, angle: number, suctionRadius: number, coneAngle: number) => {
  const distance = Math.random() * suctionRadius;
  const spread = (Math.random() - 0.5) * coneAngle;

  const a = angle + spread;

  return {
    x: player.x + Math.cos(a) * distance,
    y: player.y + Math.sin(a) * distance,
    life: 1,
    maxLife: 1,
  };
};

const resizeCanvas = (canvas: HTMLCanvasElement, sizeRef: RefObject<{ width: number; height: number }>) => {
  const dpr = window.devicePixelRatio || 1;

  const width = window.innerWidth;
  const height = window.innerHeight;

  sizeRef.current = { width, height };

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
};

const createPuffs = (count: number, width: number, height: number): Puff[] => {
  return Array.from({ length: count }).map(() => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 13,
    phase: Math.random() * Math.PI * 2,
    windX: (Math.random() - 0.5) * 2,
    windY: (Math.random() - 0.5) * 2,
    velocityX: 0,
    velocityY: 0,
    imgIndex: Math.floor(Math.random() * 7),
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 4,
  }));
};

const respawnPuff = (puff: Puff, width: number, height: number) => {
  puff.x = Math.random() * width;
  puff.y = Math.random() * height;
  puff.phase = Math.random() * Math.PI * 2;
  puff.windX = (Math.random() - 0.5) * 2;
  puff.windY = (Math.random() - 0.5) * 2;
  puff.velocityX = 0;
  puff.velocityY = 0;
};

const lerpAngle = (a: number, b: number, t: number) => {
  let diff = b - a;

  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;

  return a + diff * t;
};

const normalizeAngle = (angle: number) => {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
};

const loadImages = (puffImagesRef: RefObject<HTMLImageElement[]>) => {
  const paths = [ puff1, puff2, puff3, puff4, puff5, puff6, puff7 ];

  puffImagesRef.current = paths.map((src) => {
    const img = new Image();
    img.src = src;
    return img;
  });
};


type TProps = {
  onClose: () => void;
}

export const CanvasVacuumGame = ({onClose}: TProps) => {
  const isMobile = useMediaQuery({maxWidth: breakpoints.md})

  // init
  const PLAYER_SIZE = isMobile ? 30 : 38;
  const PLAYER_SPEED = isMobile ? 60 : 80;
  const PLAYER_ANGLE_SPEED = 2;
  const CONE_ANGLE = Math.PI / 6;
  const SUCTION_PARTICLES_PER_SECOND = 60;
  const SUCTION_PARTICLES_SPEED = 80;
  const SUCTION_FORCE = 370;
  const SUCTION_RADIUS = isMobile ? 150 : 250;
  const PUFF_COUNT = isMobile ? 70 : 200;
  const PUFF_WIND = 4;
  const PUFF_ROTATE_SPEED = 3;


  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sizeRef = useRef({ width: window.innerWidth, height: window.innerHeight });

  const playerRef = useRef<Player>({
    x: 200,
    y: 150,
    radius: PLAYER_SIZE,
  });

  const targetRef = useRef({
    x: 200,
    y: 150,
  });

  const angleRef = useRef<number>(0);

  const puffRef = useRef<Puff[]>([]);

  const scoreRef = useRef(0);
  const scoreElementRef = useRef<HTMLDivElement>(null);

  const vacuumImagesRef = useRef<HTMLImageElement[]>([]);
  const specialVacuumRef = useRef<number>(0);
  const specialVacuumTimerRef = useRef<number>(0);
  const nextSpecialVacuumRef = useRef<number>(5 + Math.random() * 10);

  const puffImagesRef = useRef<HTMLImageElement[]>([]);

  const streamParticleRef = useRef<StreamParticle[]>([]);

  const isMouseDownRef = useRef(false);
  // ----------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    loadImages(puffImagesRef);

    // add puffs arr
    resizeCanvas(canvas, sizeRef);
    puffRef.current = createPuffs(PUFF_COUNT, sizeRef.current.width, sizeRef.current.height);


    const draw = () => {
      // const ref
      const player = playerRef.current;
      const puff = puffRef.current;
      const angle = angleRef.current;
      const imgVacuum = vacuumImagesRef.current[specialVacuumRef.current];

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // stream particle
      streamParticleRef.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);

        ctx.fillStyle = `rgba(150, 200, 255, ${p.life})`;
        ctx.fill();
      });

      // player
      if (imgVacuum && imgVacuum.complete) {
        const sizeVacuum = player.radius * 3.5;

        const aspect = imgVacuum.width / imgVacuum.height;

        let drawWidth = sizeVacuum;
        let drawHeight = sizeVacuum;

        if (aspect > 1) {
          drawHeight = sizeVacuum / aspect;
        } else {
          drawWidth = sizeVacuum * aspect;
        }

        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(angle);

        ctx.drawImage(
          imgVacuum,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight
        );

        ctx.restore();
      }

      // puffs
      puff.forEach(puffy => {
        const imgPuff = puffImagesRef.current[puffy.imgIndex];
        if (!imgPuff || !imgPuff.complete) return;

        const size = puffy.radius * 2;

        ctx.save();
        ctx.translate(puffy.x, puffy.y);
        ctx.rotate(puffy.rotation);

        ctx.drawImage(
          imgPuff,
          -size / 2,
          -size / 2,
          size,
          size
        );

        ctx.restore();
      });
    };

    const update = (deltaTime: number) => {
      // const ref
      const player = playerRef.current;
      const target = targetRef.current;
      const puff = puffRef.current;
      const { width: canvasWidth, height: canvasHeight } = sizeRef.current;

      // player img
      specialVacuumTimerRef.current += deltaTime;
      if (
        specialVacuumRef.current === 0 &&
        specialVacuumTimerRef.current >= nextSpecialVacuumRef.current
      ) {
        specialVacuumRef.current = 1 + Math.floor(Math.random() * 3);
        specialVacuumTimerRef.current = 0;
      }

      if (
        specialVacuumRef.current !== 0 &&
        specialVacuumTimerRef.current >= 2
      ) {
        specialVacuumRef.current = 0;
        specialVacuumTimerRef.current = 0;
        nextSpecialVacuumRef.current = 10 + Math.random() * 30;
      }

      // player smooth and angle;
      const targetDx = target.x - player.x;
      const targetDy = target.y - player.y;

      const playerDistance = Math.sqrt(
        targetDx * targetDx +
        targetDy * targetDy
      );

      if (isMouseDownRef.current && playerDistance > 0) {
        const moveStep = Math.min(
          PLAYER_SPEED * deltaTime,
          playerDistance
        );

        player.x += (targetDx / playerDistance) * moveStep;
        player.y += (targetDy / playerDistance) * moveStep;
      }

      const targetAngle = Math.atan2(targetDy, targetDx);
      angleRef.current = normalizeAngle(
        lerpAngle(
          angleRef.current,
          targetAngle,
          PLAYER_ANGLE_SPEED * deltaTime
        )
      );

      // stream particle
      const particlesToSpawn = SUCTION_PARTICLES_PER_SECOND * deltaTime;
      for (let i = 0; i < (particlesToSpawn); i++) {
        streamParticleRef.current.push(
          spawnStreamParticle(player, angleRef.current, SUCTION_RADIUS, CONE_ANGLE)
        );
      }

      streamParticleRef.current = streamParticleRef.current.filter(p => {
        const dx = player.x - p.x;
        const dy = player.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        p.x += dx * (SUCTION_PARTICLES_SPEED / 100 * deltaTime);
        p.y += dy * (SUCTION_PARTICLES_SPEED / 100 * deltaTime);
        p.life -= 1.2 * deltaTime;
        return p.life > 0 && dist > 5;
      });

      // puff
      puff.forEach(puffy => {
        // rotate
        puffy.rotationSpeed += (Math.random() - 0.5) * 0.0015;
        puffy.rotationSpeed = Math.max(-PUFF_ROTATE_SPEED / 10, Math.min(PUFF_ROTATE_SPEED / 10, puffy.rotationSpeed));
        puffy.rotation += puffy.rotationSpeed * deltaTime;

        // wind drift
        puffy.windX += (Math.random() - 0.5) * 0.2;
        puffy.windY += (Math.random() - 0.5) * 0.2;

        puffy.windX = Math.max(-PUFF_WIND, Math.min(PUFF_WIND, puffy.windX));
        puffy.windY = Math.max(-PUFF_WIND, Math.min(PUFF_WIND, puffy.windY));

        puffy.y += puffy.windY * deltaTime;
        puffy.x += puffy.windX * deltaTime;

        puffy.x += puffy.velocityX * deltaTime;
        puffy.y += puffy.velocityY * deltaTime;

        puffy.velocityX *= 0.99;
        puffy.velocityY *= 0.99;

        if (puffy.x < 0) puffy.x = canvasWidth;
        if (puffy.x > canvasWidth) puffy.x = 0;

        if (puffy.y < 0) puffy.y = canvasHeight;
        if (puffy.y > canvasHeight) puffy.y = 0;

        // distance puff
        const distanceDx = player.x - puffy.x;
        const distanceDy = player.y - puffy.y;
        const puffDistance = Math.sqrt(distanceDx * distanceDx + distanceDy * distanceDy);

        // rule suction
        const puffAngle = Math.atan2(
          puffy.y - player.y,
          puffy.x - player.x
        );
        let angleDiff = Math.abs(
          puffAngle - angleRef.current
        );

        if (angleDiff > Math.PI) {
          angleDiff = Math.PI * 2 - angleDiff;
        }

        if (puffDistance < SUCTION_RADIUS && angleDiff < CONE_ANGLE) {
          const speed = ((SUCTION_RADIUS - puffDistance) / SUCTION_RADIUS) * SUCTION_FORCE;

          if (puffDistance > 0.0001) {
            puffy.velocityX += (distanceDx / puffDistance) * speed * deltaTime;
            puffy.velocityY += (distanceDy / puffDistance) * speed * deltaTime;
          }
        }
        // rule colliding
        if (puffDistance < player.radius + puffy.radius) {
          respawnPuff(puffy, canvasWidth, canvasHeight)
          scoreRef.current += 1;

          if (scoreElementRef.current) {
            scoreElementRef.current.textContent = `${scoreRef.current}`;
          }
        }
      });
    };

    // vacuum imgs
    vacuumImagesRef.current = [ car1, car2, car3, car4 ].map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });


    let animationId = 0;
    let lastTime = performance.now();
    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      update(deltaTime);
      draw();

      animationId = requestAnimationFrame(gameLoop);
    };
    requestAnimationFrame(gameLoop);

    const handleResize = () => {
      resizeCanvas(canvas, sizeRef);
    };

    const handlePointerDown = (event: PointerEvent) => {
      isMouseDownRef.current = true;
      const rect = canvas.getBoundingClientRect();
      targetRef.current.x = event.clientX - rect.left;
      targetRef.current.y = event.clientY - rect.top;
    };
    const handlePointerUp = () => {
      isMouseDownRef.current = false;
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!isMouseDownRef.current) return;
      const rect = canvas.getBoundingClientRect();
      targetRef.current.x = event.clientX - rect.left;
      targetRef.current.y = event.clientY - rect.top;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointermove', handlePointerMove);

      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <canvas
        className={styles.canvas}
        ref={canvasRef}
      />

      <div className={styles.controls}>
        <div className={styles['controls__score-wrapper']}>
          <ScoreIcon className={styles['controls__score-icon']} />

          <div
            ref={scoreElementRef}
            className={styles.controls__score}
          >
            0
          </div>
        </div>

        <button
          className={styles['controls__btn-close']}
          onClick={onClose}
        >
          <CrossIcon className={styles.controls__icon} />
        </button>
      </div>
    </>
  );
};
