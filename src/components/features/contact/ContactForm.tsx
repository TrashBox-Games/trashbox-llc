"use client";

import { type FormEvent, useState } from "react";
import { FadeIn } from "@/components/atoms/FadeIn";
import { Reveal } from "@/components/atoms/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "@/lib/contact-form";

const SERVICE_NONE = "__none__";

const SERVICE_OPTIONS = [
  "App Design",
  "Full-Stack Development",
  "AI Integration",
  "General Inquiry",
] as const;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [service, setService] = useState(SERVICE_NONE);

  const serviceValue = service === SERVICE_NONE ? "" : service;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const selectedService = String(data.get("service") || "").trim();
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
      message: selectedService ? `[${selectedService}]\n\n${message}` : message,
      metadata: selectedService ? { service: selectedService } : undefined,
    });

    if (result.success) {
      setStatus("sent");
      form.reset();
      setService(SERVICE_NONE);
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
              <Label htmlFor="contact-name">Client Identity</Label>
              <Input
                id="contact-name"
                name="name"
                placeholder="Your Name"
                type="text"
                required
              />
            </div>
            <div>
              <Label htmlFor="contact-email">Transmission Endpoint</Label>
              <Input
                id="contact-email"
                name="email"
                placeholder="Email Address"
                type="email"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="contact-service">Project Objective</Label>
            <input type="hidden" name="service" value={serviceValue} />
            <Select
              value={service}
              onValueChange={setService}
            >
              <SelectTrigger id="contact-service" aria-label="Project Objective" className="py-4">
                <SelectValue placeholder="Select Service Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SERVICE_NONE} disabled className="hidden">
                  Select Service Area
                </SelectItem>
                {SERVICE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="contact-message">Manifesto / Brief</Label>
            <Textarea
              id="contact-message"
              name="message"
              placeholder="Tell us about the monolith you want to build..."
              rows={4}
              required
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
            <Button type="submit" size="xl" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send Transmission"}
            </Button>
          </div>
        </form>
      </FadeIn>
    </section>
  );
}
