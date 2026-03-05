import type { ComputerSlot } from "@/lib/types";
import type { ReactNode } from "react";

interface LayoutGridProps {
  width: number;
  height: number;
  computers: ComputerSlot[];
  renderButton: (id: number, comp: ComputerSlot) => ReactNode;
}

export function LayoutGrid({ width, height, computers, renderButton }: LayoutGridProps) {
  return (
    <div
      className="relative w-full border rounded-lg overflow-hidden bg-muted"
      style={{ aspectRatio: `${width}/${height}` }}
    >
      {computers.map((comp, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left:   `${(comp.start[0] / width)  * 100}%`,
            top:    `${(comp.start[1] / height) * 100}%`,
            width:  `${(comp.size[0]  / width)  * 100}%`,
            height: `${(comp.size[1]  / height) * 100}%`,
            padding: "2px",
          }}
        >
          {renderButton(i, comp)}
        </div>
      ))}
    </div>
  );
}
