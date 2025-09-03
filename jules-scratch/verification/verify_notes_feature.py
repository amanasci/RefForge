from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Navigate to the application.
        page.goto("http://localhost:9002")

        # Wait for the page to load
        expect(page.get_by_role("heading", name="All References")).to_be_visible()

        # 2. Add a new reference with notes.
        add_reference_button = page.get_by_label("Add Reference")
        expect(add_reference_button).to_be_visible()
        add_reference_button.click()

        # Fill out the form
        page.get_by_label("Title").fill("Test Reference with Notes")
        page.get_by_label("Authors").fill("Jules Verne")
        page.get_by_label("Year").fill("2024")
        page.get_by_label("Abstract").fill("This is a test abstract.")
        page.get_by_label("Notes").fill("These are some personal notes about the reference.")

        # Select a project
        page.get_by_role("combobox", name="Project").click()
        try:
            page.get_by_text("Default Project").click()
        except:
            page.get_by_role("combobox", name="Project").click() # Close the dropdown
            page.get_by_role("button", name="Add Project").click()
            page.get_by_label("Project Name").fill("Default Project")
            page.get_by_role("button", name="Save").click()
            page.get_by_role("combobox", name="Project").click()
            page.get_by_text("Default Project").click()

        page.get_by_role("button", name="Add Reference").click()

        # 3. Verify that the notes are displayed on the reference card.
        expect(page.get_by_text("These are some personal notes about the reference.")).to_be_visible()

        # 4. Take a screenshot.
        page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run_verification()
