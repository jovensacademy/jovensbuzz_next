"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";
import { ServiceIcon } from "@/components/sections/ServiceIcon";
import { adminRequest, errorMessage } from "@/lib/api/client";
import type { ServiceItem } from "@/types/api";
import styles from "@/features/admin/admin.module.css";
import local from "./content.module.css";

const ICON_OPTIONS = ["strategy", "content", "design", "video", "management", "branding", "web", "campaigns"];

const emptyService = (order: number): ServiceItem => ({
  title: "",
  slug: "",
  description: "",
  icon: "strategy",
  displayOrder: order,
  published: true,
});

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 128);
}

export function ServiceManager({ services }: { services: ServiceItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [busyId, setBusyId] = useState<number | "form" | null>(null);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setBusyId("form");
    setFeedback(null);
    try {
      const body = { ...editing, slug: editing.slug || slugify(editing.title) };
      if (editing.id) {
        await adminRequest(`/admin/services/${editing.id}`, { method: "PUT", body });
      } else {
        await adminRequest(`/admin/services`, { method: "POST", body });
      }
      setFeedback({ kind: "success", text: `“${editing.title}” saved. The public website has been refreshed.` });
      setEditing(null);
      router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusyId(null);
    }
  };

  const togglePublished = async (service: ServiceItem) => {
    setBusyId(service.id!);
    setFeedback(null);
    try {
      await adminRequest(`/admin/services/${service.id}`, { method: "PUT", body: { ...service, published: !service.published } });
      setFeedback({ kind: "success", text: `“${service.title}” is now ${service.published ? "hidden" : "published"}.` });
      router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (service: ServiceItem) => {
    if (!window.confirm(`Delete “${service.title}”? This cannot be undone. Consider hiding it instead.`)) return;
    setBusyId(service.id!);
    setFeedback(null);
    try {
      await adminRequest(`/admin/services/${service.id}`, { method: "DELETE" });
      setFeedback({ kind: "success", text: `“${service.title}” deleted.` });
      router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusyId(null);
    }
  };

  const nextOrder = services.reduce((max, s) => Math.max(max, s.displayOrder), 0) + 1;

  return (
    <div className={styles.stack}>
      {feedback && (
        <div className={`alert ${feedback.kind === "success" ? "alert-success" : "alert-error"}`} role={feedback.kind === "error" ? "alert" : "status"}>
          {feedback.kind === "success" ? <CheckCircle2 size={18} aria-hidden /> : <TriangleAlert size={18} aria-hidden />}
          <span>{feedback.text}</span>
        </div>
      )}

      {editing ? (
        <form className={`${styles.card} ${styles.formStack}`} onSubmit={save} aria-labelledby="service-form-title">
          <h2 id="service-form-title" style={{ fontSize: "1.0625rem" }}>
            {editing.id ? `Edit “${editing.title || "service"}”` : "New service"}
          </h2>
          <div className={local.formGrid}>
            <div className="field">
              <label className="field-label" htmlFor="svc-title">
                Title
              </label>
              <input
                id="svc-title"
                className="input"
                required
                maxLength={128}
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })
                }
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="svc-slug">
                URL slug
              </label>
              <input
                id="svc-slug"
                className="input"
                required
                maxLength={128}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                aria-describedby="svc-slug-hint"
              />
              <p id="svc-slug-hint" className="field-hint">
                Lowercase letters, numbers and hyphens. Used for future service pages.
              </p>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="svc-icon">
                Icon
              </label>
              <select id="svc-icon" className="select" value={editing.icon ?? ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })}>
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="svc-order">
                Display order
              </label>
              <input
                id="svc-order"
                className="input"
                type="number"
                min={0}
                max={9999}
                value={editing.displayOrder}
                onChange={(e) => setEditing({ ...editing, displayOrder: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="svc-description">
              Description
            </label>
            <textarea
              id="svc-description"
              className="textarea"
              required
              maxLength={600}
              rows={3}
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
            <p className="field-hint">{editing.description.length}/600 characters. Plain text only.</p>
          </div>
          <label className={local.checkbox}>
            <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
            Published on the website
          </label>
          <div className={styles.pageActions}>
            <button type="submit" className="btn btn-dark btn-sm" disabled={busyId === "form"}>
              {busyId === "form" ? "Saving…" : "Save service"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          <button type="button" className="btn btn-dark btn-sm" onClick={() => setEditing(emptyService(nextOrder))}>
            <Plus size={15} aria-hidden /> Add service
          </button>
        </div>
      )}

      <section className={styles.card} aria-label="Services">
        {services.length === 0 ? (
          <div className={styles.empty}>
            <strong>No services yet</strong>
            <span>Add your first service to show it on the website.</span>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">Services</caption>
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Service</th>
                  <th scope="col">Visibility</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>{service.displayOrder}</td>
                    <td>
                      <div className={local.serviceCell}>
                        <span className={local.iconChip}>
                          <ServiceIcon name={service.icon} size={18} />
                        </span>
                        <div>
                          <span className={styles.cellPrimary}>{service.title}</span>
                          <span className={styles.cellSub}>{service.description}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${service.published ? styles.badgeSuccess : styles.badgeNeutral}`}>
                        {service.published ? "Published" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.pageActions} style={{ flexWrap: "nowrap" }}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(service)} aria-label={`Edit ${service.title}`}>
                          <Pencil size={15} aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => togglePublished(service)}
                          disabled={busyId === service.id}
                          aria-label={service.published ? `Hide ${service.title}` : `Publish ${service.title}`}
                        >
                          {service.published ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => remove(service)}
                          disabled={busyId === service.id}
                          aria-label={`Delete ${service.title}`}
                        >
                          <Trash2 size={15} aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
