// fix-pass-1.jsx: small corrections after the first preview, changing only these layers:
//  S1  title lines: base tracking 420 -> 300, letter drift-in 260 -> 120 (letters ran off-screen)
//  S3  walking stills: 0.2 s dissolves -> 2-frame dissolves (ghosting of the cat)
//  S5  big E key moved right of the cat: (960,880) -> (1130,940)
// Then saves the project.
(function () {
  var LOG = new File("D:/Users/Muzna/uni/wp/ccp/art-source/after-effects/scripts/fix-log.txt");
  LOG.open("w");
  function comp(name) { for (var i = 1; i <= app.project.numItems; i++) if (app.project.item(i).name == name) return app.project.item(i); return null; }
  function layer(c, name) { for (var i = 1; i <= c.numLayers; i++) if (c.layer(i).name == name) return c.layer(i); return null; }
  function ease(p) {
    var e = [new KeyframeEase(0, 70)];
    for (var k = 1; k <= p.numKeys; k++) try { p.setTemporalEaseAtKey(k, e, e); } catch (err) {}
  }
  app.beginUndoGroup("Promo fix pass 1");
  try {
    var s1 = comp("S1_IslandIntro");
    var names = ["MONO Title line 1", "MONO Title line 2"];
    for (var n = 0; n < names.length; n++) {
      var l = layer(s1, names[n]);
      var sp = l.property("ADBE Text Properties").property("ADBE Text Document");
      var td = sp.value; td.tracking = 300; sp.setValue(td);
      var tr = l.property("ADBE Text Properties").property("ADBE Text Animators").property("Tracking in")
        .property("ADBE Text Animator Properties").property("ADBE Text Tracking Amount");
      tr.setValueAtKey(1, 120);
      var r = l.sourceRectAtTime(3.0, false);
      l.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([r.left + r.width / 2, r.top + r.height / 2]);
      LOG.writeln("S1 fixed " + names[n]);
    }
    var s3 = comp("S3_Explore");
    var stills = ["S3_plaza_03.png", "S3_plaza_04.png"];
    for (var s = 0; s < stills.length; s++) {
      var st = layer(s3, stills[s]);
      var op = st.property("ADBE Transform Group").property("ADBE Opacity");
      var t0 = st.inPoint;
      while (op.numKeys > 0) op.removeKey(1);
      op.setValueAtTime(t0, 0); op.setValueAtTime(t0 + 2 / 30, 100);
      LOG.writeln("S3 fixed " + stills[s] + " at " + t0);
    }
    var s5 = comp("S5_Interaction");
    layer(s5, "Key E (press)").property("ADBE Transform Group").property("ADBE Position").setValue([1130, 940]);
    LOG.writeln("S5 moved E key");
    app.project.save();
    LOG.writeln("saved");
  } catch (e) { LOG.writeln("ERROR line " + e.line + ": " + e.toString()); }
  app.endUndoGroup();
  LOG.writeln("DONE");
  LOG.close();
})();
