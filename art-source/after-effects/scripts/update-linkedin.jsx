// update-linkedin.jsx (2026-11-23): updates the OPEN promotionalvideo.aep with details from the
// LinkedIn profile (profile/Profile.pdf, profile/linkedin-projects.md). It:
//   1. saves a backup copy: promotionalvideo_v1_44s.aep
//   2. changes the name "MUZNA RIZWAN" to "MUZNA ZUBAIRY" (S1 title line 2, S7 end card)
//   3. imports 4 project images from footage/projects/ into 02_Footage > Projects
//   4. builds S6b_Projects (4.9 s, four image cards) and S6c_Highlights (3.9 s, award + experience)
//   5. makes MAIN 52 s (renamed MAIN_Promo_52s): new scenes at 40.0 and 44.5, end card moved to 48.0
//   6. rewrites the audio markers for the new timing, then saves the project
// It stops without changing anything if the open project isn't promotionalvideo.aep or was already
// updated. Fonts for new text are copied from existing layers so everything matches.
// Log: scripts/update-log.txt. ExtendScript (ES3).
(function () {
  var ROOT = "D:/Users/Muzna/uni/wp/ccp/art-source/after-effects/";
  var LOG = new File(ROOT + "scripts/update-log.txt");
  LOG.open("w");
  function log(s) { LOG.writeln(s); }
  var FPS = 30, W = 1920, H = 1080;

  var C = { ink: "#0F0D16", glass: "#181523", line: "#2F2A40", white: "#F4EFE6", muted: "#A9A2B9", lavender: "#C084FC", gold: "#FFD27A" };
  function hex(h) { h = h.replace("#", ""); return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255]; }

  // ---------- helpers (same as build-promo.jsx) ----------
  function P(layer, name) {
    var map = { anchor: "ADBE Anchor Point", pos: "ADBE Position", scale: "ADBE Scale", rot: "ADBE Rotate Z", opacity: "ADBE Opacity" };
    return layer.property("ADBE Transform Group").property(map[name]);
  }
  function easeDims(p) {
    var t = p.propertyValueType;
    if (t == PropertyValueType.TwoD_SPATIAL || t == PropertyValueType.ThreeD_SPATIAL) return 1;
    if (t == PropertyValueType.TwoD) return 2;
    if (t == PropertyValueType.ThreeD) return 3;
    return 1;
  }
  function keys(p, times, values, influence) {
    var i, k, inf = influence || 70;
    for (i = 0; i < times.length; i++) p.setValueAtTime(times[i], values[i]);
    var d = easeDims(p), e = [];
    for (k = 0; k < d; k++) e.push(new KeyframeEase(0, inf));
    for (k = 1; k <= p.numKeys; k++) { try { p.setTemporalEaseAtKey(k, e, e); } catch (err) {} }
  }
  function pop(layer, t) { keys(P(layer, "scale"), [t, t + 0.2, t + 0.33], [[0, 0, 100], [112, 112, 100], [100, 100, 100]], 60); }
  function fadeIn(layer, t0, t1) { keys(P(layer, "opacity"), [t0, t1], [0, 100]); }
  function rise(layer, t, dy) {
    var pp = P(layer, "pos").value;
    keys(P(layer, "pos"), [t, t + 0.5], [[pp[0], pp[1] + dy], [pp[0], pp[1]]], 85);
    fadeIn(layer, t, t + 0.4);
  }
  function followParentOpacity(layer) { P(layer, "opacity").expression = "parent.transform.opacity * value / 100"; }
  function find(name, type) {
    for (var i = 1; i <= app.project.numItems; i++) {
      var it = app.project.item(i);
      if (it.name == name && (!type || it instanceof type)) return it;
    }
    return null;
  }
  function layerByName(comp, name) { for (var i = 1; i <= comp.numLayers; i++) if (comp.layer(i).name == name) return comp.layer(i); return null; }
  function layerBySource(comp, src) { for (var i = 1; i <= comp.numLayers; i++) if (comp.layer(i).source == src) return comp.layer(i); return null; }
  function fontOf(layer) { return layer.property("ADBE Text Properties").property("ADBE Text Document").value.font; }

  var FONT = {};
  var fScenes, fSolids;
  function newComp(name, dur) {
    var c = app.project.items.addComp(name, W, H, 1, dur, FPS);
    c.bgColor = hex(C.ink);
    c.parentFolder = fScenes;
    return c;
  }
  function solid(comp, name, color) { return comp.layers.addSolid(hex(color), name, W, H, 1, comp.duration); }
  function centerAnchorAt(layer, t) {
    var r = layer.sourceRectAtTime(t, false);
    P(layer, "anchor").setValue([r.left + r.width / 2, r.top + r.height / 2]);
  }
  function setText(layer, str) {
    var sp = layer.property("ADBE Text Properties").property("ADBE Text Document");
    var td = sp.value; td.text = str; sp.setValue(td);
  }
  // o: name, text, role, size, color, just ("left"|"center"), pos, tracking
  function text(comp, o) {
    var l = comp.layers.addText(o.text);
    l.name = o.name;
    var sp = l.property("ADBE Text Properties").property("ADBE Text Document");
    var td = sp.value;
    try { td.resetCharStyle(); td.resetParagraphStyle(); } catch (e) {}
    td.fontSize = o.size;
    td.applyFill = true;
    td.applyStroke = false;
    td.fillColor = hex(o.color);
    td.tracking = o.tracking || 0;
    td.font = FONT[o.role];
    td.justification = (o.just == "left") ? ParagraphJustification.LEFT_JUSTIFY : ParagraphJustification.CENTER_JUSTIFY;
    sp.setValue(td);
    l.comment = "role=" + o.role + ";center=" + (o.just == "left" ? 0 : 1);
    if (o.just != "left") centerAnchorAt(l, 0);
    P(l, "pos").setValue(o.pos);
    return l;
  }
  function textWidth(layer) { return layer.sourceRectAtTime(0, false).width; }
  function shapeLayer(comp, name, pos) {
    var l = comp.layers.addShape(); l.name = name;
    P(l, "anchor").setValue([0, 0]); P(l, "pos").setValue(pos);
    return l;
  }
  function vectors(layer, g) { return layer.property("ADBE Root Vectors Group").property(g).property("ADBE Vectors Group"); }
  function pill(comp, name, pos, size, round, fillColor, fillOpacity, strokeColor) {
    var l = shapeLayer(comp, name, pos);
    var g = l.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group"); g.name = "Pill";
    var r = vectors(l, "Pill").addProperty("ADBE Vector Shape - Rect");
    r.property("ADBE Vector Rect Size").setValue(size);
    r.property("ADBE Vector Rect Roundness").setValue(round);
    if (strokeColor) {
      var s = vectors(l, "Pill").addProperty("ADBE Vector Graphic - Stroke");
      s.property("ADBE Vector Stroke Color").setValue(hex(strokeColor));
      s.property("ADBE Vector Stroke Width").setValue(2);
    }
    var f = vectors(l, "Pill").addProperty("ADBE Vector Graphic - Fill");
    f.property("ADBE Vector Fill Color").setValue(hex(fillColor));
    f.property("ADBE Vector Fill Opacity").setValue(fillOpacity);
    return l;
  }
  function dot(comp, name, pos, size, color) {
    var l = shapeLayer(comp, name, pos);
    var g = l.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group"); g.name = "Dot";
    vectors(l, "Dot").addProperty("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size").setValue([size, size]);
    var f = vectors(l, "Dot").addProperty("ADBE Vector Graphic - Fill");
    f.property("ADBE Vector Fill Color").setValue(hex(color));
    return l;
  }
  function maskRect(layer, x0, y0, x1, y1, name) {
    var m = layer.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
    m.name = name;
    var s = new Shape();
    s.vertices = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    s.closed = true;
    m.property("ADBE Mask Shape").setValue(s);
  }
  function maskEllipse(layer, cx, cy, rx, ry, feather, name) {
    var m = layer.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
    m.name = name;
    var k = 0.5523, s = new Shape();
    s.vertices = [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]];
    s.inTangents = [[-rx * k, 0], [0, -ry * k], [rx * k, 0], [0, ry * k]];
    s.outTangents = [[rx * k, 0], [0, ry * k], [-rx * k, 0], [0, -ry * k]];
    s.closed = true;
    m.property("ADBE Mask Shape").setValue(s);
    m.property("ADBE Mask Feather").setValue([feather, feather]);
  }
  function glowBg(comp) {
    solid(comp, "BG Ink", C.ink);
    var g = solid(comp, "Lavender glow", C.lavender);
    maskEllipse(g, 960, 560, 820, 320, 420, "Glow");
    P(g, "opacity").setValue(12);
  }

  function run() {
    var proj = app.project;
    if (!proj.file || proj.file.name != "promotionalvideo.aep") { log("ABORT: open project is not promotionalvideo.aep"); return; }
    if (find("S6b_Projects")) { log("ABORT: already updated (S6b_Projects exists)"); return; }
    var main = find("MAIN_Promo_44s", CompItem);
    var s1 = find("S1_IslandIntro", CompItem), s6 = find("S6_Skills", CompItem), s7 = find("S7_EndCard", CompItem);
    if (!main || !s1 || !s6 || !s7) { log("ABORT: expected comps not found"); return; }

    // 1. backup of the 44 s version
    var backup = new File(ROOT + "promotionalvideo_v1_44s.aep");
    if (!backup.exists) { proj.file.copy(backup.fsName); log("backup: " + backup.fsName); }

    // fonts used by the existing layers
    FONT.DISPLAY = fontOf(layerByName(s7, "DISPLAY Muzna Rizwan"));
    FONT.BODY = fontOf(layerByName(s6, "BODY Unity"));
    FONT.MONO = fontOf(layerByName(s6, "MONO Skills tag"));
    log("fonts: " + FONT.DISPLAY + " / " + FONT.BODY + " / " + FONT.MONO);

    app.beginUndoGroup("LinkedIn update");

    // 2. name
    var n1 = layerByName(s1, "MONO Title line 2");
    setText(n1, "BY MUZNA ZUBAIRY"); centerAnchorAt(n1, 3.0);
    var n7 = layerByName(s7, "DISPLAY Muzna Rizwan");
    setText(n7, "MUZNA ZUBAIRY"); n7.name = "DISPLAY Muzna Zubairy"; centerAnchorAt(n7, 3.0);
    log("name changed");

    // 3. project images
    fScenes = find("Scenes", FolderItem);
    fSolids = find("04_Solids", FolderItem);
    var fFootage = find("02_Footage", FolderItem);
    var fProj = proj.items.addFolder("Projects"); fProj.parentFolder = fFootage;

    // 4a. S6b_Projects: four cards. [file, title, tag, focus x, focus y, scale] -- focus/scale pick the
    // part of each screenshot shown in the 384x216 card window (keeps the Windows watermarks out).
    var s6b = newComp("S6b_Projects", 4.9);
    glowBg(s6b);
    var hdr = text(s6b, { name: "MONO Projects tag", text: "SELECTED PROJECTS", role: "MONO", size: 24, color: C.gold, tracking: 400, pos: [960, 330] });
    fadeIn(hdr, 0.15, 0.55);
    var CARDS = [
      ["monsterrunner.jpeg", "Monster Runner", "UNITY \u00B7 C# \u00B7 GAMECON \u201926", 360, 203, 0.534],
      ["blockcraft.jpeg", "BlockCraft", "THREE.JS \u00B7 REACT \u00B7 SUPABASE", 400, 180, 0.6],
      ["masketeer.jpeg", "Masketeer", "UNITY \u00B7 2D PIXEL ART", 360, 200, 0.54],
      ["solarsystem.jpeg", "Solar System", "THREE.JS \u00B7 3D SIMULATION", 480, 270, 0.4]
    ];
    var CW = 416, CH = 372, GAP = 32, IMW = 384, IMH = 216, CY = 590;
    var x0 = 960 - (4 * CW + 3 * GAP) / 2 + CW / 2;
    for (var i = 0; i < CARDS.length; i++) {
      var cd = CARDS[i], cx = x0 + i * (CW + GAP), ts = 0.35 + i * 0.18;
      var f = new File(ROOT + "footage/projects/" + cd[0]);
      if (!f.exists) throw new Error("Missing image: " + f.fsName);
      var item = proj.importFile(new ImportOptions(f)); item.parentFolder = fProj;
      var panel = pill(s6b, "Card " + cd[1], [cx, CY], [CW, CH], 22, C.glass, 90, C.line);
      var img = s6b.layers.add(item);
      img.name = "Image " + cd[1];
      var s = cd[5], hw = IMW / 2 / s, hh = IMH / 2 / s;
      P(img, "anchor").setValue([cd[3], cd[4]]);
      P(img, "pos").setValue([cx, CY - CH / 2 + 16 + IMH / 2]);
      P(img, "scale").setValue([s * 100, s * 100]);
      maskRect(img, cd[3] - hw, cd[4] - hh, cd[3] + hw, cd[4] + hh, "Card window");
      var tl = text(s6b, { name: "DISPLAY " + cd[1], text: cd[1], role: "DISPLAY", size: 34, color: C.white, just: "left", pos: [cx - IMW / 2, 688] });
      var tg = text(s6b, { name: "MONO " + cd[1] + " tag", text: cd[2], role: "MONO", size: 16, color: C.muted, tracking: 200, just: "left", pos: [cx - IMW / 2, 730] });
      var kids = [img, tl, tg];
      for (var k = 0; k < kids.length; k++) { kids[k].moveBefore(panel); kids[k].parent = panel; followParentOpacity(kids[k]); }
      rise(panel, ts, 50);
    }
    log("S6b done");

    // 4b. S6c_Highlights: award + experience
    var s6c = newComp("S6c_Highlights", 3.9);
    glowBg(s6c);
    var hl = text(s6c, { name: "MONO Highlights tag", text: "HIGHLIGHTS", role: "MONO", size: 24, color: C.gold, tracking: 400, pos: [960, 330] });
    fadeIn(hl, 0.15, 0.55);
    var aw = text(s6c, { name: "DISPLAY Award", text: "Top 3 Finalist \u2014 Best Vertical Film", role: "DISPLAY", size: 66, color: C.white, pos: [960, 440] });
    rise(aw, 0.3, 26);
    var aws = text(s6c, { name: "BODY Award event", text: "Micro Drama Lab", role: "BODY", size: 34, color: C.lavender, pos: [960, 505] });
    rise(aws, 0.5, 26);
    var et = text(s6c, { name: "MONO Experience tag", text: "EXPERIENCE", role: "MONO", size: 20, color: C.muted, tracking: 400, pos: [960, 628] });
    fadeIn(et, 0.8, 1.2);
    var EXP = [["MadForFilms", "TRAINEE \u00B7 2026", "#A83A4B"], ["Stratesfy", "INTERN \u00B7 2024", "#5FA39A"], ["MLabs", "PARTICIPANT \u00B7 2024", "#E9A93B"]];
    var parts = [], widths = [], total = 0, PG = 24, PY = 715;
    for (var e = 0; e < EXP.length; e++) {
      var en = text(s6c, { name: "BODY " + EXP[e][0], text: EXP[e][0], role: "BODY", size: 32, color: C.white, just: "left", pos: [0, PY + 11] });
      var er = text(s6c, { name: "MONO " + EXP[e][0] + " role", text: EXP[e][1], role: "MONO", size: 17, color: C.muted, tracking: 160, just: "left", pos: [0, PY + 6] });
      var w = 62 + textWidth(en) + 18 + textWidth(er) + 34;
      parts.push([en, er]); widths.push(w); total += w;
    }
    total += PG * (EXP.length - 1);
    var x = 960 - total / 2;
    for (e = 0; e < EXP.length; e++) {
      var pcx = x + widths[e] / 2;
      var ep = pill(s6c, "Pill " + EXP[e][0], [pcx, PY], [widths[e], 76], 38, C.glass, 90, C.line);
      var ed = dot(s6c, "Dot " + EXP[e][0], [x + 36, PY], 16, EXP[e][2]);
      P(parts[e][0], "pos").setValue([x + 62, PY + 11]);
      P(parts[e][1], "pos").setValue([x + 62 + textWidth(parts[e][0]) + 18, PY + 6]);
      var ek = [parts[e][0], parts[e][1], ed];
      for (k = 0; k < ek.length; k++) { ek[k].moveBefore(ep); ek[k].parent = ep; followParentOpacity(ek[k]); }
      rise(ep, 1.0 + e * 0.16, 50);
      x += widths[e] + PG;
    }
    log("S6c done");

    // 5. MAIN: 52 s, new scenes after Skills, end card at 48 s
    main.name = "MAIN_Promo_52s";
    main.duration = 52;
    main.workAreaStart = 0;
    main.workAreaDuration = 52;
    var l7 = layerBySource(main, s7);
    var op7 = P(l7, "opacity");
    while (op7.numKeys > 0) op7.removeKey(1);
    l7.startTime = 48.0; l7.inPoint = 48.0; l7.outPoint = 52.0;
    fadeIn(l7, 48.0, 48.33);
    var lb = main.layers.add(s6b);
    lb.startTime = 40.0; lb.outPoint = 44.9; lb.moveAfter(l7);
    fadeIn(lb, 40.0, 40.33);
    var lc = main.layers.add(s6c);
    lc.startTime = 44.5; lc.outPoint = 48.4; lc.moveAfter(l7);
    fadeIn(lc, 44.5, 44.83);
    log("MAIN retimed: S6b 40-44.9, S6c 44.5-48.4, S7 48-52");

    // markers
    var mk = main.markerProperty;
    while (mk.numKeys > 0) mk.removeKey(1);
    var MK = [[0.0, "MUSIC start (fade out 50.5-52)"], [0.001, "SFX ink_draw"], [3.0, "SFX whoosh"], [7.0, "SFX footsteps"],
      [8.0, "SFX pop (W A S D)"], [13.5, "SFX swish"], [16.0, "SFX swish"], [18.5, "SFX swish"], [21.0, "SFX swish"],
      [23.5, "SFX swish"], [26.0, "SFX swish + coast"], [28.5, "SFX swish"], [32.7, "SFX click (E)"],
      [40.0, "SFX swish (projects)"], [40.35, "SFX pop (cards)"], [44.5, "SFX swish (highlights)"], [48.0, "SFX coast (end card)"]];
    for (var m = 0; m < MK.length; m++) mk.setValueAtTime(MK[m][0], new MarkerValue(MK[m][1]));

    // tidy new solids into 04_Solids
    for (var it = proj.numItems; it >= 1; it--) {
      var pi = proj.item(it);
      if (pi instanceof FootageItem && pi.mainSource instanceof SolidSource && pi.parentFolder != fSolids) pi.parentFolder = fSolids;
    }
    app.endUndoGroup();
    proj.save();
    log("saved " + proj.file.fsName);
  }

  try { run(); } catch (e) { log("ERROR line " + e.line + ": " + e.toString()); try { app.endUndoGroup(); } catch (e2) {} }
  log("DONE");
  LOG.close();
})();
