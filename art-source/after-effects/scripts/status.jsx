// status.jsx: read-only. Logs the open project's path, item count and render-queue state.
(function () {
  var LOG = new File("D:/Users/Muzna/uni/wp/ccp/art-source/after-effects/scripts/status-log.txt");
  LOG.open("w");
  var p = app.project;
  LOG.writeln("file=" + (p.file ? p.file.fsName : "(unsaved)") + " items=" + p.numItems + " rendering=" + p.renderQueue.rendering);
  for (var i = 1; i <= p.renderQueue.numItems; i++) LOG.writeln("rq " + i + " status=" + p.renderQueue.item(i).status + " comp=" + p.renderQueue.item(i).comp.name);
  LOG.writeln("DONE");
  LOG.close();
})();
