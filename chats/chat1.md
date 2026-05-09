# Perheen ruokaarvonta

_Started 2026-05-09 08:03 UTC_

---

## User

Toteuta prototyyppi mobiilisovellukselle, jolla perheet voivat viikottain arpoa lounaan ja päivällisen ruokalajit. Sovellus sisältää oletuksena 50 kpl eri ruokalajien reseptejä, mutta käyttäjä voi lisätä myös itse reseptejä. Arvonnan suorittamisen jälkeen käyttäjä voi hyväksyä sovelluksen ehdotuksen tai tehdä arvonnan uudelleen kyseiseen ateriaan. Värimaailma on turkoosi ja sille sopivat aksenttivärit. Aksenttivärit saat valita itse. Käyttöliittymän on oltava helppokäyttöinen. Pilleri-buttoneita ei saa käyttää. Buttonissa saa olla pyöristyksiä, mutta ei pilleriksi asti.

## Assistant

_[tool: update_todos]_

Aloitan suunnittelemalla prototyypin: turkoosi pääväri, korallinpunainen ja keltainen aksentteina, lämmin off-white tausta. Buttonit pyöristys 12px (ei pilleriksi). Suomeksi.

Aloitetaan rakentaminen.

_[tool: copy_starter_component]_

_[tool: copy_starter_component]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: write_file]_

Hyvä, nyt kaikki tarvittava on käytössä. Suunnitellaan:
- **Värit**: Turkoosi `#14b8a6` pääväri, korallinpunainen `#FF7A59` arvonnalle, lämmin keltainen `#FFC857` aksentti, lämmin off-white tausta `#FAF7F2`
- **Buttoni-pyöristys**: 14px (selvästi ei pilleri)
- **Rakenne**: 2 välilehteä (Viikko, Reseptit), modaalit detaljeille ja lisäykselle
- **Resepti-ikonit**: värikkäät geometriset placeholder-badget (ei AI-emojislopia)

Aloitetaan reseptidatasta.

_[tool: snip]_

_[tool: write_file]_

Nyt rakennan pääsovelluksen. Pidän app.jsx:n hallittavan kokoisena.

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: snip]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Prototyyppi valmis: turkoosi pääväri korallinpunaisella aksentilla, 50 oletusreseptiä, viikkoarvonta päivä- tai kokoviikkotasolla, hyväksy/arvo-uudestaan-toiminto bottom sheetissä, omien reseptien lisäys, ja Tweaks-paneelissa väri- ja perheasetukset. Buttonit pyöristetty 12–14px (ei pillereitä).

## User

Lisää reseptinäkymään myös valmistusohje. Tee Aineista ja Valmistusohjeesta omat välilehdet näkymään.

## Assistant

_[tool: snip]_

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

_[tool: snip]_

Lisätty: jokaiselle 50 oletusreseptille valmistusohje, ja reseptinäkymässä Aineet/Valmistusohje välilehdet (turkoosi aktiivinen tila). Omiin resepteihin voi nyt lisätä myös vaiheittaisen ohjeen.

