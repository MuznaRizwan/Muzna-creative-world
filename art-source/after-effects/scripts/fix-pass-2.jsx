// fix-pass-2.jsx: the S1 title letters still drifted too wide; start the drift at 12 instead of 120. Saves.
(function () {
  var LOG = new File("D:/Users/Muzna/uni/wp/ccp/art-source/after-effects/scripts/fix-log.txt");
  LOG.open("w");
  var s1 = null;
  for (var i = 1; i <= app.project.numItems; i++) if (app.project.item(i).name == "S1_IslandIntro") s1 = app.project.item(i);
  app.beginUndoGroup("Promo fix pass 2");
  try {
    var names = ["MONO Title line 1", "MONO Title line 2"];
    for (var n = 0; n < names.length; n++) {
      var l = null;
      for (var j = 1; j <= s1.numLayers; j++) if (s1.layer(j).name == names[n]) l = s1.layer(j);
      l.property("ADBE Text Properties").property("ADBE Text Animators").property("Tracking in")
        .property("ADBE Text Animator Properties").property("ADBE Text Tracking Amount").setValueAtKey(1, 12);
      LOG.writeln("fixed " + names[n]);
    }
    app.project.save();
    LOG.writeln("saved");
  } catch (e) { LOG.writeln("ERROR " + e.toString()); }
  app.endUndoGroup();
  LOG.writeln("DONE");
  LOG.close();
})();
