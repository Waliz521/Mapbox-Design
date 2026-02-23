# Deliverable assets (SOW Objectives 5 & 6)

Map markers and other export-ready assets for the Forterra Mapbox project.

## Included

| File | Use on map |
|------|------------|
| `pls.png` | Port, Main Operating Base markers |
| `jltv_rogue_fires.png` | Direct/Indirect Fires, Combat Outpost markers |

Both are transparent-background PNGs, ready for use in the app or other deliverables.

---

## How to create SVGs from these PNGs

You need vector (SVG) versions for scalability and “export-ready SVG” (SOW point 6). Options:

### 1. Adobe Illustrator (recommended if you have it)

1. **Open** the PNG in Illustrator (File → Open).
2. **Image Trace:** Select the image → **Object → Image Trace → Make** (or Window → Image Trace).  
   - Preset: try **Silhouette** or **6 Colors** (then reduce to 2–3 so you get a clean shape).  
   - Adjust **Threshold** so the truck is one solid shape; check **Ignore White** if the background is white.
3. **Expand:** With the traced object selected → **Object → Expand** (then Expand in the dialog).
4. **Clean up:** Ungroup if needed, delete stray paths, simplify with **Object → Path → Simplify** if the path is too heavy.
5. **Save as SVG:** **File → Save As** → choose **SVG**. In options, use “Presentation Attributes” or “CSS” for styling; keep “Responsive” if you want it to scale.

### 2. Free / online

- **Photopea** (photopea.com): Open PNG → **Image → Vectorize** (or use the Pen tool to trace), then **File → Export as → SVG**.
- **Vectorizer.io** or **vectorizer.io**: Upload PNG, download SVG. Good for simple silhouettes.
- **Inkscape** (free desktop): Open PNG → **Path → Trace Bitmap** (similar to Illustrator Image Trace) → **File → Save As → SVG**.

### 3. Node script (PNG → SVG trace)

If you want to do it from code, you can use a bitmap-tracing library and save SVG:

- **potrace** (with a Node wrapper like `potrace` or `imagetracer`): turns a PNG into black/white and outputs SVG paths.  
  Example (after `npm install potrace`):

  ```bash
  npx potrace pls.png -o pls.svg -s
  ```

  (`-s` = SVG output). Quality depends on the PNG; you may need to preprocess (e.g. increase contrast, remove noise) for best results.

---

## Using SVGs in the map

Once you have `pls.svg` and `jltv_rogue_fires.svg`:

- You can **replace the PNG** in the app by pointing the marker `icon` to the SVG file (e.g. `icon: 'deliverable-assets/pls.svg'`). Browsers support SVG in `<img>` and `background-image`.
- Or keep PNGs in the app and **deliver both** PNG + SVG in this folder so the client has export-ready PNG and SVG as per the SOW.
