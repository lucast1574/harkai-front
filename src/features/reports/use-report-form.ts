"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useResource } from "@/lib/use-resource";
import type { Analysis, Incident, Meta } from "@/lib/contracts";
export function useReportForm() {
  const { data: meta, error: metaError } = useResource<Meta>("meta");
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("");
  const [shareContact, setShareContact] = useState(false);
  const [media, setMedia] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const category = meta?.categories.find((c) => c.id === type);
  async function analyze(): Promise<void> {
    setBusy(true);
    setError("");
    try {
      const result = await api<Analysis>("analysis/text", {
        method: "POST",
        body: JSON.stringify({ text: description, selected_type: type }),
      });
      setAnalysis(result);
      if (!type && result.suggested_type) setType(result.suggested_type);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
    return;
  }
  async function photo(file?: File): Promise<void> {
    if (!file) return;
    setMedia("");
    setPhotoName("");
    setError("");
    if (
      file.size > 5 * 1024 * 1024 ||
      !["image/jpeg", "image/png"].includes(file.type)
    ) {
      setError("Elige una foto JPG o PNG de hasta 5 MB.");
      return;
    }
    setBusy(true);
    try {
      const result = await api<{ id: string }>("media", {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      setMedia(result.id);
      setPhotoName(file.name);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
    return;
  }
  async function publish(): Promise<void> {
    setBusy(true);
    setError("");
    try {
      const result = await api<Incident>("incidents", {
        method: "POST",
        body: JSON.stringify({
          type,
          description,
          latitude: Number(lat),
          longitude: Number(lng),
          district,
          city,
          country: "PE",
          ...(media ? { media_id: media } : {}),
          contact_info: contact,
          share_contact: shareContact,
        }),
      });
      router.push(`/incidents/${result.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
    return;
  }
  return {
    meta,
    metaError,
    step,
    setStep,
    description,
    setDescription,
    type,
    setType,
    analysis,
    setAnalysis,
    lat,
    setLat,
    lng,
    setLng,
    district,
    setDistrict,
    city,
    setCity,
    contact,
    setContact,
    shareContact,
    setShareContact,
    media,
    photoName,
    busy,
    error,
    setError,
    category,
    analyze,
    photo,
    publish,
  };
}
