import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Footer } from "@/components/Footer";

describe("Footer Component", () => {
  it("renders terms and privacy links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /利用規約/i })).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(
      screen.getByRole("link", { name: /プライバシーポリシー/i }),
    ).toHaveAttribute("href", "/privacy");
  });

  it("renders tech stack icons with correct links", () => {
    render(<Footer />);

    const githubLink = screen.getByLabelText("GitHub Repository");
    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/viv-devel/public-smart-food-logger",
    );
    expect(githubLink).toHaveAttribute("target", "_blank");

    const netlifyLink = screen.getByLabelText("Powered by Netlify");
    expect(netlifyLink).toHaveAttribute("href", "https://www.netlify.com");
    expect(netlifyLink).toHaveAttribute("target", "_blank");

    const geminiLink = screen.getByLabelText("Built with Gemini");
    expect(geminiLink).toHaveAttribute("href", "https://gemini.google.com");
    expect(geminiLink).toHaveAttribute("target", "_blank");

    const fitbitLink = screen.getByLabelText("Works with Fitbit");
    expect(fitbitLink).toHaveAttribute("href", "https://www.fitbit.com");
    expect(fitbitLink).toHaveAttribute("target", "_blank");
  });

  it("renders copyright text", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(
        new RegExp(`© ${year} vivviv. All rights reserved.`, "i"),
      ),
    ).toBeInTheDocument();
  });
});
