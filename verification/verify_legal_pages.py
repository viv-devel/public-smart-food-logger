from playwright.sync_api import sync_playwright

def verify_legal_pages():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # 1. Terms Page
            print("Navigating to Terms page...")
            page.goto("http://localhost:3000/terms")
            # Wait for content to load
            page.wait_for_selector("h2", state="visible")
            page.screenshot(path="verification/terms_page.png", full_page=True)
            print("Terms page screenshot saved.")

            # 2. Privacy Page
            print("Navigating to Privacy page...")
            page.goto("http://localhost:3000/privacy")
            page.wait_for_selector("h2", state="visible")
            page.screenshot(path="verification/privacy_page.png", full_page=True)
            print("Privacy page screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_legal_pages()
