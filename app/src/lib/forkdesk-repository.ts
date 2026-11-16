/** The GitHub repository that Forkdesk is published from. */
export const ForkdeskRepository = 'vuurtorenokkenwaterpokken/forkdesk'

/**
 * Where Squirrel finds the latest release, its `RELEASES` file and packages.
 *
 * GitHub redirects these to the assets of the latest release.
 */
export const ForkdeskUpdatesURL = `https://github.com/${ForkdeskRepository}/releases/latest/download`

/** The releases of Forkdesk, for their release notes. */
export const ForkdeskReleasesAPIURL = `https://api.github.com/repos/${ForkdeskRepository}/releases`
