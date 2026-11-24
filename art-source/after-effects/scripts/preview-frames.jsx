// preview-frames.jsx: saves still PNGs of the MAIN_Promo comp at chosen times, for checking the build.
// Read-only for the project (it only writes image files to the scratchpad folder).
(function () {
  var OUT = "C:/Users/Muzna/AppData/Local/Temp/claude/adf8a565d7e872ca/67549149-2f3e-43c4-8cf0-4220bda89b9c/scratchpad/frames/";
  new Folder(OUT).create();
  var LOG = new File(OUT + "frames-log.txt");
  LOG.open("w");
  var main = null;
  for (var i = 1; i <= app.project.numItems; i++) if (app.project.item(i) instanceof CompItem && app.project.item(i).name.indexOf("MAIN_Promo") == 0) main = app.project.item(i);
  if (!main) { LOG.writeln("no MAIN comp"); LOG.close(); return; }
  var times = [2.6, 38.5, 40.2, 40.6, 42.5, 44.7, 45.5, 47.2, 48.2, 50.2, 51.5];
  for (var t = 0; t < times.length; t++) {
    var name = "f_" + ("0" + Math.floor(times[t])).slice(-2) + "_" + Math.round((times[t] % 1) * 10) + ".png";
    try { main.saveFrameToPng(times[t], new File(OUT + name)); LOG.writeln("ok " + name); }
    catch (e) { LOG.writeln("ERR " + name + " " + e.toString()); }
  }
  LOG.writeln("DONE");
  LOG.close();
})();
