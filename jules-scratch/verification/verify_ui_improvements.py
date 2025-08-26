from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:9002")

    # Wait for the main content to load
    expect(page.get_by_text("All References")).to_be_visible()

    # Take a screenshot of the main page
    page.screenshot(path="jules-scratch/verification/01_main_page.png")

    # Open the "Add Project" dialog
    page.get_by_label("Add Project").click()
    expect(page.get_by_text("Add New Project")).to_be_visible()

    # Take a screenshot of the dialog
    page.screenshot(path="jules-scratch/verification/02_add_project_dialog.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
