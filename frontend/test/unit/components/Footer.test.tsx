import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Footer } from "@/components/Footer";

describe("Footer Component", () => {
  it("renders terms and privacy links", () => {
    render(<Footer />);
    const termsLink = screen.getByRole("link", { name: /利用規約/i });
    expect(termsLink).toBeDefined();
    expect(termsLink.getAttribute("href")).toBe("/terms");

    const privacyLink = screen.getByRole("link", {
      name: /プライバシーポリシー/i,
    });
    expect(privacyLink).toBeDefined();
    expect(privacyLink.getAttribute("href")).toBe("/privacy");
  });

  it("renders tech stack icons with correct links", () => {
    render(<Footer />);

    const githubLink = screen.getByLabelText("GitHub Repository");
    expect(githubLink).toBeDefined();
    expect(githubLink.getAttribute("href")).toBe(
      "https://github.com/viv-devel/public-smart-food-logger",
    );
    expect(githubLink.getAttribute("target")).toBe("_blank");

    const netlifyLink = screen.getByLabelText("Powered by Netlify");
    expect(netlifyLink).toBeDefined();
    expect(netlifyLink.getAttribute("href")).toBe("https://www.netlify.com");
    expect(netlifyLink.getAttribute("target")).toBe("_blank");

    const geminiLink = screen.getByLabelText("Built with Gemini");
    expect(geminiLink).toBeDefined();
    expect(geminiLink.getAttribute("href")).toBe("https://gemini.google.com");
    expect(geminiLink.getAttribute("target")).toBe("_blank");

    const fitbitLink = screen.getByLabelText("Works with Fitbit");
    expect(fitbitLink).toBeDefined();
    expect(fitbitLink.getAttribute("href")).toBe("https://www.fitbit.com");
    expect(fitbitLink.getAttribute("target")).toBe("_blank");
  });

  it("renders copyright text", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    const copyright = screen.getByText(
      new RegExp(`© ${year} vivviv. All rights reserved.`, "i"),
    );
    expect(copyright).toBeDefined();
  });
});
