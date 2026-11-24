// probe-output.jsx: removes leftover (unrendered) render-queue items, then temporarily adds MAIN,
// logs what the "Lossless" and "TIFF Sequence with Alpha" templates write, and removes it again.
(function () {
  var LOG = new File("D:/Users/Muzna/uni/wp/ccp/art-source/after-effects/render/probe-log.txt");
  LOG.open("w");
  var rqi = app.project.renderQueue.items;
  for (var i = rqi.length; i >= 1; i--) {
    if (rqi[i].status != RQItemStatus.DONE) { LOG.writeln("removed leftover rq item " + i); rqi[i].remove(); }
  }
  var main = null;
  for (i = 1; i <= app.project.numItems; i++) if (app.project.item(i).name == "MAIN_Promo_44s") main = app.project.item(i);
  var rq = rqi.add(main);
  var tpl = ["Lossless", "TIFF Sequence with Alpha"];
  for (var t = 0; t < tpl.length; t++) {
    var om = rq.outputModule(1);
    om.applyTemplate(tpl[t]);
    var s = om.getSettings(GetSettingsFormat.STRING);
    LOG.writeln("== " + tpl[t]);
    for (var k in s) LOG.writeln("  " + k + " = " + s[k]);
  }
  rq.remove();
  LOG.writeln("DONE");
  LOG.close();
})();
