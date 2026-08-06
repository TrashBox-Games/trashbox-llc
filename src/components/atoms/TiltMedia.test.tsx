import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TiltMedia } from "./TiltMedia";

vi.mock("@gsap/react", () => ({
  useGSAP: () => {},
}));

vi.mock("@/lib/gsap-client", () => ({
  gsap: {
    to: vi.fn(),
    set: vi.fn(),
  },
}));

describe("TiltMedia", () => {
  it("renders children inside a perspective frame", () => {
    render(
      <TiltMedia>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/service-websites.png" alt="Demo" />
      </TiltMedia>,
    );

    expect(screen.getByRole("img", { name: /demo/i })).toBeInTheDocument();
    expect(screen.getByTestId("tilt-media")).toBeInTheDocument();
  });

  it("tracks pointer movement for tilt updates", async () => {
    const { gsap } = await import("@/lib/gsap-client");

    render(
      <TiltMedia>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/service-websites.png" alt="Demo" />
      </TiltMedia>,
    );

    const frame = screen.getByTestId("tilt-media");
    vi.spyOn(frame, "getBoundingClientRect").mockReturnValue({
      width: 400,
      height: 240,
      top: 0,
      left: 0,
      bottom: 240,
      right: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    frame.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        clientX: 320,
        clientY: 60,
      }),
    );

    expect(gsap.to).toHaveBeenCalled();
  });
});
