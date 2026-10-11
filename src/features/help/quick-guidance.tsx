"use client";
import { useState } from "react";
import { Shield, Flame, HeartHandshake, ArrowRight } from "lucide-react";
import { useResource } from "@/lib/use-resource";
import type { Meta } from "@/lib/contracts";
import { Select, Notice } from "@/components/ui";
export function QuickGuidance(): React.JSX.Element {
  const { data: meta, loading, error } = useResource<Meta>("meta");
  const [group, setGroup] = useState("security");
  const [type, setType] = useState("extortion");
  const categories = meta?.categories.filter((c) => c.group === group) || [];
  const selected = categories.find((c) => c.id === type) || categories[0];
  return (
    <section className="guidance-overview">
      <div className="guidance-choices" aria-label="Situación para orientar">
        {[
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
            description: "Mascotas y lugares de ayuda.",
          },
        ].map((item) => (
          <button
            key={item.id}
            aria-pressed={group === item.id}
            className={group === item.id ? "selected" : ""}
            onClick={() => {
              setGroup(item.id);
              setType("");
            }}
          >
            <item.icon size={24} />
            <strong>{item.title}</strong>
            <span>{item.description}</span>
            <ArrowRight size={16} />
          </button>
        ))}
      </div>
      <div className="panel guidance-detail">
        <div>
          <span className="eyebrow">PRIMEROS PASOS</span>
          <h2>¿En qué necesitas orientación?</h2>
          <p className="muted">
            Elige una situación. Puedes consultar estas recomendaciones sin
            iniciar sesión.
          </p>
          <Select
            label="Situación"
            value={selected?.id || ""}
            disabled={loading || !categories.length}
            onChange={(e) => setType(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          {loading ? (
            <Notice>Cargando orientación…</Notice>
          ) : error ? (
            <Notice error>{error}</Notice>
          ) : selected ? (
            <>
              <h3>{selected.label}</h3>
              <ol className="guidance-steps">
                {selected.advice.map((advice) => (
                  <li key={advice}>{advice}</li>
                ))}
              </ol>
            </>
          ) : (
            <Notice>La orientación no está disponible por el momento.</Notice>
          )}
        </div>
      </div>
    </section>
  );
}
