import bmplayerPrivacy from "../content/apps/bmplayer/privacy.md?raw";

/** Lowercase app slug → page key → markdown source */
export const appMarkdownPages: Record<string, Record<string, string>> = {
  bmplayer: {
    privacy: bmplayerPrivacy,
  },
};

export type AppPageMeta = {
  title: string;
  description: string;
};

/** Optional SEO per app + page (lowercase keys) */
export const appPageMeta: Record<
  string,
  Partial<Record<string, AppPageMeta>>
> = {
  bmplayer: {
    privacy: {
      title: "BMPlayer — Privacy Policy",
      description:
        "Privacy policy for BMPlayer, including account data, AdMob, and your rights.",
    },
  },
};
