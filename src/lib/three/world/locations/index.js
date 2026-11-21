import { buildAIStation } from "./AIStation";
import { buildCinema } from "./Cinema";
import { buildContactStation } from "./ContactStation";
import { buildCreativeStudio } from "./CreativeStudio";
import { buildGameDevZone } from "./GameDevZone";
import { buildTechnologyLab } from "./TechnologyLab";
import { buildUniversityCampus } from "./UniversityCampus";
import { buildWelcomePlaza } from "./WelcomePlaza";

/**
 * One builder per location, keyed by zone id (see src/data/worldLayout.js).
 * Each builder only adds to its own context, so locations can be added,
 * removed or rebuilt independently.
 * @type {Record<string, (ctx: import("./common").LocationContext, options?: any) => void>}
 */
export const LOCATION_BUILDERS = {
  plaza: buildWelcomePlaza,
  studio: buildCreativeStudio,
  lab: buildTechnologyLab,
  gamedev: buildGameDevZone,
  campus: buildUniversityCampus,
  cinema: buildCinema,
  ai: buildAIStation,
  contact: buildContactStation,
};
