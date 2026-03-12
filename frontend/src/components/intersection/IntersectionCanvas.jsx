import { useEffect, useRef, useState } from "react";
import { ROAD_KEYS } from "../../utils/formatters.js";

const VEHICLE_COLORS = {
  cyan: "#67d4ff",
  gold: "#ffbf5f",
  mint: "#4de6b1",
  coral: "#ff7657",
};

function getQueueAnchor(road, index, size) {
  const center = size / 2;
  const gap = size * 0.055;

  switch (road) {
    case "north":
      return {
        x: center - size * 0.06,
        y: size * 0.12 + index * gap,
        rotation: Math.PI / 2,
      };
    case "south":
      return {
        x: center + size * 0.06,
        y: size * 0.88 - index * gap,
        rotation: -Math.PI / 2,
      };
    case "east":
      return {
        x: size * 0.88 - index * gap,
        y: center - size * 0.06,
        rotation: Math.PI,
      };
    case "west":
    default:
      return {
        x: size * 0.12 + index * gap,
        y: center + size * 0.06,
        rotation: 0,
      };
  }
}

function resolveExitRoad(entryRoad, movement) {
  const turns = {
    north: { straight: "south", left: "east", right: "west" },
    east: { straight: "west", left: "south", right: "north" },
    south: { straight: "north", left: "west", right: "east" },
    west: { straight: "east", left: "north", right: "south" },
  };

  return turns[entryRoad]?.[movement] ?? "south";
}

function getExitPosition(road, size) {
  const center = size / 2;

  switch (road) {
    case "north":
      return { x: center, y: size * 0.06 };
    case "south":
      return { x: center, y: size * 0.94 };
    case "east":
      return { x: size * 0.94, y: center };
    case "west":
    default:
      return { x: size * 0.06, y: center };
  }
}

function drawVehicle(ctx, { x, y, rotation }, color, isEmergency = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillRect(-8, -14, 16, 28);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(-5, -8, 10, 8);

  if (isEmergency) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-7, -16, 14, 3);
  }

  ctx.restore();
}

export function IntersectionCanvas({
  intersection,
  tickIntervalMs,
  generatedAt,
  compact = false,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState(compact ? 260 : 480);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const maxSize = compact ? 320 : 560;
    const minSize = compact ? 220 : 280;

    const updateCanvasSize = () => {
      const nextSize = Math.max(
        Math.min(container.clientWidth, maxSize),
        minSize,
      );
      setCanvasSize(nextSize);
    };

    updateCanvasSize();
    const observer = new ResizeObserver(updateCanvasSize);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [compact]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasSize) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    const size = canvasSize;
    const pixelRatio = window.devicePixelRatio || 1;
    const tickStart = Date.parse(generatedAt ?? new Date().toISOString());
    let frameId;

    canvas.width = size * pixelRatio;
    canvas.height = size * pixelRatio;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    context.scale(pixelRatio, pixelRatio);

    function render() {
      const center = size / 2;
      const progress = Math.min((Date.now() - tickStart) / tickIntervalMs, 1);

      context.clearRect(0, 0, size, size);

      context.fillStyle = "#0f1a2c";
      context.fillRect(0, 0, size, size);

      context.strokeStyle = "rgba(255,255,255,0.06)";
      context.lineWidth = 1;
      for (let offset = 0; offset < size; offset += size / 10) {
        context.beginPath();
        context.moveTo(offset, 0);
        context.lineTo(offset, size);
        context.stroke();
        context.beginPath();
        context.moveTo(0, offset);
        context.lineTo(size, offset);
        context.stroke();
      }

      context.fillStyle = "#273447";
      context.fillRect(size * 0.35, 0, size * 0.3, size);
      context.fillRect(0, size * 0.35, size, size * 0.3);

      context.fillStyle = "#172130";
      context.fillRect(size * 0.41, 0, size * 0.18, size);
      context.fillRect(0, size * 0.41, size, size * 0.18);

      context.strokeStyle = "rgba(255,255,255,0.2)";
      context.setLineDash([10, 12]);
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(center, 0);
      context.lineTo(center, size * 0.34);
      context.moveTo(center, size * 0.66);
      context.lineTo(center, size);
      context.moveTo(0, center);
      context.lineTo(size * 0.34, center);
      context.moveTo(size * 0.66, center);
      context.lineTo(size, center);
      context.stroke();
      context.setLineDash([]);

      context.fillStyle = "#111c2d";
      context.fillRect(size * 0.37, size * 0.37, size * 0.26, size * 0.26);

      ROAD_KEYS.forEach((road) => {
        const signalColor = intersection.signalState?.[road] ?? "red";
        const colorMap = {
          green: "#4de6b1",
          amber: "#ffbf5f",
          red: "#ff7657",
        };
        const bulbPosition = {
          north: { x: center - 32, y: size * 0.31 },
          east: { x: size * 0.69, y: center - 32 },
          south: { x: center + 32, y: size * 0.69 },
          west: { x: size * 0.31, y: center + 32 },
        }[road];

        context.fillStyle = "rgba(6,10,16,0.86)";
        context.beginPath();
        context.arc(bulbPosition.x, bulbPosition.y, 13, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = colorMap[signalColor];
        context.shadowColor = colorMap[signalColor];
        context.shadowBlur = 22;
        context.beginPath();
        context.arc(bulbPosition.x, bulbPosition.y, 8.5, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
      });

      ROAD_KEYS.forEach((road) => {
        (intersection.queues?.[road] ?? []).slice(0, compact ? 5 : 8).forEach((vehicle, index) => {
          drawVehicle(
            context,
            getQueueAnchor(road, index, size),
            VEHICLE_COLORS[vehicle.profileColor] ?? VEHICLE_COLORS.cyan,
            vehicle.priorityLevel === "emergency",
          );
        });
      });

      (intersection.lastDepartures ?? []).slice(0, compact ? 2 : 4).forEach((vehicle, index) => {
        const exitRoad = resolveExitRoad(vehicle.road, vehicle.movement);
        const startPoint = {
          x: center,
          y: center,
        };
        const endPoint = getExitPosition(exitRoad, size);
        const x = startPoint.x + (endPoint.x - startPoint.x) * progress;
        const y = startPoint.y + (endPoint.y - startPoint.y) * progress;
        const rotation =
          Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) + Math.PI / 2;

        drawVehicle(
          context,
          { x: x + index * 5, y: y + index * 3, rotation },
          VEHICLE_COLORS[vehicle.profileColor] ?? VEHICLE_COLORS.gold,
          vehicle.priorityLevel === "emergency",
        );
      });

      context.fillStyle = "rgba(239,243,255,0.9)";
      context.font = compact ? "600 14px Sora" : "600 18px Sora";
      context.fillText(intersection.name, size * 0.06, size * 0.08);
      context.fillStyle = "rgba(152,169,200,0.9)";
      context.font = compact ? "500 12px Sora" : "500 14px Sora";
      context.fillText(intersection.lastDecisionReason, size * 0.06, size * 0.92, size * 0.86);

      frameId = window.requestAnimationFrame(render);
    }

    render();

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [canvasSize, compact, generatedAt, intersection, tickIntervalMs]);

  return (
    <div ref={containerRef} className="w-full min-w-0">
      <canvas
        ref={canvasRef}
        className="mx-auto block max-w-full rounded-[28px] border border-white/10 bg-[#0f1a2c]"
      />
    </div>
  );
}
