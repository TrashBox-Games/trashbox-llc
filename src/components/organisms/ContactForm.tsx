"use client";

import { type FormEvent, useState } from "react";
import { FadeIn } from "@/components/atoms/FadeIn";
import { Reveal } from "@/components/atoms/Reveal";
import { submitContactForm } from "@/lib/contact-form";

const fieldClass =
  "w-full border-0 border-b border-outline-variant bg-transparent py-4 text-white placeholder:text-outline-variant/50 focus:border-primary focus:ring-0 focus:outline-none";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const service = String(data.get("service") || "").trim();
    const message = String(data.get("message") || "").trim();
    const honeypot = String(data.get("_honeypot") || "");

    if (honeypot) {
      setStatus("sent");
      return;
    }

    if (!name || !email || !message) {
      setStatus("error");
      setErrorMessage("Please fill in name, email, and message.");
      return;
    }

    setStatus("sending");
    const result = await submitContactForm({
      name,
      email,
      message: service ? `[${service}]\n\n${message}` : message,
      metadata: service ? { service } : undefined,
    });

    if (result.success) {
      setStatus("sent");
      form.reset();
    } else {
      setStatus("error");
      setErrorMessage(result.message);
    }
  }

  return (
    <section className="mx-auto max-w-4xl border-t border-outline-variant/10 pt-24" id="contact">
      <Reveal className="mb-20 text-center">
        <h2 className="mb-4 font-headline text-5xl font-bold tracking-tighter text-white uppercase">
          Start a Project
        </h2>
        <p className="font-label text-sm tracking-widest text-outline uppercase">
          Initiate the transmission
        </p>
      </Reveal>

      <FadeIn>
        <form className="space-y-12" onSubmit={onSubmit}>
          <input
            type="text"
            name="_honeypot"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
          />
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-label text-[10px] tracking-widest text-outline uppercase">
                Client Identity
              </label>
              <input
                name="name"
                placeholder="Your Name"
                type="text"
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-2 block font-label text-[10px] tracking-widest text-outline uppercase">
                Transmission Endpoint
              </label>
              <input
                name="email"
                placeholder="Email Address"
                type="email"
                required
                className={fieldClass}
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block font-label text-[10px] tracking-widest text-outline uppercase">
              Project Objective
            </label>
            <select
              name="service"
              className="w-full appearance-none border-0 border-b border-outline-variant bg-transparent py-4 text-white focus:border-primary focus:ring-0 focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled className="bg-surface-container">
                Select Service Area
              </option>
              <option className="bg-surface-container">App Design</option>
              <option className="bg-surface-container">Full-Stack Development</option>
              <option className="bg-surface-container">AI Integration</option>
              <option className="bg-surface-container">General Inquiry</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block font-label text-[10px] tracking-widest text-outline uppercase">
              Manifesto / Brief
            </label>
            <textarea
              name="message"
              placeholder="Tell us about the monolith you want to build..."
              rows={4}
              required
              className={`${fieldClass} resize-none`}
            />
          </div>
          {status === "sent" && (
            <p className="text-sm text-on-surface-variant">
              Transmission received. We&apos;ll be in touch.
            </p>
          )}
          {status === "error" && errorMessage && (
            <p className="text-sm text-red-300">{errorMessage}</p>
          )}
          <div className="pt-8">
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-primary py-6 font-headline font-bold tracking-[0.3em] text-on-primary uppercase transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
            >
              {status === "sending" ? "Sending…" : "Send Transmission"}
            </button>
          </div>
        </form>
      </FadeIn>
    </section>
  );
}
