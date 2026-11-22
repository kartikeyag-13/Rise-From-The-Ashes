# Theme assets

The four worlds use their background photo as a cover-fit backdrop behind procedural art. Images are loaded from `assets/manifest.json` on startup.

```
assets/themes/greece/    Greek Mythology
assets/themes/egypt/     Ancient Egypt
assets/themes/magical/   Magical Seas
assets/themes/space/     Deep Space
```

## Choose a background

Edit `assets/manifest.json` to point each world at any `.png`, `.jpg` or `.jpeg` file in its folder:

```json
{
  "greece": { "background": "my-sunset.jpg" },
  "egypt": { "background": "dunes.jpeg" },
  "magical": { "background": "nebula.png" },
  "space": { "background": "stars.jpg" }
}
```

Paths are relative to `assets/themes/<world>/`. Add other keys (`ground`, `drone`, `cargo`, `obstacle`, `pickup`, `drop`) if you later want to swap those too.

## Notes

- Portrait photos are heavily cropped by the cover-fit; landscape images around 1600 × 1000 or larger look best.
- The `modern` folder is kept for reference from the earlier build; Deep Space currently uses a copy of one of those images until you add a real space backdrop.
- Opening `index.html` directly (`file://`) bypasses `fetch`, so the built-in filename defaults in `js/game.js` are used instead of the manifest. Rename your files to those defaults, or serve the folder locally to use custom manifest names.
- After changing an image or the manifest, refresh the browser (hard-refresh if serving locally).
