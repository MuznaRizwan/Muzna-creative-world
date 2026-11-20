/** Site-wide identity used in metadata and the page shell. */
export const SITE = {
  name: "Muzna's Creative World",
  owner: "Muzna Rizwan",
  description:
    "An interactive 3D web portfolio by Muzna Rizwan, BS Computer Science (Gaming & Animation), NED University of Engineering and Technology.",
} as const;

/**
 * Public URLs of externally created assets (Blender, After Effects).
 * The files are produced outside this codebase and dropped into /public.
 */
export const ASSET_PATHS = {
  catModel: "/models/muzna-cat.glb",
  introVideo: "/videos/portfolio-intro.mp4",
} as const;
