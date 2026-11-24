// add-audio.jsx: imports the audio files in art-source/after-effects/audio/ and places them in
// the MAIN_Promo comp (52 s) at the marker times, with levels and fades. Safe to re-run: it first removes the
// audio layers it made before (names start with "AUDIO "). Files are matched by name:
//   music/<anything>          -> whole video, -12 dB, fades out over the last 1.5 s
//   sfx/*ink*                 -> 0.0 s        sfx/*whoosh*    -> 3.0 s
//   sfx/*foot*                -> 7.0 s        sfx/*pop*       -> 8.0, 8.13, 8.26, 8.39 s (W A S D)
//   sfx/*swish*               -> the 7 montage cuts + 39.9 s (projects) + 44.4 s (highlights)
//   sfx/*click*               -> 32.7 s (E press)        sfx/*pop* also -> 40.35-40.89 s (project cards)
//   sfx/*coast*               -> 26.0 s (Contact) and 48.0 s (end card), quiet, faded
// Saves the project at the end. Log: scripts/audio-log.txt
(function () {
  var ROOT = "D:/Users/Muzna/uni/wp/ccp/art-source/after-effects/";
  var LOG = new File(ROOT + "scripts/audio-log.txt");
  LOG.open("w");
  function log(s) { LOG.writeln(s); }
  function find(name) { for (var i = 1; i <= app.project.numItems; i++) if (app.project.item(i).name == name) return app.project.item(i); return null; }
  function audioFiles(dir) {
    var out = [], fs = new Folder(ROOT + "audio/" + dir).getFiles();
    for (var i = 0; i < fs.length; i++) if (fs[i] instanceof File && /\.(mp3|wav|aif|aiff|m4a)$/i.test(fs[i].name)) out.push(fs[i]);
    return out;
  }
  function levels(layer) { return layer.property("ADBE Audio Group").property("ADBE Audio Levels"); }

  app.beginUndoGroup("Add promo audio");
  try {
    var main = null, fMusic = find("Music"), fSfx = find("SFX");
    for (var mi = 1; mi <= app.project.numItems; mi++) { var ci = app.project.item(mi); if (ci instanceof CompItem && ci.name.indexOf("MAIN_Promo") == 0) main = ci; }
    var END = main.duration;
    log("comp: " + main.name + " (" + END + " s)");
    for (var l = main.numLayers; l >= 1; l--) if (main.layer(l).name.indexOf("AUDIO ") == 0) main.layer(l).remove();

    function place(file, folder, times, dB, label, fadeLen, maxLen) {
      var item = null;
      for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if (it instanceof FootageItem && it.file && it.file.fsName == file.fsName) item = it;
      }
      if (!item) { item = app.project.importFile(new ImportOptions(file)); item.parentFolder = folder; }
      for (var t = 0; t < times.length; t++) {
        var lay = main.layers.add(item);
        lay.name = "AUDIO " + label + (times.length > 1 ? " " + (t + 1) : "");
        lay.startTime = times[t];
        lay.moveToEnd();
        if (maxLen) lay.outPoint = Math.min(lay.outPoint, times[t] + maxLen);
        if (lay.outPoint > END) lay.outPoint = END;
        levels(lay).setValue([dB, dB]);
        if (fadeLen) {
          var end = Math.min(lay.outPoint, END);
          levels(lay).setValueAtTime(times[t], [-48, -48]);
          levels(lay).setValueAtTime(times[t] + fadeLen, [dB, dB]);
          levels(lay).setValueAtTime(end - fadeLen, [dB, dB]);
          levels(lay).setValueAtTime(end, [-48, -48]);
        }
        log("placed " + file.name + " at " + times[t] + " (" + dB + " dB)");
      }
    }

    var music = audioFiles("music");
    if (music.length) {
      place(music[0], fMusic, [0], -12, "Music", 0);
      var ml = null;
      for (l = 1; l <= main.numLayers; l++) if (main.layer(l).name == "AUDIO Music") ml = main.layer(l);
      ml.outPoint = END;
      levels(ml).setValueAtTime(0, [-40, -40]); levels(ml).setValueAtTime(1.0, [-12, -12]);
      levels(ml).setValueAtTime(END - 1.5, [-12, -12]); levels(ml).setValueAtTime(END, [-60, -60]);
    } else log("no music file found");

    // [match, start times, dB, label, fade-in/out seconds, max length per placement]
    var RULES = [
      [/ink|pen|pencil|scribble|writing/i, [0.0], -10, "Ink draw", 0.15, 2.6],
      [/wh?oosh/i, [3.0], -10, "Whoosh", 0, 2.3],
      [/foot|step|walk/i, [7.0], -16, "Footsteps", 0.4, 4.0],
      [/pop/i, [8.0, 8.13, 8.26, 8.39, 40.35, 40.53, 40.71, 40.89], -18, "Pop", 0, 0.5],
      [/swish|swoosh|transition/i, [13.4, 15.9, 18.4, 20.9, 23.4, 25.9, 28.4, 39.9, 44.4], -18, "Swish", 0.1, 1.2],
      [/click/i, [32.65], -10, "Click", 0, 1.0],
      [/coast|wave|sea|gull|ocean|bird/i, [26.0, 48.0], -20, "Coast", 0.8, 4.0]
    ];
    var sfx = audioFiles("sfx");
    for (var s = 0; s < sfx.length; s++) {
      var used = false;
      for (var r = 0; r < RULES.length && !used; r++) {
        if (RULES[r][0].test(sfx[s].name)) { place(sfx[s], fSfx, RULES[r][1], RULES[r][2], RULES[r][3], RULES[r][4], RULES[r][5]); used = true; }
      }
      if (!used) log("not matched (left out): " + sfx[s].name);
    }
    app.project.save();
    log("saved");
  } catch (e) { log("ERROR line " + e.line + ": " + e.toString()); }
  app.endUndoGroup();
  log("DONE");
  LOG.close();
})();
