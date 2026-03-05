"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { LayoutGrid } from "@/components/page/layout-grid";
import type { ComputerSlot, LayoutConfig } from "@/lib/types";
import { PlusIcon, Trash2Icon, GripVerticalIcon, ArrowRightLeftIcon, AlertTriangleIcon } from "lucide-react";


interface NumInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  className?: string;
}

function NumInput({ value, onChange, min, step, className }: NumInputProps) {
  const [str, setStr] = useState(String(value));
  const prevRef = useRef(value);

  useEffect(() => {
    if (value !== prevRef.current) {
      prevRef.current = value;
      setStr(String(value));
    }
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setStr(raw);
    const num = raw === "" ? 0 : parseFloat(raw);
    if (!isNaN(num)) {
      prevRef.current = num;
      onChange(num);
    }
  }, [onChange]);

  return (
    <Input
      type="text"
      inputMode="decimal"
      className={className}
      value={str}
      min={min}
      step={step}
      onChange={handleChange}
    />
  );
}

function overlaps(a: ComputerSlot, b: ComputerSlot): boolean {
  return (
    a.start[0] < b.start[0] + b.size[0] &&
    a.start[0] + a.size[0] > b.start[0] &&
    a.start[1] < b.start[1] + b.size[1] &&
    a.start[1] + a.size[1] > b.start[1]
  );
}

function findOverlaps(list: ComputerSlot[]): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < list.length; i++)
    for (let j = i + 1; j < list.length; j++)
      if (overlaps(list[i], list[j])) pairs.push([i, j]);
  return pairs;
}

interface RowProps {
  label: React.ReactNode;
  comp: ComputerSlot;
  onChangeXY: (axis: 0 | 1, v: number) => void;
  onChangeWH: (axis: 0 | 1, v: number) => void;
  onRotate: () => void;
  action: React.ReactNode;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> & { draggable?: boolean };
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isOver?: boolean;
}

function ComputerRow({ label, comp, onChangeXY, onChangeWH, onRotate, action, dragHandleProps, onDragOver, onDrop, isOver }: RowProps) {
  return (
    <div
      className={`flex items-center gap-2 flex-wrap rounded-md px-1 py-0.5 transition-colors ${isOver ? "bg-primary/5 ring-1 ring-primary/30" : ""}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div
        className={`flex items-center gap-0.5 w-12 shrink-0 select-none ${dragHandleProps ? "cursor-grab active:cursor-grabbing" : ""}`}
        {...dragHandleProps}
      >
        {dragHandleProps && <GripVerticalIcon className="size-3 text-muted-foreground shrink-0" />}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground font-medium select-none">X,Y</span>
        <NumInput className="w-14" min={0} step={0.1} value={comp.start[0]}
          onChange={v => onChangeXY(0, v)} />
        <NumInput className="w-14" min={0} step={0.1} value={comp.start[1]}
          onChange={v => onChangeXY(1, v)} />
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground font-medium select-none">W,H</span>
        <NumInput className="w-14" min={0} step={0.1} value={comp.size[0]}
          onChange={v => onChangeWH(0, v)} />
        <Button variant="ghost" size="icon-sm" type="button" onClick={onRotate} title="Повернуть (поменять W и H)">
          <ArrowRightLeftIcon />
        </Button>
        <NumInput className="w-14" min={0} step={0.1} value={comp.size[1]}
          onChange={v => onChangeWH(1, v)} />
      </div>

      {action}
    </div>
  );
}

const EMPTY_NEW: ComputerSlot = { start: [0, 0], size: [1, 1] };

interface Props { initialLayout: LayoutConfig }

export default function AdminBookingForm({ initialLayout }: Props) {
  const [width, setWidth]       = useState(initialLayout.width);
  const [height, setHeight]     = useState(initialLayout.height);
  const [computers, setComputers] = useState<ComputerSlot[]>(initialLayout.computers);
  const [saved, setSaved]       = useState<LayoutConfig>(initialLayout);
  const [error, setError]       = useState("");
  const [newComp, setNewComp]   = useState<ComputerSlot>(EMPTY_NEW);

  const dragIdx = useRef<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  useEffect(() => {
    setWidth(initialLayout.width);
    setHeight(initialLayout.height);
    setComputers(initialLayout.computers);
    setSaved(initialLayout);
  }, [initialLayout]);

  const existingOverlaps = findOverlaps(computers);
  const newVisible = newComp.size[0] > 0 && newComp.size[1] > 0;
  const newOverlaps = newVisible && computers.some(c => overlaps(c, newComp));

  const previewList: ComputerSlot[] = newVisible ? [...computers, newComp] : computers;

  const isDirty =
    width !== saved.width ||
    height !== saved.height ||
    JSON.stringify(computers) !== JSON.stringify(saved.computers);

  function setComp(i: number, field: keyof ComputerSlot, axis: 0 | 1, v: number) {
    setComputers(prev => prev.map((c, idx) => {
      if (idx !== i) return c;
      const next: ComputerSlot = { ...c, [field]: [c[field][0], c[field][1]] as [number, number] };
      next[field][axis] = v;
      return next;
    }));
  }

  function rotateComp(i: number) {
    setComputers(prev => prev.map((c, idx) =>
      idx !== i ? c : { ...c, size: [c.size[1], c.size[0]] }
    ));
  }

  function removeComp(i: number) {
    setComputers(prev => prev.filter((_, idx) => idx !== i));
  }

  function setNew(field: keyof ComputerSlot, axis: 0 | 1, v: number) {
    setNewComp(prev => {
      const next: ComputerSlot = { ...prev, [field]: [prev[field][0], prev[field][1]] as [number, number] };
      next[field][axis] = v;
      return next;
    });
  }

  function addComp() {
    if (!newVisible) return;
    setComputers(prev => [...prev, newComp]);
  }

  function handleDragStart(e: React.DragEvent, i: number) {
    dragIdx.current = i;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIdx(i);
  }

  function handleDrop(e: React.DragEvent, dropI: number) {
    e.preventDefault();
    const from = dragIdx.current;
    if (from !== null && from !== dropI) {
      setComputers(prev => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(dropI, 0, moved);
        return next;
      });
    }
    dragIdx.current = null;
    setOverIdx(null);
  }

  function handleDragEnd() {
    dragIdx.current = null;
    setOverIdx(null);
  }

  function cancel() {
    setWidth(saved.width);
    setHeight(saved.height);
    setComputers(saved.computers);
    setError("");
  }

  async function save() {
    setError("");
    const res = await fetch("/api/admin/layout", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ width, height, computers }),
    });
    if (res.ok) {
      setSaved({ width, height, computers });
    } else {
      const data = await res.json();
      setError(data.error ?? "Ошибка сохранения");
    }
  }

  return (
    <FieldSet className="w-full max-w-3xl">
      <FieldLegend>Редактор layout</FieldLegend>

      <FieldSeparator />

      <FieldGroup>
        <div className="w-full max-w-sm mx-auto">
        <LayoutGrid
          width={width}
          height={height}
          computers={previewList}
          renderButton={(id) => {
            const isPending = id === computers.length;
            return (
              <button
                type="button"
                className={`w-full h-full border rounded text-xs font-medium transition-colors pointer-events-none
                  ${isPending
                    ? "bg-primary/10 border-primary/40 opacity-50"
                    : "bg-primary/10 border-primary/30"
                  }`}
              >
                {isPending ? "new" : `#${id}`}
              </button>
            );
          }}
        />
        </div>
      </FieldGroup>

      <FieldSeparator />

      <FieldGroup>
        <FieldLegend variant="label">Размер сетки</FieldLegend>
        <Field orientation="horizontal">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-muted-foreground font-medium w-6 shrink-0">Ш</span>
            <Input type="number" min={1} max={200} value={width}
              onChange={e => setWidth(Math.max(1, Number(e.target.value)))} />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-muted-foreground font-medium w-6 shrink-0">В</span>
            <Input type="number" min={1} max={200} value={height}
              onChange={e => setHeight(Math.max(1, Number(e.target.value)))} />
          </div>
        </Field>
      </FieldGroup>

      <FieldSeparator />

      <FieldGroup>
        <FieldLegend variant="label">Компьютеры</FieldLegend>

        {computers.map((comp, i) => (
          <ComputerRow
            key={i}
            comp={comp}
            label={`#${i}`}
            isOver={overIdx === i}
            onChangeXY={(axis, v) => setComp(i, "start", axis, v)}
            onChangeWH={(axis, v) => setComp(i, "size", axis, v)}
            onRotate={() => rotateComp(i)}
            dragHandleProps={{
              draggable: true,
              onDragStart: (e: React.DragEvent) => handleDragStart(e, i),
              onDragEnd: handleDragEnd,
            }}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            action={
              <Button variant="ghost" size="icon-sm" type="button"
                onClick={() => removeComp(i)}
                className="text-destructive hover:text-destructive">
                <Trash2Icon />
              </Button>
            }
          />
        ))}

        <ComputerRow
          comp={newComp}
          label={<span className="text-muted-foreground/50 text-xs">new</span>}
          onChangeXY={(axis, v) => setNew("start", axis, v)}
          onChangeWH={(axis, v) => setNew("size", axis, v)}
          onRotate={() => setNewComp(prev => ({ ...prev, size: [prev.size[1], prev.size[0]] }))}
          action={
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              onClick={addComp}
              title={newOverlaps ? "Есть пересечения, но добавить можно" : "Добавить компьютер"}
              className={newOverlaps ? "text-amber-500 hover:text-amber-600" : ""}
            >
              {newOverlaps ? <AlertTriangleIcon /> : <PlusIcon />}
            </Button>
          }
        />
      </FieldGroup>

      {existingOverlaps.length > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          ⚠ Пересечения: {existingOverlaps.map(([a, b]) => `#${a} и #${b}`).join(", ")}
        </div>
      )}

      <FieldSeparator />

      <FieldGroup>
        <Field orientation="horizontal">
          <Button type="button" onClick={save} disabled={!isDirty}>Подтвердить</Button>
          <Button variant="outline" type="button" onClick={cancel} disabled={!isDirty}>Отменить</Button>
        </Field>
        <FieldError>{error}</FieldError>
      </FieldGroup>
    </FieldSet>
  );
}
