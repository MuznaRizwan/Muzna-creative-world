// list-output-templates.jsx: read-only. Adds MAIN to the render queue temporarily to list the
// available output-module and render-settings templates, then removes that queue item again.
(function () {
  var LOG = new File("D:/Users/Muzna/uni/wp/ccp/art-source/after-effects/scripts/templates-log.txt");
  LOG.open("w");
  var main = null;
  for (var i = 1; i <= app.project.numItems; i++) if (app.project.item(i).name == "MAIN_Promo_44s") main = app.project.item(i);
  var rq = app.project.renderQueue.items.add(main);
  LOG.writeln("OUTPUT MODULE TEMPLATES:");
  var t = rq.outputModule(1).templates;
  for (var j = 0; j < t.length; j++) LOG.writeln("  " + t[j]);
  LOG.writeln("RENDER SETTINGS TEMPLATES:");
  var r = rq.templates;
  for (j = 0; j < r.length; j++) LOG.writeln("  " + r[j]);
  rq.remove();
  LOG.writeln("DONE");
  LOG.close();
})();
