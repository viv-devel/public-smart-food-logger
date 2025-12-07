import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RedirectModal from "@/components/RedirectModal";
import React from "react";

describe("RedirectModal", () => {
  it("does not render when isOpen is false", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const setRemember = vi.fn();
    render(
      <RedirectModal
        isOpen={false}
        onClose={onClose}
        onConfirm={onConfirm}
        remember={false}
        setRemember={setRemember}
        showSuccessMessage={false}
      />,
    );

    expect(screen.queryByText("食事の記録を登録する")).toBeNull();
  });

  it("renders correctly when isOpen is true", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const setRemember = vi.fn();
    render(
      <RedirectModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        remember={false}
        setRemember={setRemember}
        showSuccessMessage={false}
      />,
    );

    expect(screen.getByText("食事の記録を登録する")).toBeDefined();
    expect(screen.getByText("次回以降もこの設定を記憶する")).toBeDefined();
    expect(screen.getByText("閉じる")).toBeDefined();
    // Verify A11Y attributes
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
  });

  it("renders success message when showSuccessMessage is true", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const setRemember = vi.fn();
    render(
      <RedirectModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        remember={false}
        setRemember={setRemember}
        showSuccessMessage={true}
      />,
    );

    expect(screen.getByText("登録ありがとうございます")).toBeDefined();
    expect(screen.getByText("✅ Fitbitの認証が確認できました！")).toBeDefined();
  });

  it("calls onConfirm when button is clicked", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const setRemember = vi.fn();
    render(
      <RedirectModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        remember={false}
        setRemember={setRemember}
        showSuccessMessage={false}
      />,
    );

    fireEvent.click(screen.getByText("食事の記録を登録する"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("calls setRemember when checkbox is clicked", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const setRemember = vi.fn();
    render(
      <RedirectModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        remember={false}
        setRemember={setRemember}
        showSuccessMessage={false}
      />,
    );

    const checkbox = screen.getByLabelText("次回以降もこの設定を記憶する");
    fireEvent.click(checkbox);

    expect(setRemember).toHaveBeenCalledWith(true);
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const setRemember = vi.fn();
    render(
      <RedirectModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        remember={false}
        setRemember={setRemember}
        showSuccessMessage={false}
      />,
    );

    fireEvent.click(screen.getByText("閉じる"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const setRemember = vi.fn();
    render(
      <RedirectModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        remember={false}
        setRemember={setRemember}
        showSuccessMessage={false}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
