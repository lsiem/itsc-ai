import React, { useEffect, useRef } from "react";

export default function PreLoader() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const cfg = {
      bgFillColor: "rgba(50,50,50,.01)",
      dirsCount: 6,
      stepsToTurn: 20,
      dotSize: 4,
      dotCount: 300,
      dotVelocity: 4,
      distance: 70,
    };

    function drawRect(color, x, y, w, h, shadowColor, shadowBlur, gco) {
      ctx.globalCompositeOperation = gco;
      ctx.shadowColor = shadowColor || "black";
      ctx.shadowBlur = shadowBlur;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    }

    class Dot {
      constructor() {
        this.pos = { x: canvas.width / 2, y: canvas.height / 2 };
        this.dir = ((Math.random() * 3) | 0) * 2;
        this.step = 0;
      }

      redrawDot() {
        let color = "#33617c";
        let size = cfg.dotSize;
        let blur = 0;
        let x = this.pos.x - size / 2;
        let y = this.pos.y - size / 2;

        drawRect(color, x, y, size, size, color, blur);
      }

      moveDot() {
        this.step++;
        this.pos.x += dirstList[this.dir].x * cfg.dotVelocity;
        this.pos.y += dirstList[this.dir].y * cfg.dotVelocity;
      }

      changeDir() {
        if (this.step % cfg.stepsToTurn === 0) {
          this.dir =
            Math.random() > 0.5
              ? (this.dir + 1) % cfg.dirsCount
              : (this.dir + cfg.dirsCount - 1) % cfg.dirsCount;
        }
      }

      killDot(id) {
        let percent = Math.exp(this.step / cfg.distance) * Math.random();
        if (percent > 100) {
          dotList.splice(id, 1);
        }
      }
    }

    const dirstList = [];

    function createDirs() {
      for (let i = 0; i < 360; i += 360 / cfg.dirsCount) {
        let x = Math.cos((i * Math.PI) / 180);
        let y = Math.sin((i * Math.PI) / 180);
        dirstList.push({ x: x, y: y });
      }
    }

    createDirs();

    let dotList = [];

    function addDot() {
      if (dotList.length < cfg.dotCount && Math.random() > 0.8) {
        dotList.push(new Dot());
      }
    }

    function refreshDots() {
      dotList.forEach((i, id) => {
        i.moveDot();
        i.redrawDot();
        i.changeDir();
        i.killDot(id);
      });
    }

    function loop() {
      drawRect(cfg.bgFillColor, 0, 0, canvas.width, canvas.height, 0, 0);
      addDot();
      refreshDots();

      animationFrameId = requestAnimationFrame(loop);
    }

    function resizeCanvas() {
      canvas.width = window.innerWidth * 2;
      canvas.height = window.innerHeight * 2;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    loop();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
      <PreLoader />
    </div>
  );
}
