#!/usr/bin/env python3
"""Playwright E2E, ARIA keyboard, responsive touch-target & CSS sync suite for Forma UI."""
import re
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

HERE = Path(__file__).resolve().parents[1]
PROTO = HERE / "prototype.html"


def sync_inline_css(check_only: bool = False):
    combined = "\n\n".join(
        (HERE / name).read_text(encoding="utf-8").rstrip()
        for name in ("tokens.css", "components.css", "motion.css")
    )
    html = PROTO.read_text(encoding="utf-8")
    assert 'style="' not in html, "Inline style attributes are forbidden in prototype.html"
    assert "·" not in html, "Middle-dot meta strings are forbidden in prototype.html"
    start, end = "/* FORMA:INLINE:START */", "/* FORMA:INLINE:END */"
    pattern = re.escape(start) + r"[\s\S]*?" + re.escape(end)
    updated, count = re.subn(pattern, lambda _: f"{start}\n{combined}\n{end}", html)
    assert count == 1, "Missing FORMA:INLINE markers in prototype.html"
    if check_only:
        assert html == updated, "prototype.html inline CSS is out of sync with tokens/components/motion.css"
    elif html != updated:
        PROTO.write_text(updated, encoding="utf-8")


def _launch(pw):
    try:
        return pw.chromium.launch(args=["--no-sandbox", "--disable-dev-shm-usage"])
    except Exception:
        exe = shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chromium-browser")
        return pw.chromium.launch(executable_path=exe, args=["--no-sandbox", "--disable-dev-shm-usage"])


def main():
    sync_inline_css(check_only=False)
    sync_inline_css(check_only=True)

    with sync_playwright() as pw:
        browser = _launch(pw)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.goto(PROTO.as_uri())

        # Surface 1: Portal + WAI-ARIA tablist keyboard navigation (ArrowRight / Home)
        expect(page.get_by_role("heading", name="Maison des ressources publiques.")).to_be_visible()
        tab_portal = page.locator("#tab-portal")
        tab_portal.focus()
        page.keyboard.press("ArrowRight")
        expect(page.locator("#tab-index")).to_have_attribute("aria-selected", "true")
        expect(page.locator("#panel-index")).to_be_visible()

        # Verify filter rail top alignment matches right catalogue section (no vertical stretch gap)
        delta_y = page.evaluate("""() => {
            const rail = document.querySelector('.forma-rail-panel h2').getBoundingClientRect().top;
            const cat = document.querySelector('#catalogue-heading').getBoundingClientRect().top;
            return Math.abs(rail - cat);
        }""")
        assert delta_y < 32, f"Filter rail misaligned vertically vs catalogue heading: {delta_y}px"

        page.keyboard.press("Home")
        expect(tab_portal).to_have_attribute("aria-selected", "true")

        # Direct directory jump
        page.get_by_role("button", name="Voir les guides").click()
        expect(page.locator("#index-status")).to_contain_text("2 ressources affichées")
        page.get_by_role("button", name="Réinitialiser les critères").click()
        expect(page.locator("#index-status")).to_contain_text("8 ressources affichées")

        # Accent-insensitive search + empty state + recovery
        page.get_by_label("Recherche par mot-clé ou cote").fill("reglement")
        expect(page.locator("#index-status")).to_contain_text("2 ressources affichées")
        page.get_by_label("Recherche par mot-clé ou cote").fill("introuvable-xyz")
        expect(page.locator("#state-empty")).to_be_visible()
        page.get_by_role("button", name="Afficher les 8 ressources").click()
        expect(page.locator("#index-status")).to_contain_text("8 ressources affichées")

        # Error state -> Retry recovery
        page.get_by_role("button", name="Erreur réseau").click()
        expect(page.locator("#state-error")).to_be_visible()
        page.get_by_role("button", name="Réessayer le chargement").click()
        expect(page.locator("#index-list")).to_be_visible()

        # Details expand + disabled button check + modal reader + Escape focus return
        first_row = page.locator(".forma-index-row").first
        first_row.locator("summary").click()
        expect(page.get_by_role("button", name="Archive PDF scellée (hors démo)")).to_be_disabled()
        page.get_by_role("button", name="Ouvrir la notice complète").first.click()
        expect(page.locator("#doc-dialog")).to_be_visible()
        page.keyboard.press("Escape")
        expect(page.locator("#doc-dialog")).not_to_be_visible()

        # Surface 3: Civic procedure + accessible form validation + success receipt
        page.get_by_role("tab", name="Règlement et démarche").click()
        page.get_by_role("button", name="Générer le récépissé de pré-demande").click()
        expect(page.locator("#err-name")).to_be_visible()
        expect(page.locator("#err-email")).to_be_visible()

        page.get_by_label("Nom et prénom du demandeur").fill("Claire Rochat")
        page.get_by_label("Adresse électronique de confirmation").fill("claire.rochat@institution-exemple.ch")
        page.get_by_role("button", name="Générer le récépissé de pré-demande").click()
        expect(page.locator("#dossier-receipt")).to_be_visible()
        expect(page.locator("#receipt-body")).to_contain_text("DEM-LEC-4190")

        # Dark mode & Mobile touch-target >= 44px verification
        page.get_by_role("button", name="Mode nuit").click()
        expect(page.locator("html")).to_have_attribute("data-theme", "dark")
        page.set_viewport_size({"width": 375, "height": 812})
        overflow = page.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")
        assert overflow <= 0, f"Horizontal overflow on mobile: {overflow}px"
        small_targets = page.evaluate("""() => {
            const bad = [];
            for (const el of document.querySelectorAll('button, select, input[type="text"], input[type="email"], .forma-toc a')) {
                const cs = getComputedStyle(el);
                if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('[hidden]')) continue;
                const r = el.getBoundingClientRect();
                if (r.height > 0 && r.height < 43.5) bad.push({text: (el.innerText || el.id).slice(0,30), h: r.height});
            }
            return bad;
        }""")
        assert not small_targets, f"Mobile touch targets < 44px: {small_targets}"
        assert not errors, errors
        browser.close()
        print("Forma UI E2E, ARIA keyboard & mobile touch-target suite passed")


if __name__ == "__main__":
    main()
