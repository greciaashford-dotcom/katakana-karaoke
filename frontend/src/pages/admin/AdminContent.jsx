import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { HoursEditor } from "./HoursEditor";

const emptyGallery = { imageUrl: "", alt: "", order: 0 };

const Field = ({ label, hint, full, children }) => <label className={full ? "full" : undefined}>{label}{hint && <small> ({hint})</small>}{children}</label>;

export default function AdminContent() {
  const client = useQueryClient();
  const { data } = useQuery({ queryKey: ["site"], queryFn: async () => (await api.get("/site")).data });
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [galleryForm, setGalleryForm] = useState(emptyGallery);
  useEffect(() => { if (data?.settings) setForm(data.settings); }, [data]);
  const bind = (key) => ({ value: form[key] || "", onChange: (e) => setForm({ ...form, [key]: e.target.value }) });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: result } = await api.put("/admin/settings", form);
      setForm(result.settings);
      client.invalidateQueries({ queryKey: ["site"] });
      toast.success("Contenido actualizado");
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };
  const addImage = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/gallery", galleryForm);
      setGalleryForm(emptyGallery);
      client.invalidateQueries({ queryKey: ["site"] });
      toast.success("Imagen añadida");
    } catch (error) { toast.error(error.response?.data?.error || "No se pudo añadir"); }
  };
  const remove = async (id) => {
    if (!window.confirm("¿Eliminar esta imagen?")) return;
    await api.delete(`/admin/gallery/${id}`);
    client.invalidateQueries({ queryKey: ["site"] });
    toast.success("Imagen eliminada");
  };

  if (!form) return <div className="admin-loading" data-testid="admin-content-loading">Cargando contenido…</div>;
  const saveButton = <button className="admin-save" disabled={saving} data-testid="admin-settings-save-button"><Save /> {saving ? "Guardando…" : "Guardar cambios"}</button>;
  return (
    <div className="admin-page" data-testid="admin-content-page">
      <header className="admin-page-header"><div><p className="admin-kicker">EXPERIENCIA PÚBLICA</p><h1 data-testid="admin-content-heading">Contenido</h1></div></header>
      <form onSubmit={save} data-testid="admin-settings-form">
        <section className="admin-form-section">
          <div className="admin-section-title"><div><h2>Portada</h2><p>Textos e imágenes de la primera impresión.</p></div>{saveButton}</div>
          <div className="admin-form-grid">
            <Field label="Título principal"><input required {...bind("heroTitle")} data-testid="admin-hero-title-input" /></Field>
            <Field label="Descripción"><input required {...bind("heroDescription")} data-testid="admin-hero-description-input" /></Field>
            <Field label="URL de la imagen de portada" full><input required {...bind("heroImageUrl")} data-testid="admin-hero-image-input" /></Field>
            <Field label="URL del vídeo de fondo" hint="opcional" full><input {...bind("heroVideoUrl")} placeholder="https://…/video.mp4" data-testid="admin-hero-video-input" /></Field>
            <Field label="URL del logo" full><input required {...bind("logoUrl")} data-testid="admin-logo-url-input" /></Field>
            <Field label="Aviso destacado" hint="se muestra sobre la cabecera; déjalo vacío para ocultarlo" full><input {...bind("notice")} placeholder="Ej.: Este sábado, fiesta de Halloween" data-testid="admin-notice-input" /></Field>
          </div>
        </section>
        <section className="admin-form-section" data-testid="admin-hours-section">
          <div className="admin-section-title"><div><h2>Horarios</h2><p>Se usan para el estado «Abierto ahora», el pie de página y la página de contacto.</p></div>{saveButton}</div>
          <HoursEditor hours={form.hours || []} onChange={(hours) => setForm({ ...form, hours })} />
          <div className="admin-form-grid">
            <Field label="Nota de horario" hint="festivos o excepciones"><input {...bind("hoursNote")} data-testid="admin-hours-note-input" /></Field>
            <Field label="Atención a reservas"><input {...bind("reservationHours")} data-testid="admin-reservation-hours-input" /></Field>
          </div>
        </section>
        <section className="admin-form-section" data-testid="admin-reviews-section">
          <div className="admin-section-title"><div><h2>Reseñas de Google</h2><p>Si dejas la valoración vacía, solo se mostrará el botón «Ver reseñas en Google».</p></div>{saveButton}</div>
          <div className="admin-form-grid">
            <Field label="Valoración media" hint="1 a 5, p. ej. 4,4"><input {...bind("googleRating")} inputMode="decimal" placeholder="4,4" data-testid="admin-google-rating-input" /></Field>
            <Field label="Número de reseñas" hint="opcional"><input {...bind("googleReviewCount")} inputMode="numeric" placeholder="850" data-testid="admin-google-count-input" /></Field>
            <Field label="Enlace a las reseñas en Google" full><input {...bind("googleReviewsUrl")} placeholder="https://g.page/…" data-testid="admin-google-url-input" /></Field>
          </div>
        </section>
      </form>
      <section className="admin-form-section" data-testid="admin-gallery-manager">
        <div className="admin-section-title"><div><h2>Galería</h2><p>Fotos que aparecen en Inicio y en El local.</p></div></div>
        <form className="gallery-add-form" onSubmit={addImage} data-testid="admin-gallery-add-form">
          <input required value={galleryForm.imageUrl} onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })} placeholder="URL de la imagen" data-testid="admin-gallery-url-input" />
          <input value={galleryForm.alt} onChange={(e) => setGalleryForm({ ...galleryForm, alt: e.target.value })} placeholder="Descripción accesible" data-testid="admin-gallery-alt-input" />
          <button data-testid="admin-gallery-add-button"><Plus /> Añadir</button>
        </form>
        <div className="admin-gallery-list">
          {data.gallery.map((item) => (
            <article key={item.id} data-testid={`admin-gallery-item-${item.id}`}>
              <img src={item.imageUrl} alt={item.alt} />
              <div><p data-testid={`admin-gallery-alt-${item.id}`}>{item.alt}</p><small>{item.imageUrl}</small></div>
              <button type="button" onClick={() => remove(item.id)} aria-label="Eliminar imagen" data-testid={`admin-gallery-delete-${item.id}`}><Trash2 /></button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
