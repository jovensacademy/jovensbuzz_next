"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Filter, X } from "lucide-react";
import { titleCase } from "@/lib/format";
import { ENQUIRY_STATUSES } from "@/types/api";
import { enquiryListHref, type EnquiryQuery } from "./query";
import styles from "@/features/admin/admin.module.css";

/** Filter bar: submitting updates the URL, and the server re-queries the API (backend pagination). */
export function EnquiryFilters({ query, services }: { query: EnquiryQuery; services: string[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (key: string) => data.get(key)?.toString().trim() ?? "";
    startTransition(() => {
      router.push(
        enquiryListHref(query, {
          search: value("search"),
          status: value("status"),
          service: value("service"),
          from: value("from"),
          to: value("to"),
          page: 1,
        }),
      );
    });
  };

  const hasFilters = Boolean(query.search || query.status || query.service || query.from || query.to);

  return (
    <form className={styles.toolbar} onSubmit={onSubmit} role="search" aria-label="Filter enquiries" aria-busy={pending}>
      <div className="field">
        <label className="field-label" htmlFor="filter-search">
          Search
        </label>
        <input
          id="filter-search"
          name="search"
          type="search"
          className="input"
          defaultValue={query.search}
          placeholder="Name, email, company or enquiry ID"
        />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="filter-status">
          Status
        </label>
        <select id="filter-status" name="status" className="select" defaultValue={query.status}>
          <option value="">All statuses</option>
          {ENQUIRY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {titleCase(status)}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="field-label" htmlFor="filter-service">
          Service
        </label>
        <select id="filter-service" name="service" className="select" defaultValue={query.service}>
          <option value="">All services</option>
          {services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="field-label" htmlFor="filter-from">
          From
        </label>
        <input id="filter-from" name="from" type="date" className="input" defaultValue={query.from} max={query.to || undefined} />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="filter-to">
          To
        </label>
        <input id="filter-to" name="to" type="date" className="input" defaultValue={query.to} min={query.from || undefined} />
      </div>
      <div className={styles.toolbarActions}>
        <button type="submit" className="btn btn-dark btn-sm" disabled={pending}>
          <Filter size={15} aria-hidden /> {pending ? "Filtering…" : "Apply"}
        </button>
        {hasFilters && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => startTransition(() => router.push("/admin/enquiries"))}
          >
            <X size={15} aria-hidden /> Clear
          </button>
        )}
      </div>
    </form>
  );
}
