"use client";
import { useState } from "react";
import { Shield, Flame, HeartHandshake, CheckCircle2 } from "lucide-react";
import { useResource } from "@/lib/use-resource";
import type { Meta } from "@/lib/contracts";
import { Notice } from "@/components/ui";

const GROUPS = [
  {
    id: "security",
    title: "Seguridad y amenazas",
    icon: Shield,
    description: "Robo, extorsión y violencia.",
  },
  {
    id: "emergency",
    title: "Emergencias",
    icon: Flame,
    description: "Incendios, accidentes y salud.",
  },
  {
    id: "community",
    title: "Ayuda comunitaria",
    icon: HeartHandshake,
    description: "Mascotas y apoyo vecinal.",
  },
] as const;

export function QuickGuidance(): React.JSX.Element {
  const { data: meta, loading, error } = useResource<Meta>("meta");
  const [group, setGroup] = useState("security");
  const [type, setType] = useState("extortion");
  const categories = meta?.categories.filter((c) => c.group === group) || [];
  const selected = categories.find((c) => c.id === type) || categories[0];

  return (
    <section className="panel guidance-card" aria-label="Guía de primeros pasos">
      <div className="guidance-header">
        <div>
          <span className="eyebrow">PRIMEROS PASOS</span>
          <h2>¿Qué hacer según la situación?</h2>
        </div>
        <div className="guidance-tabs" role="tablist" aria-label="Categoría de orientación">
          {GROUPS.map((item) => {
            const active = group === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`guidance-tab ${active ? "active" : ""}`}
                onClick={() => {
                  setGroup(item.id);
                  setType("");
                }}
              >
                <item.icon size={16} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <Notice>Cargando orientación…</Notice>
      ) : error ? (
        <Notice error>{error}</Notice>
      ) : selected ? (
        <div className="guidance-body">
          <div className="guidance-topics" role="listbox" aria-label="Situación específica">
            {categories.map((c) => {
              const active = selected.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`guidance-topic-btn ${active ? "active" : ""}`}
                  onClick={() => setType(c.id)}
                >
                  <strong>{c.label}</strong>
                  <span>Ver {c.advice.length} pasos recomendados</span>
                </button>
              );
            })}
          </div>
          <div className="guidance-steps-box">
            <div className="guidance-steps-head">
              <CheckCircle2 size={18} />
              <h3>Pasos recomendados: {selected.label}</h3>
            </div>
            <ol className="guidance-steps">
              {selected.advice.map((advice) => (
                <li key={advice}>{advice}</li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <Notice>La orientación no está disponible por el momento.</Notice>
      )}
    </section>
  );
}
