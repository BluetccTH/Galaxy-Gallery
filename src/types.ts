export interface GalleryPanel {
  id: string;
  photoUrl: string;
  title: string;
  message: string;
}

export interface GalaxyConfig {
  pageName: string;
  startTitle: string;
  startSubtitle: string;
  includeMusic: boolean;
  musicTrackName: string;
  phrases: string[];
  panels: GalleryPanel[];
  orbitSpeed: number;
}
