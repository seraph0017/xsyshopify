"use client";

import { CheckCircle2, FileUp, LoaderCircle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";

import { filePreviewAnalyticsEvent, rfqSubmissionAnalyticsEvent, trackAnalyticsEnvelope, trackEvent } from "@/lib/analytics";
import { validateRfq, type RfqErrors, type RfqFile, type RfqInput } from "@/lib/rfq";

const emptyInput: RfqInput = {
  name: "",
  email: "",
  company: "",
  country: "United States",
  postalCode: "",
  projectType: "",
  dimensions: "",
  panelFinish: "",
  scope: "",
  quantity: 1,
  timeline: "",
  consent: false,
  files: [],
};

function projectTypeFromProduct(handle?: string): string {
  if (!handle) return "";
  if (handle.includes("sideboard")) return "sideboard";
  if (handle.includes("console") && handle.includes("media")) return "media-console";
  if (handle.includes("console")) return "console";
  if (handle.includes("shelving")) return "shelving";
  if (handle.includes("table")) return "work-table";
  if (handle.includes("bench")) return "bench";
  return "other";
}

export function RfqForm({ initialProduct, initialProject, initialScope }: { initialProduct?: string; initialProject?: string; initialScope?: string }) {
  const initialInput = {
    ...emptyInput,
    projectType: initialProject ?? projectTypeFromProduct(initialProduct),
    scope: initialScope ?? (initialProduct ? `Please review a custom configuration based on ${initialProduct}. ` : ""),
  };
  const [input, setInput] = useState<RfqInput>(initialInput);
  const [errors, setErrors] = useState<RfqErrors>({});
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [reference, setReference] = useState("");
  const started = useRef(false);
  const successRef = useRef<HTMLElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!reference) return;
    successRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    successHeadingRef.current?.focus();
  }, [reference]);

  function markStarted() {
    if (started.current) return;
    started.current = true;
    trackEvent("rfq_start", { project_type: input.projectType || "not_selected", source_page: "/rfq", product_handle: initialProduct ?? "none" });
  }

  function update<K extends keyof RfqInput>(key: K, value: RfqInput[K]) {
    markStarted();
    setInput((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const files: RfqFile[] = Array.from(event.target.files ?? []).map((file) => ({ name: file.name, size: file.size, type: file.type }));
    update("files", files);
    if (files.length) trackAnalyticsEnvelope(filePreviewAnalyticsEvent(files));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    markStarted();
    const nextErrors = validateRfq(input);
    setErrors(nextErrors);
    setServerError("");
    if (Object.keys(nextErrors).length) {
      const first = Object.keys(nextErrors)[0];
      document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/rfq", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
      const result = await response.json() as { reference?: string; persisted?: boolean; message?: string; errors?: RfqErrors };
      if (!response.ok || !result.reference) {
        if (result.errors) setErrors(result.errors);
        throw new Error(result.message || "The custom-project request was not accepted.");
      }
      setReference(result.reference);
      trackAnalyticsEnvelope(rfqSubmissionAnalyticsEvent({ persisted: result.persisted === true, projectType: input.projectType, panelFinish: input.panelFinish, quantity: input.quantity, country: input.country, fileCount: input.files.length }));
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "The custom-project request was not accepted.");
    } finally {
      setPending(false);
    }
  }

  if (reference) {
    return (
      <section className="rfq-success" aria-labelledby="rfq-success-title" aria-live="polite" role="status" ref={successRef}>
        <CheckCircle2 aria-hidden="true" />
        <p className="ui-label">Custom project accepted</p>
        <h2 id="rfq-success-title" ref={successHeadingRef} tabIndex={-1}>Reference {reference}</h2>
        <p>This prototype accepted the project details and file metadata. It did not send or store uploaded file bytes.</p>
        <ol><li>Keep the reference with your room measurements.</li><li>Production integration must add secure file storage, review ownership, and notifications.</li><li>Material, construction, delivery, timing, and commercial terms are confirmed before an order.</li></ol>
        <div className="button-row"><Link className="button button--dark" href="/products">Return to furniture</Link><button className="button button--outline-dark" type="button" onClick={() => { setReference(""); setInput(initialInput); started.current = false; }}>Start another project</button></div>
      </section>
    );
  }

  return (
    <form className="rfq-form" onSubmit={submit} noValidate>
      <fieldset>
        <legend><span>01</span>Contact and destination</legend>
        <div className="form-grid">
          <Field id="name" label="Name" required error={errors.name}><input id="name" name="name" value={input.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} /></Field>
          <Field id="email" label="Work email" required error={errors.email}><input id="email" name="email" type="email" value={input.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} /></Field>
          <Field id="company" label="Company or studio"><input id="company" name="company" value={input.company} onChange={(event) => update("company", event.target.value)} autoComplete="organization" /></Field>
          <Field id="country" label="Shipping country" required error={errors.country}><select id="country" name="country" value={input.country} onChange={(event) => update("country", event.target.value)} aria-invalid={Boolean(errors.country)} aria-describedby={errors.country ? "country-error" : undefined}><option>United States</option><option>Canada</option></select></Field>
          <Field id="postalCode" label="Destination ZIP / postal code" required error={errors.postalCode}><input id="postalCode" name="postalCode" value={input.postalCode} onChange={(event) => update("postalCode", event.target.value)} autoComplete="postal-code" aria-invalid={Boolean(errors.postalCode)} aria-describedby={errors.postalCode ? "postalCode-error" : undefined} /></Field>
        </div>
      </fieldset>
      <fieldset>
        <legend><span>02</span>Furniture and room</legend>
        <div className="form-grid">
          <Field id="projectType" label="Furniture type" required error={errors.projectType}><select id="projectType" name="projectType" value={input.projectType} onChange={(event) => update("projectType", event.target.value)} aria-invalid={Boolean(errors.projectType)} aria-describedby={errors.projectType ? "projectType-error" : undefined}><option value="">Select one</option><option value="console">Console</option><option value="sideboard">Sideboard</option><option value="media-console">Media console</option><option value="shelving">Shelving</option><option value="work-table">Work table</option><option value="bench">Bench</option><option value="collection">Multi-piece collection</option><option value="other">Other furniture</option></select></Field>
          <Field id="panelFinish" label="Panel finish" required error={errors.panelFinish}><select id="panelFinish" name="panelFinish" value={input.panelFinish} onChange={(event) => update("panelFinish", event.target.value)} aria-invalid={Boolean(errors.panelFinish)} aria-describedby={errors.panelFinish ? "panelFinish-error" : undefined}><option value="">Select one</option><option value="ocean-green">Ocean Green</option><option value="graphite">Graphite</option><option value="cool-gray">Cool Gray</option><option value="burgundy">Burgundy</option><option value="arctic-white">Arctic White</option><option value="supplier-match">Color match for review</option><option value="not-sure">Not sure yet</option></select></Field>
          <Field className="form-field--full" id="dimensions" label="Target dimensions" required error={errors.dimensions}><input id="dimensions" name="dimensions" maxLength={500} value={input.dimensions} onChange={(event) => update("dimensions", event.target.value)} aria-invalid={Boolean(errors.dimensions)} aria-describedby={errors.dimensions ? "dimensions-error" : undefined} placeholder={'Width x depth x height, plus any clearances'} /></Field>
          <Field id="quantity" label="Project quantity" required error={errors.quantity}><input id="quantity" name="quantity" type="number" min="1" max="10000" step="1" value={input.quantity} onChange={(event) => update("quantity", Number(event.target.value))} aria-invalid={Boolean(errors.quantity)} aria-describedby={errors.quantity ? "quantity-error" : undefined} /></Field>
          <Field id="timeline" label="Target timeline" required error={errors.timeline}><select id="timeline" name="timeline" value={input.timeline} onChange={(event) => update("timeline", event.target.value)} aria-invalid={Boolean(errors.timeline)} aria-describedby={errors.timeline ? "timeline-error" : undefined}><option value="">Select one</option><option value="less-than-4-weeks">Less than 4 weeks</option><option value="4-8-weeks">4-8 weeks</option><option value="8-12-weeks">8-12 weeks</option><option value="planning">Planning / date not fixed</option></select></Field>
          <Field className="form-field--full" id="scope" label="Room, storage, and configuration needs" required error={errors.scope}><textarea id="scope" name="scope" rows={6} maxLength={4000} value={input.scope} onChange={(event) => update("scope", event.target.value)} aria-invalid={Boolean(errors.scope)} aria-describedby={errors.scope ? "scope-error" : undefined} placeholder="Describe the room, intended use, doors or open bays, cable needs, access path, and anything that should change from the standard piece." /></Field>
        </div>
      </fieldset>
      <fieldset>
        <legend><span>03</span>Plans and reference images</legend>
        <div className="file-field">
          <FileUp aria-hidden="true" /><div><label htmlFor="files">Select files</label><p>Up to 5 PDF, PNG, JPG, or ZIP files. Maximum 25 MB each.</p><small>Prototype behavior: only name, size, and MIME type are sent; file bytes stay in the browser.</small></div>
          <input id="files" name="files" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.zip" onChange={selectFiles} aria-invalid={Boolean(errors.files)} aria-describedby={errors.files ? "files-error" : undefined} />
        </div>
        {input.files.length ? <ul className="selected-files">{input.files.map((file) => <li key={`${file.name}-${file.size}`}><span>{file.name}<small>{Math.ceil(file.size / 1024)} KB</small></span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => update("files", input.files.filter((candidate) => candidate !== file))}><X aria-hidden="true" size={15} /></button></li>)}</ul> : null}
        {errors.files ? <p className="field-error" id="files-error">{errors.files}</p> : null}
      </fieldset>
      <fieldset>
        <legend><span>04</span>Review and submit</legend>
        <div className="consent-field"><input id="consent" name="consent" type="checkbox" checked={input.consent} onChange={(event) => update("consent", event.target.checked)} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "consent-error" : undefined} /><label htmlFor="consent">I confirm these project details may be used to prepare and review this request. Submission does not create an order, delivery date, or production commitment.</label></div>
        {errors.consent ? <p className="field-error" id="consent-error">{errors.consent}</p> : null}
        {serverError ? <p className="form-message form-message--error" role="alert">{serverError}</p> : null}
        <button className="button button--green rfq-submit" type="submit" disabled={pending}>{pending ? <><LoaderCircle className="spin" aria-hidden="true" />Submitting...</> : "Submit custom project"}</button>
      </fieldset>
    </form>
  );
}

function Field({ id, label, required = false, error, className = "", children }: { id: string; label: string; required?: boolean; error?: string; className?: string; children: ReactNode }) {
  return <div className={`form-field ${className}`}><label htmlFor={id}>{label}{required ? <span>Required</span> : null}</label>{children}{error ? <p className="field-error" id={`${id}-error`}>{error}</p> : null}</div>;
}
