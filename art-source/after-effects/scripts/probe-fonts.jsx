// probe-fonts.jsx: makes a temporary comp with one text layer, tries each font name,
// logs what AE reports back, then deletes the temporary comp. Changes nothing else.
(function () {
  var LOG = new File("D:/Users/Muzna/uni/wp/ccp/art-source/after-effects/scripts/probe-log.txt");
  LOG.open("w");
  var comp = app.project.items.addComp("__font_probe", 400, 200, 1, 1, 30);
  var l = comp.layers.addText("Probe");
  var sp = l.property("ADBE Text Properties").property("ADBE Text Document");
  var names = ["BricolageGrotesque-Bold", "Manrope-SemiBold", "JetBrainsMono-Medium", "SegoeUI-Bold", "SegoeUI-Semibold", "Consolas", "NoSuchFont-Xyz"];
  LOG.writeln("default=" + sp.value.font + " numItems(before probe)=" + (app.project.numItems - 1));
  for (var i = 0; i < names.length; i++) {
    var td = sp.value;
    td.font = "ArialMT";
    sp.setValue(td);
    td = sp.value;
    td.font = names[i];
    var err = "";
    try { sp.setValue(td); } catch (e) { err = e.toString(); }
    var r = l.sourceRectAtTime(0, false);
    LOG.writeln(names[i] + " -> font=" + sp.value.font + " family=" + sp.value.fontFamily + " width=" + Math.round(r.width) + (err ? " ERR " + err : ""));
  }
  comp.remove();
  LOG.close();
})();
