# andrefuoco.github.io

Sito ufficiale di **ANDREFUOCO** — cantautorato nerd rock contro i poteri forti.

Sito statico (HTML/CSS/JS vanilla, nessun framework) pubblicato con GitHub Pages.

## Struttura

```
index.html                            # unica pagina del sito
css/styles.css                        # tema dark "fire"
js/scripts.js                         # nav, lightbox, rendering delle uscite Spotify
data/releases.json                    # discografia, rigenerata automaticamente
scripts/update_releases.py            # script che interroga l'API di Spotify
.github/workflows/update-releases.yml # GitHub Action schedulata (ogni giorno, 05:30 UTC)
assets/img/                           # foto, logo, favicon
```

## Aggiornamento automatico delle uscite Spotify

La sezione **Musica** si aggiorna da sola:

1. Ogni giorno alle 05:30 UTC la GitHub Action esegue `scripts/update_releases.py`.
2. Lo script interroga l'API di Spotify (discografia dell'artista `1fBENlGR3erYzoPzqxH00x`) e riscrive `data/releases.json` **solo se ci sono novità**.
3. Se il file cambia, la Action committa e GitHub Pages ripubblica il sito.
4. La pagina mostra l'uscita più recente come player principale e le altre come griglia. Se il JSON non è raggiungibile, resta l'embed dell'artista Spotify come fallback (sempre aggiornato anche lui).

### Configurazione (da fare una volta sola)

1. Crea un'app su <https://developer.spotify.com/dashboard> (bastano nome e descrizione qualsiasi; redirect URI non serve per questo flusso).
2. Copia **Client ID** e **Client Secret**.
3. Nel repository GitHub: **Settings → Secrets and variables → Actions → New repository secret** e crea:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
4. (Facoltativo) Lancia subito la Action da **Actions → Update Spotify releases → Run workflow** per verificare che funzioni.

### Esecuzione locale

```bash
SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... python scripts/update_releases.py
```

## Sviluppo locale

Serve solo un web server statico (il fetch di `data/releases.json` non funziona aprendo il file direttamente):

```bash
python -m http.server 8000
# poi apri http://localhost:8000
```
