import { GalaxyConfig } from "./types";

export const DEFAULT_CONFIG: GalaxyConfig = {
  pageName: "ICE",

  startTitle: "Welcome to Our Universe",

  startSubtitle:
    "Every star tells a story, but my favorite story has always been you.",

  includeMusic: true,

  musicTrackName: "I Really Want to Stay at Your House (Lofi)",

  orbitSpeed: 1.0,

 phrases: [
  "YOU ARE MY HOME",
  "YOUR SMILE > THE STARS",
  "ONLY YOU ♡",
  "IN EVERY UNIVERSE",
  "MY FOREVER",
  "LOVE WITHOUT END",
  "BLUE HEART",
  "YOU ARE ENOUGH",
  "ETERNALLY YOURS",
  "I'D CHOOSE YOU AGAIN"
],

  panels: [
    {
      id: "panel-1",
      title: "The First Time",
      message:
        "I still remember the moment everything changed. From that day on, my heart quietly decided that it wanted to stay with you.",
      photoUrl: "/IMG_5611.jpg"
    },

    {
      id: "panel-2",
      title: "Our Little World",
      message:
        "Whenever I'm with you, the rest of the world becomes silent. It's just you, me, and a universe that suddenly feels complete.",
      photoUrl: "/IMG_5472.jpg"
    },

    {
      id: "panel-3",
      title: "Your Smile",
      message:
        "Your smile is brighter than every constellation I've ever seen. It turns ordinary moments into memories I'll treasure forever.",
      photoUrl: "/IMG_5471.jpg"
    },

    {
      id: "panel-4",
      title: "My Promise",
      message:
        "No matter where life takes us, I'll always choose you. Again. Again. And every single time after that.",
      photoUrl: "/IMG_3239.jpg"
    }
  ]
};
