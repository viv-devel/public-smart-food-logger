from playwright.sync_api import sync_playwright, expect

def verify_page(page):
    page.goto("http://localhost:3000")

    # Wait for the specific heading to be visible (using nth=1 or more specific locator)
    # The header has a link with "Smart Food Logger AI" (h1 inside)
    # The main content has an h1 with "Smart Food Logger AI"
    # Let's target the main one
    expect(page.locator("h1.text-4xl")).to_be_visible()

    # Check if "How It Works" carousel is visible immediately (it was moved up)
    # The heading "How It Works" is inside the carousel component
    expect(page.get_by_role("heading", name="How It Works")).to_be_visible()

    # Wait for "How It Works"
    page.locator("text=How It Works").scroll_into_view_if_needed()

    # Wait a bit for the delayed auth section to render
    page.wait_for_timeout(2000)

    page.screenshot(path="verification/landing_page.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_page(page)
        finally:
            browser.close()
