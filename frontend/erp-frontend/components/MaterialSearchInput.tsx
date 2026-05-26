"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { MaterialType } from "@/types/material";
import { searchMaterialTypes } from "@/services/material";

type MaterialSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (material: MaterialType) => void;
};

export default function MaterialSearchInput({
  value,
  onChange,
  onSelect,
}: MaterialSearchInputProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [items, setItems] = useState<MaterialType[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!value || value.trim().length < 2) {
        setItems([]);
        setOpen(false);
        return;
      }

      try {
        setLoading(true);
        const result = await searchMaterialTypes(value.trim());
        setItems(result);
        setOpen(true);
      } catch (error) {
        console.error("Gagal mencari jenis bahan:", error);
        setItems([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (material: MaterialType) => {
    onChange(material.name);
    onSelect(material);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />

        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (items.length > 0) setOpen(true);
          }}
          placeholder="Ketik jenis bahan, contoh: BMJ"
          className="w-full rounded-lg border border-slate-300 bg-white px-9 py-2 text-sm outline-none focus:border-slate-500"
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {loading && (
            <div className="px-4 py-3 text-sm text-slate-500">
              Mencari jenis bahan...
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-500">
              Jenis bahan tidak ditemukan
            </div>
          )}

          {!loading &&
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    {item.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    Ukuran bahan: {Number(item.width_cm)} x{" "}
                    {Number(item.length_cm)} cm
                  </div>
                </div>

                <div className="text-xs font-medium text-slate-500">
                  Pilih
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}