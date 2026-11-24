// render-frames.jsx: renders MAIN_Promo_44s (Best Settings, output template "Lossless" = uncompressed AVI)
// to art-source/after-effects/render/promo_lossless.avi (git-ignored). AE 2021 has no H.264 output, so the
// frames are encoded to MP4 in a second step. The temporary render-queue item is removed afterwards;
// no comps are changed.
(function () {
  var BASE = "D:/Users/Muzna/uni/wp/ccp/art-source/after-effects/render/";
  var LOG = new File(BASE + "render-log.txt");
  new Folder(BASE).create();
  LOG.open("w"); LOG.writeln("start " + new Date().toString()); LOG.close();
  function log(s) { LOG.open("a"); LOG.writeln(s); LOG.close(); }
  try {
    var main = null;
    for (var i = 1; i <= app.project.numItems; i++) if (app.project.item(i).name == "MAIN_Promo_44s") main = app.project.item(i);
    var rqi = app.project.renderQueue.items;
    for (var r = rqi.length; r >= 1; r--) if (rqi[r].status != RQItemStatus.DONE) rqi[r].remove();
    var rq = rqi.add(main);
    rq.applyTemplate("Best Settings");
    var om = rq.outputModule(1);
    om.applyTemplate("Lossless");
    om.file = new File(BASE + "promo_lossless.avi");
    log("output: " + om.file.fsName);
    app.project.renderQueue.render();
    log("render status: " + rq.status);
    rq.remove();
  } catch (e) { log("ERROR line " + e.line + ": " + e.toString()); }
  log("DONE " + new Date().toString());
})();
