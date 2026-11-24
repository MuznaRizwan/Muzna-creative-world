// build-promo.jsx: builds the "Muzna's Creative World" promo (44 s, 1920x1080, 30 fps)
// in the CURRENTLY OPEN, EMPTY After Effects 2021 project, then saves it as
// art-source/after-effects/promotionalvideo.aep.
//
// Everything it makes stays editable: live text layers, shape layers, keyframes with easing.
// It stops without changing anything if the open project already has items.
// Progress and errors go to scripts/build-log.txt (no pop-up dialogs).
// ExtendScript (ES3): no let/const, arrow functions, forEach or JSON.

var ROOT = "D:/Users/Muzna/uni/wp/ccp/art-source/after-effects/";
var STILLS = ROOT + "footage/stills/";
var LOG = new File(ROOT + "scripts/build-log.txt");
var FPS = 30, W = 1920, H = 1080;

function log(s) { LOG.open("a"); LOG.writeln(s); LOG.close(); }

// ---------- palette (visual_direction.pdf) ----------
var C = {
  ink: "#0F0D16", glass: "#181523", line: "#2F2A40", white: "#F4EFE6", muted: "#A9A2B9",
  lavender: "#C084FC", gold: "#FFD27A", sand: "#E6CFA6", meadow: "#A3B26B"
};
function hex(h) {
  h = h.replace("#", "");
  return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255];
}

// ---------- fonts: preferred first, Windows fallback second ----------
// apply-fonts.jsx switches every text layer to the preferred font once it is installed.
var FONTS = {
  DISPLAY: ["BricolageGrotesque-Bold", "SegoeUI-Bold"],
  BODY: ["Manrope-SemiBold", "SegoeUI-Semibold"],
  MONO: ["JetBrainsMono-Medium", "Consolas"]
};

// ---------- small helpers ----------
function T(layer) { return layer.property("ADBE Transform Group"); }
function P(layer, name) {
  var map = { anchor: "ADBE Anchor Point", pos: "ADBE Position", scale: "ADBE Scale", rot: "ADBE Rotate Z", opacity: "ADBE Opacity" };
  return T(layer).property(map[name]);
}
function easeDims(p) {
  var t = p.propertyValueType;
  if (t == PropertyValueType.TwoD_SPATIAL || t == PropertyValueType.ThreeD_SPATIAL) return 1;
  if (t == PropertyValueType.TwoD) return 2;
  if (t == PropertyValueType.ThreeD) return 3;
  return 1;
}
// Set keyframes and give them all an easy ease (speed 0, influence %).
function keys(p, times, values, influence) {
  var i, k, inf = influence || 70;
  for (i = 0; i < times.length; i++) p.setValueAtTime(times[i], values[i]);
  var d = easeDims(p), e = [];
  for (k = 0; k < d; k++) e.push(new KeyframeEase(0, inf));
  for (k = 1; k <= p.numKeys; k++) { try { p.setTemporalEaseAtKey(k, e, e); } catch (err) {} }
}
// Pop in: scale 0 -> 112 -> 100.
function pop(layer, t) {
  keys(P(layer, "scale"), [t, t + 0.2, t + 0.33], [[0, 0, 100], [112, 112, 100], [100, 100, 100]], 60);
}
function fadeIn(layer, t0, t1) { keys(P(layer, "opacity"), [t0, t1], [0, 100]); }
function fadeOut(layer, t0, t1) { keys(P(layer, "opacity"), [t0, t1], [100, 0]); }
function span(layer, start, end) { layer.startTime = 0; layer.inPoint = start; layer.outPoint = end; }
// Children follow their parent's opacity (parenting alone doesn't pass opacity on).
function followParentOpacity(layer) {
  P(layer, "opacity").expression = "parent.transform.opacity * value / 100";
}

function newComp(name, dur, folder) {
  var c = app.project.items.addComp(name, W, H, 1, dur, FPS);
  c.bgColor = hex(C.ink);
  c.parentFolder = folder;
  return c;
}
function solid(comp, name, color, dur) {
  var l = comp.layers.addSolid(hex(color), name, W, H, 1, dur || comp.duration);
  return l;
}

// ---------- text ----------
function setFont(layer, role) {
  var sp = layer.property("ADBE Text Properties").property("ADBE Text Document");
  var names = FONTS[role], i;
  for (i = 0; i < names.length; i++) {
    var td = sp.value;
    td.font = names[i];
    try { sp.setValue(td); } catch (e) {}
    if (sp.value.font == names[i]) return names[i];
  }
  return sp.value.font;
}
function centerAnchor(layer) {
  var r = layer.sourceRectAtTime(layer.inPoint, false);
  P(layer, "anchor").setValue([r.left + r.width / 2, r.top + r.height / 2]);
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
  td.justification = (o.just == "left") ? ParagraphJustification.LEFT_JUSTIFY : ParagraphJustification.CENTER_JUSTIFY;
  sp.setValue(td);
  var used = setFont(l, o.role);
  l.comment = "role=" + o.role + ";center=" + (o.just == "left" ? 0 : 1);
  if (o.just != "left") centerAnchor(l);
  P(l, "pos").setValue(o.pos);
  return l;
}
function textWidth(layer) { return layer.sourceRectAtTime(layer.inPoint, false).width; }
// Tracking animator: letters drift together from `from` to 0.
function trackIn(layer, t0, t1, from) {
  var anim = layer.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator");
  anim.name = "Tracking in";
  var tr = anim.property("ADBE Text Animator Properties").addProperty("ADBE Text Tracking Amount");
  keys(tr, [t0, t1], [from, 0], 80);
}

// ---------- shapes ----------
function shapeLayer(comp, name, pos) {
  var l = comp.layers.addShape();
  l.name = name;
  P(l, "anchor").setValue([0, 0]);
  P(l, "pos").setValue(pos || [W / 2, H / 2]);
  return l;
}
function groupContents(layer, groupName) {
  return layer.property("ADBE Root Vectors Group").property(groupName).property("ADBE Vectors Group");
}
function addGroup(layer, name) {
  var g = layer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
  g.name = name;
  return name;
}
function addRect(layer, g, size, round) {
  var r = groupContents(layer, g).addProperty("ADBE Vector Shape - Rect");
  r.property("ADBE Vector Rect Size").setValue(size);
  r.property("ADBE Vector Rect Roundness").setValue(round || 0);
}
function addEllipse(layer, g, size) {
  var e = groupContents(layer, g).addProperty("ADBE Vector Shape - Ellipse");
  e.property("ADBE Vector Ellipse Size").setValue(size);
}
function addPath(layer, g, verts, closed) {
  var p = groupContents(layer, g).addProperty("ADBE Vector Shape - Group");
  var s = new Shape();
  s.vertices = verts;
  s.closed = closed;
  p.property("ADBE Vector Shape").setValue(s);
}
function addTrim(layer, g, t0, t1) {
  var tr = groupContents(layer, g).addProperty("ADBE Vector Filter - Trim");
  keys(tr.property("ADBE Vector Trim End"), [t0, t1], [0, 100], 75);
}
function addFill(layer, g, color, opacity) {
  var f = groupContents(layer, g).addProperty("ADBE Vector Graphic - Fill");
  f.property("ADBE Vector Fill Color").setValue(hex(color));
  f.property("ADBE Vector Fill Opacity").setValue(opacity == null ? 100 : opacity);
}
function addStroke(layer, g, color, width, opacity) {
  var s = groupContents(layer, g).addProperty("ADBE Vector Graphic - Stroke");
  s.property("ADBE Vector Stroke Color").setValue(hex(color));
  s.property("ADBE Vector Stroke Width").setValue(width);
  s.property("ADBE Vector Stroke Opacity").setValue(opacity == null ? 100 : opacity);
  try { s.property("ADBE Vector Stroke Line Cap").setValue(2); s.property("ADBE Vector Stroke Line Join").setValue(2); } catch (e) {}
}
// Rounded "glass" pill / panel
function pill(comp, name, pos, size, round, fillColor, fillOpacity, strokeColor) {
  var l = shapeLayer(comp, name, pos);
  var g = addGroup(l, "Pill");
  addRect(l, g, size, round);
  if (strokeColor) addStroke(l, g, strokeColor, 2, 100);
  addFill(l, g, fillColor, fillOpacity);
  return l;
}
function dot(comp, name, pos, size, color, ring) {
  var l = shapeLayer(comp, name, pos);
  var g = addGroup(l, "Dot");
  addEllipse(l, g, [size, size]);
  if (ring) addStroke(l, g, C.white, 2, 70);
  addFill(l, g, color, 100);
  return l;
}
// Lamp-gold key cap with an ink letter, parented together.
function keycap(comp, letter, pos, size, t) {
  var cap = pill(comp, "Key " + letter, pos, [size, size], size * 0.18, C.gold, 100, null);
  var lab = text(comp, { name: "MONO Key " + letter, text: letter, role: "MONO", size: Math.round(size * 0.46), color: C.ink, pos: pos });
  lab.parent = cap;
  if (t != null) pop(cap, t);
  return cap;
}

// ---------- masks ----------
function maskRect(layer, x0, y0, x1, y1, feather, inverted, name) {
  var m = layer.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  if (name) m.name = name;
  var s = new Shape();
  s.vertices = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  s.closed = true;
  m.property("ADBE Mask Shape").setValue(s);
  if (feather) m.property("ADBE Mask Feather").setValue([feather, feather]);
  m.inverted = !!inverted;
  return m;
}
function maskEllipse(layer, cx, cy, rx, ry, feather, inverted, name) {
  var m = layer.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  if (name) m.name = name;
  var k = 0.5523, s = new Shape();
  s.vertices = [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]];
  s.inTangents = [[-rx * k, 0], [0, -ry * k], [rx * k, 0], [0, ry * k]];
  s.outTangents = [[rx * k, 0], [0, ry * k], [-rx * k, 0], [0, -ry * k]];
  s.closed = true;
  m.property("ADBE Mask Shape").setValue(s);
  if (feather) m.property("ADBE Mask Feather").setValue([feather, feather]);
  m.inverted = !!inverted;
  return m;
}

// ---------- effects ----------
function effect(layer, matchName, settings) {
  var fx = layer.property("ADBE Effect Parade").addProperty(matchName);
  for (var k in settings) { try { fx.property(k).setValue(settings[k]); } catch (e) { log("  effect setting skipped: " + k); } }
  return fx;
}

// ---------- footage ----------
function importStill(file, folder) {
  var f = new File(STILLS + file);
  if (!f.exists) throw new Error("Missing still: " + f.fsName);
  var item = app.project.importFile(new ImportOptions(f));
  item.parentFolder = folder;
  return item;
}
function still(comp, item, start, end) {
  var l = comp.layers.add(item);
  span(l, start, end);
  return l;
}

// =====================================================================
function build() {
  var proj = app.project;
  // The user's old promotionalvideo.aep held only an empty "Comp 1"; that one may be replaced.
  if (proj.numItems == 1 && proj.item(1) instanceof CompItem && proj.item(1).name == "Comp 1" && proj.item(1).numLayers == 0) {
    proj.item(1).remove();
    log("Removed the empty 'Comp 1'");
  }
  if (proj.numItems > 0) { log("ABORT: the open project already has " + proj.numItems + " items. Open a new empty project first."); return; }
  log("Build started " + new Date().toString());

  // Folders
  var fComps = proj.items.addFolder("01_Comps");
  var fScenes = proj.items.addFolder("Scenes"); fScenes.parentFolder = fComps;
  var fFootage = proj.items.addFolder("02_Footage");
  var fStills = proj.items.addFolder("Stills"); fStills.parentFolder = fFootage;
  var fRec = proj.items.addFolder("Recordings"); fRec.parentFolder = fFootage;
  var fAudio = proj.items.addFolder("03_Audio");
  var fMusic = proj.items.addFolder("Music"); fMusic.parentFolder = fAudio;
  var fSfx = proj.items.addFolder("SFX"); fSfx.parentFolder = fAudio;
  var fSolids = proj.items.addFolder("04_Solids");

  // Stills
  var S = {};
  var stillNames = ["S2_overview", "S3_plaza_02", "S3_plaza_03", "S3_plaza_04",
    "S4_01_studio", "S4_02_techlab", "S4_03_gamedev", "S4_04_campus", "S4_05_cinema",
    "S4_06_aistation", "S4_07_contact", "S4_08_plaza", "S5_01_prompt", "S5_02_panel"];
  for (var i = 0; i < stillNames.length; i++) S[stillNames[i]] = importStill(stillNames[i] + ".png", fStills);
  log("Imported " + stillNames.length + " stills");

  // =========== S1 Island intro (0:00-0:03.7) ===========
  var s1 = newComp("S1_IslandIntro", 3.7, fScenes);
  solid(s1, "BG Ink", C.ink);
  var MX = 960, MY = 430, U = 5.4; // map centre and pixels per world unit (north up)
  function mp(x, z) { return [x * U, z * U]; } // map point relative to the map layer
  function islandR(a) {
    var r = 39 + 1.6 * Math.sin(3 * a + 0.6) + 1.1 * Math.sin(5 * a + 2.1) + 0.6 * Math.sin(9 * a + 0.3);
    var d = a - Math.atan2(-31, -14);
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return r + 3 * Math.exp(-(d * d) / 0.06);
  }
  function outline(offset) {
    var pts = [], n = 120;
    for (var j = 0; j < n; j++) {
      var a = (j / n) * Math.PI * 2, r = islandR(a) + offset;
      pts.push(mp(Math.cos(a) * r, Math.sin(a) * r));
    }
    return pts;
  }
  // Island: grass fill + ink outline drawing itself
  var isl = shapeLayer(s1, "Island Map (ink outline)", [MX, MY]);
  var gFill = addGroup(isl, "Grass fill");
  addPath(isl, gFill, outline(0), true);
  addFill(isl, gFill, C.meadow, 100);
  keys(groupContents(isl, gFill).property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Opacity"), [1.5, 2.4], [0, 28]);
  var gBeach = addGroup(isl, "Beach line");
  addPath(isl, gBeach, outline(3.5), true);
  addTrim(isl, gBeach, 0.4, 1.9);
  addStroke(isl, gBeach, C.sand, 2, 45);
  var gEdge = addGroup(isl, "Ink outline");
  addPath(isl, gEdge, outline(0), true);
  addTrim(isl, gEdge, 0.0, 1.6);
  addStroke(isl, gEdge, C.lavender, 4, 100);
  effect(isl, "ADBE Turbulent Displace", { "Amount": 6, "Size": 14 });

  // Paths (real layout from src/data/worldLayout.js)
  var PATHS = [
    [[0, 34.5], [0, 27], [0, 19], [0, 11]], [[0, 11], [0, 4], [0, -2.6]], [[3, -2.6], [3.4, -7], [2, -10.5], [0, -12]],
    [[-5, 23], [-11, 20.6], [-16.2, 18.8]], [[5, 23], [11, 20.6], [16.2, 18.8]],
    [[-16.2, 10.8], [-11, 8.4], [-7, 6]], [[16.2, 10.8], [11, 8.4], [7, 6]],
    [[-22, 7.6], [-22.6, 0], [-22, -7.8]], [[22, 7.6], [22.6, 0], [22, -7.8]],
    [[-16.2, -15], [-11, -17.2], [-6.3, -19]], [[16.2, -15], [11, -17.2], [6.3, -19]],
    [[-20, -20.2], [-18.6, -24], [-16.4, -27.2]], [[-6.6, -21.2], [-8.6, -25], [-10.6, -28.9]]
  ];
  var paths = shapeLayer(s1, "Island Paths", [MX, MY]);
  for (var p = 0; p < PATHS.length; p++) {
    var pts = [];
    for (var q = 0; q < PATHS[p].length; q++) pts.push(mp(PATHS[p][q][0], PATHS[p][q][1]));
    var gp = addGroup(paths, "Path " + (p + 1));
    addPath(paths, gp, pts, false);
    addTrim(paths, gp, 0.7 + p * 0.06, 1.5 + p * 0.06);
    addStroke(paths, gp, C.sand, p < 3 ? 7 : 4, 90);
  }

  // Districts: accent dots at their real positions
  var ZONES = [
    ["Welcome Plaza", 0, 27, "#E9A93B"], ["Creative Studio", -22, 13.5, "#E07AA0"], ["Technology Lab", 22, 13.5, "#5FA39A"],
    ["Game Dev Zone", 0, 4, "#A97FD8"], ["University Campus", -22, -14, "#46598C"], ["Cinema", 0, -18, "#A83A4B"],
    ["AI Station", 22, -14, "#7F88E0"], ["Contact Station", -14, -31, "#E8664F"]
  ];
  for (var z = 0; z < ZONES.length; z++) {
    var zp = mp(ZONES[z][1], ZONES[z][2]);
    var d = dot(s1, "District " + ZONES[z][0], [MX + zp[0], MY + zp[1]], 26, ZONES[z][3], true);
    pop(d, 1.35 + z * 0.09);
  }
  // Cat marker walking up the boulevard from the plaza to the Game Dev Zone
  var cat = dot(s1, "Cat marker", [MX, MY + 27 * U], 14, C.white, false);
  fadeIn(cat, 1.8, 2.0);
  keys(P(cat, "pos"), [1.9, 3.4], [[MX, MY + 27 * U], [MX, MY + 4 * U]], 60);

  var t1 = text(s1, { name: "MONO Title line 1", text: "A 3D PORTFOLIO", role: "MONO", size: 34, color: C.white, tracking: 300, pos: [960, 800] });
  fadeIn(t1, 0.5, 1.2); trackIn(t1, 0.5, 1.6, 12);
  var t2 = text(s1, { name: "MONO Title line 2", text: "BY MUZNA RIZWAN", role: "MONO", size: 34, color: C.gold, tracking: 300, pos: [960, 856] });
  fadeIn(t2, 0.9, 1.6); trackIn(t2, 0.9, 2.0, 12);
  log("S1 done");

  // =========== S2 World reveal (0:03-0:07.4) ===========
  var s2 = newComp("S2_WorldReveal", 4.4, fScenes);
  var ov = still(s2, S["S2_overview"], 0, 4.4);
  keys(P(ov, "scale"), [0, 4.4], [[100, 100, 100], [111, 111, 100]], 40);
  var shadeTop = solid(s2, "Shade top (title legibility)", C.ink);
  maskRect(shadeTop, -200, -200, 2120, 330, 260, false, "Top band");
  P(shadeTop, "opacity").setValue(55);
  var vig = solid(s2, "Vignette", C.ink);
  maskEllipse(vig, 960, 540, 1150, 720, 420, true, "Vignette");
  P(vig, "opacity").setValue(45);
  var pre = text(s2, { name: "MONO Welcome to", text: "WELCOME TO", role: "MONO", size: 24, color: C.gold, tracking: 400, pos: [960, 92] });
  fadeIn(pre, 0.35, 0.9);
  var title = text(s2, { name: "DISPLAY Main title", text: "Muzna\u2019s Creative World", role: "DISPLAY", size: 104, color: C.white, pos: [960, 178] });
  keys(P(title, "pos"), [0.45, 1.25], [[960, 218], [960, 178]], 80);
  fadeIn(title, 0.45, 1.05);
  var ul = pill(s2, "Title underline", [960, 246], [Math.round(textWidth(title) * 0.42), 6], 3, C.lavender, 100, null);
  keys(P(ul, "scale"), [0.95, 1.55], [[0, 100, 100], [100, 100, 100]], 80);
  log("S2 done");

  // =========== S3 Explore as a cat (0:07-0:11.4) ===========
  var s3 = newComp("S3_Explore", 4.4, fScenes);
  var seq = ["S3_plaza_02", "S3_plaza_03", "S3_plaza_04"];
  for (var a = 0; a < 3; a++) {
    var st = still(s3, S[seq[a]], a * 1.5, a == 2 ? 4.4 : a * 1.5 + 1.7);
    keys(P(st, "scale"), [a * 1.5, a * 1.5 + 1.7], [[102, 102, 100], [106, 106, 100]], 30);
    if (a > 0) fadeIn(st, a * 1.5, a * 1.5 + 2 / FPS);
  }
  var box = pill(s3, "Glass panel", [410, 870], [600, 280], 22, C.glass, 82, C.line);
  keys(P(box, "pos"), [0.3, 0.8], [[410, 900], [410, 870]], 80);
  fadeIn(box, 0.3, 0.7);
  var ex = text(s3, { name: "BODY Explore it as a cat", text: "Explore it as a cat.", role: "BODY", size: 58, color: C.white, just: "left", pos: [150, 802] });
  fadeIn(ex, 0.5, 1.0);
  keycap(s3, "W", [282, 862], 76, 1.00);
  keycap(s3, "A", [198, 946], 76, 1.13);
  keycap(s3, "S", [282, 946], 76, 1.26);
  keycap(s3, "D", [366, 946], 76, 1.39);
  var mv = text(s3, { name: "MONO Move label", text: "TO MOVE", role: "MONO", size: 22, color: C.muted, tracking: 300, just: "left", pos: [432, 954] });
  fadeIn(mv, 1.6, 2.0);
  log("S3 done");

  // =========== S4 Location montage (0:11-0:31.4) ===========
  var s4 = newComp("S4_Montage", 20.4, fScenes);
  var LOC = [
    ["S4_01_studio", "Creative Studio", "ABOUT ME", "#E07AA0"],
    ["S4_02_techlab", "Technology Lab", "SKILLS", "#5FA39A"],
    ["S4_03_gamedev", "Game Dev Zone", "PROJECTS", "#A97FD8"],
    ["S4_04_campus", "University Campus", "EDUCATION", "#46598C"],
    ["S4_05_cinema", "Cinema", "SHOWREEL", "#A83A4B"],
    ["S4_06_aistation", "AI Station", "AI ASSISTANT", "#7F88E0"],
    ["S4_07_contact", "Contact Station", "CONTACT", "#E8664F"],
    ["S4_08_plaza", "Welcome Plaza", "START HERE", "#E9A93B"]
  ];
  for (var n = 0; n < LOC.length; n++) {
    var t0 = n * 2.5, tEnd = (n == LOC.length - 1) ? 20.4 : t0 + 2.8;
    var sl = still(s4, S[LOC[n][0]], t0, tEnd);
    if (n % 2 == 0) keys(P(sl, "scale"), [t0, tEnd], [[103, 103, 100], [109, 109, 100]], 30);
    else {
      keys(P(sl, "scale"), [t0, tEnd], [[109, 109, 100], [104, 104, 100]], 30);
      keys(P(sl, "pos"), [t0, tEnd], [[985, 540], [945, 540]], 30);
    }
    if (n > 0) fadeIn(sl, t0, t0 + 0.3);
    // HUD-style location label (bottom left), built like the site's location label
    var lblEnd = (n == LOC.length - 1) ? 20.1 : t0 + 2.5;
    var nm = text(s4, { name: "DISPLAY " + LOC[n][1], text: LOC[n][1], role: "DISPLAY", size: 44, color: C.white, just: "left", pos: [164, 994] });
    var tg = text(s4, { name: "MONO " + LOC[n][2], text: LOC[n][2], role: "MONO", size: 18, color: C.muted, tracking: 260, just: "left", pos: [166, 946] });
    var wpx = Math.max(textWidth(nm), textWidth(tg)) + 100;
    var lp = pill(s4, "Label " + LOC[n][1], [96 + wpx / 2, 962], [wpx, 104], 22, C.glass, 82, C.line);
    var ld = dot(s4, "Accent dot " + LOC[n][1], [130, 962], 20, LOC[n][3], true);
    nm.moveBefore(lp); tg.moveBefore(lp); ld.moveBefore(lp);
    var kids = [nm, tg, ld];
    for (var c = 0; c < kids.length; c++) { kids[c].parent = lp; followParentOpacity(kids[c]); span(kids[c], t0, lblEnd); }
    span(lp, t0, lblEnd);
    keys(P(lp, "pos"), [t0 + 0.2, t0 + 0.65], [[56 + wpx / 2, 962], [96 + wpx / 2, 962]], 85);
    keys(P(lp, "opacity"), [t0 + 0.2, t0 + 0.55, lblEnd - 0.3, lblEnd], [0, 100, 100, 0]);
    pop(ld, t0 + 0.45);
  }
  log("S4 done");

  // =========== S5 Interaction (0:31-0:36.4) ===========
  var s5 = newComp("S5_Interaction", 5.4, fScenes);
  solid(s5, "BG Ink", C.ink);
  // Stills are scaled from the right edge so the dev-mode badge (bottom left) falls off frame.
  var pr = still(s5, S["S5_01_prompt"], 0, 2.7);
  P(pr, "anchor").setValue([1920, 540]); P(pr, "pos").setValue([1920, 540]);
  keys(P(pr, "scale"), [0, 2.7], [[104, 104, 100], [108, 108, 100]], 30);
  var pnBase = still(s5, S["S5_02_panel"], 2.4, 5.4);
  P(pnBase, "anchor").setValue([1920, 540]); P(pnBase, "pos").setValue([1920, 540]);
  keys(P(pnBase, "scale"), [2.4, 5.4], [[104, 104, 100], [106, 106, 100]], 30);
  maskRect(pnBase, 0, 0, 1416, 1080, 0, false, "World only");
  fadeIn(pnBase, 2.4, 2.65);
  var pn = still(s5, S["S5_02_panel"], 2.4, 5.4);
  pn.name = "Projects panel (slides in)";
  P(pn, "anchor").setValue([1920, 540]);
  keys(P(pn, "scale"), [2.4, 5.4], [[104, 104, 100], [106, 106, 100]], 30);
  keys(P(pn, "pos"), [2.45, 2.95], [[2480, 540], [1920, 540]], 85);
  maskRect(pn, 1416, 0, 1920, 1080, 0, false, "Panel only");
  var ek = keycap(s5, "E", [1130, 940], 112, 0.5);
  ek.name = "Key E (press)";
  keys(P(ek, "scale"), [1.7, 1.78, 1.92], [[100, 100, 100], [86, 86, 100], [100, 100, 100]], 50);
  keys(P(ek, "opacity"), [2.3, 2.5], [100, 0]);
  var ekLabel = null;
  for (var li = 1; li <= s5.numLayers; li++) if (s5.layer(li).name == "MONO Key E") ekLabel = s5.layer(li);
  if (ekLabel) followParentOpacity(ekLabel);
  log("S5 done");

  // =========== S6 Skills (0:36-0:40.4) ===========
  var s6 = newComp("S6_Skills", 4.4, fScenes);
  solid(s6, "BG Ink", C.ink);
  var glow = solid(s6, "Lavender glow", C.lavender);
  maskEllipse(glow, 960, 560, 700, 300, 380, false, "Glow");
  P(glow, "opacity").setValue(14);
  var sk = text(s6, { name: "MONO Skills tag", text: "SKILLS", role: "MONO", size: 24, color: C.gold, tracking: 400, pos: [960, 420] });
  fadeIn(sk, 0.2, 0.6);
  var SK = [["Unity", "#A97FD8"], ["C++", "#5FA39A"], ["Blender", "#E07AA0"], ["Three.js", "#7F88E0"], ["After Effects", "#A83A4B"]];
  var labels = [], widths = [], total = 0, GAP = 24;
  for (var s = 0; s < SK.length; s++) {
    var lt = text(s6, { name: "BODY " + SK[s][0], text: SK[s][0], role: "BODY", size: 40, color: C.white, just: "left", pos: [0, 554] });
    labels.push(lt); widths.push(textWidth(lt) + 96); total += textWidth(lt) + 96;
  }
  total += GAP * (SK.length - 1);
  var x = 960 - total / 2;
  for (s = 0; s < SK.length; s++) {
    var cx = x + widths[s] / 2, ts = 0.4 + s * 0.16;
    var sp = pill(s6, "Pill " + SK[s][0], [cx, 540], [widths[s], 84], 42, C.glass, 90, C.line);
    var sd = dot(s6, "Dot " + SK[s][0], [x + 36, 540], 16, SK[s][1], false);
    P(labels[s], "pos").setValue([x + 62, 554]);
    labels[s].moveBefore(sp); sd.moveBefore(sp);
    labels[s].parent = sp; sd.parent = sp;
    followParentOpacity(labels[s]); followParentOpacity(sd);
    keys(P(sp, "pos"), [ts, ts + 0.45], [[cx, 590], [cx, 540]], 85);
    fadeIn(sp, ts, ts + 0.35);
    x += widths[s] + GAP;
  }
  log("S6 done");

  // =========== S7 End card (0:40-0:44) ===========
  var s7 = newComp("S7_EndCard", 4.0, fScenes);
  solid(s7, "BG Ink", C.ink);
  var glow7 = solid(s7, "Lavender glow", C.lavender);
  maskEllipse(glow7, 960, 560, 800, 320, 420, false, "Glow");
  P(glow7, "opacity").setValue(10);
  // Lighthouse beam: a soft warm wedge sweeping from off-frame left
  var beam = shapeLayer(s7, "Lighthouse beam", [-120, 200]);
  var gb = addGroup(beam, "Beam");
  var L = 2700, half = 0.09;
  addPath(beam, gb, [[0, 0], [L * Math.cos(half), -L * Math.sin(half)], [L * Math.cos(half), L * Math.sin(half)]], true);
  addFill(beam, gb, C.gold, 100);
  P(beam, "opacity").setValue(22);
  beam.blendingMode = BlendingMode.ADD;
  effect(beam, "ADBE Gaussian Blur 2", { "ADBE Gaussian Blur 2-0001": 60 });
  keys(P(beam, "rot"), [0, 3.0], [-14, 30], 40);
  var brand = text(s7, { name: "MONO Portfolio name", text: "MUZNA\u2019S CREATIVE WORLD", role: "MONO", size: 24, color: C.lavender, tracking: 400, pos: [960, 400] });
  var nameL = text(s7, { name: "DISPLAY Muzna Rizwan", text: "MUZNA RIZWAN", role: "DISPLAY", size: 120, color: C.white, tracking: 20, pos: [960, 508] });
  var sub = text(s7, { name: "BODY Disciplines", text: "Game Art \u2022 Gaming & Animation \u2022 Creative Technology", role: "BODY", size: 36, color: C.muted, pos: [960, 600] });
  var url = text(s7, { name: "MONO Site URL", text: "muzna.zubairy.world", role: "MONO", size: 34, color: C.gold, tracking: 60, pos: [960, 690] });
  var seqT = [[brand, 0.6], [nameL, 0.85], [sub, 1.15], [url, 1.45]];
  for (var r = 0; r < seqT.length; r++) {
    var lay = seqT[r][0], tt = seqT[r][1], pp = P(lay, "pos").value;
    keys(P(lay, "pos"), [tt, tt + 0.6], [[pp[0], pp[1] + 26], [pp[0], pp[1]]], 85);
    fadeIn(lay, tt, tt + 0.5);
  }
  var fade = solid(s7, "Fade to ink", C.ink);
  keys(P(fade, "opacity"), [3.0, 4.0], [0, 100], 60);
  log("S7 done");

  // =========== MAIN ===========
  var main = newComp("MAIN_Promo_44s", 44, fComps);
  var order = [[s1, 0, 3.7], [s2, 3.0, 7.4], [s3, 7.0, 11.4], [s4, 11.0, 31.4], [s5, 31.0, 36.4], [s6, 36.0, 40.4], [s7, 40.0, 44.0]];
  var mainLayers = [];
  for (var o = 0; o < order.length; o++) {
    var ml = main.layers.add(order[o][0]);
    ml.startTime = order[o][1];
    ml.outPoint = order[o][2];
    mainLayers.push(ml);
    if (o >= 2) fadeIn(ml, order[o][1], order[o][1] + 0.33);
  }
  // S1 -> S2: circular reveal growing out of the island centre
  var irisMask = maskEllipse(mainLayers[1], 960, 430, 24, 24, 140, false, "Iris reveal");
  keys(mainLayers[1].property("ADBE Mask Parade").property("Iris reveal").property("ADBE Mask Offset"), [3.0, 3.75], [0, 1500], 70);

  // Audio placement markers (replace with real audio later: add-audio.jsx)
  var MK = [[0.0, "MUSIC start (fade out 42.5-44)"], [0.0, "SFX ink_draw"], [3.0, "SFX whoosh"], [7.0, "SFX footsteps"],
    [8.0, "SFX pop (W A S D)"], [13.5, "SFX swish"], [16.0, "SFX swish"], [18.5, "SFX swish"], [21.0, "SFX swish"],
    [23.5, "SFX swish"], [26.0, "SFX swish + coast"], [28.5, "SFX swish"], [32.7, "SFX click (E)"], [40.0, "SFX coast (end card)"]];
  for (var m = 0; m < MK.length; m++) main.markerProperty.setValueAtTime(MK[m][0] + (m == 1 ? 0.001 : 0), new MarkerValue(MK[m][1]));

  // Tidy: move auto-created solids into 04_Solids, drop the empty "Solids" folder
  for (var it = proj.numItems; it >= 1; it--) {
    var item = proj.item(it);
    if (item instanceof FootageItem && item.mainSource instanceof SolidSource) item.parentFolder = fSolids;
  }
  for (it = proj.numItems; it >= 1; it--) {
    var f = proj.item(it);
    if (f instanceof FolderItem && f.name == "Solids" && f.numItems == 0) f.remove();
  }

  main.openInViewer();
  var out = new File(ROOT + "promotionalvideo.aep");
  proj.save(out);
  log("Saved " + out.fsName);
  log("DONE");
}

app.beginUndoGroup("Build promo");
try { build(); } catch (e) { log("ERROR line " + e.line + ": " + e.toString()); }
app.endUndoGroup();
