import { useEffect, useState } from "react";

interface Shape {
  id: number;
  type: "circle" | "triangle" | "square" | "diamond" | "line";
  color: string;
  size: number;
  x: number;
  y: number;
  rotation: number;
}

const colors = [
  "oklch(0.75 0.12 300)", // Lilac
  "oklch(0.8 0.08 160)", // Mint
  "oklch(0.85 0.12 90)", // Yellow
  "oklch(0.75 0.15 340)", // Pink
  "oklch(0.75 0.1 220)", // Blue
];

export function GeometricBackground() {
  const [shapes, setShapes] = useState<Shape[]>([]);

  useEffect(() => {
    // Generate random shapes
    const generatedShapes: Shape[] = [];
    const shapeTypes: Shape["type"][] = ["circle", "triangle", "square", "diamond", "line"];
    
    for (let i = 0; i < 20; i++) {
      generatedShapes.push({
        id: i,
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 80 + 20, // 20-100px
        x: Math.random() * 100, // 0-100%
        y: Math.random() * 100, // 0-100%
        rotation: Math.random() * 360,
      });
    }
    
    setShapes(generatedShapes);
  }, []);

  const renderShape = (shape: Shape) => {
    const style: React.CSSProperties = {
      left: `${shape.x}%`,
      top: `${shape.y}%`,
      width: `${shape.size}px`,
      height: `${shape.size}px`,
      transform: `rotate(${shape.rotation}deg)`,
      backgroundColor: shape.type !== "line" ? shape.color : "transparent",
    };

    switch (shape.type) {
      case "circle":
        return (
          <div
            key={shape.id}
            className="geometric-shape rounded-full"
            style={style}
          />
        );
      case "triangle":
        return (
          <div
            key={shape.id}
            className="geometric-shape"
            style={{
              ...style,
              backgroundColor: "transparent",
              borderLeft: `${shape.size / 2}px solid transparent`,
              borderRight: `${shape.size / 2}px solid transparent`,
              borderBottom: `${shape.size}px solid ${shape.color}`,
              width: 0,
              height: 0,
            }}
          />
        );
      case "square":
        return (
          <div
            key={shape.id}
            className="geometric-shape"
            style={style}
          />
        );
      case "diamond":
        return (
          <div
            key={shape.id}
            className="geometric-shape"
            style={{
              ...style,
              transform: `rotate(${shape.rotation + 45}deg)`,
            }}
          />
        );
      case "line":
        return (
          <div
            key={shape.id}
            className="geometric-shape"
            style={{
              ...style,
              height: "4px",
              backgroundColor: shape.color,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="geometric-bg absolute inset-0 pointer-events-none">
      {shapes.map(renderShape)}
    </div>
  );
}
