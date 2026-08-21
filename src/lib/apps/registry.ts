import { readdirSync, readFileSync } from "fs";
import { join } from "path";

export type AppPageMeta = {
  title: string;
  description: string;
};

export type AppMarkdownPage = {
  appSlug: string;
  pageSlug: string;
};

/** Optional SEO per app + page (lowercase keys) */
export const appPageMeta: Record<string, Partial<Record<string, AppPageMeta>>> = {
  bmplayer: {
    privacy: {
      title: "BMPlayer — Privacy Policy",
      description:
        "Privacy policy for BMPlayer, including account data, AdMob, and your rights.",
    },
  },
  calorietracker: {
    privacy: {
      title: "Calorie & Protein Tracker — Privacy Policy",
      description:
        "Privacy policy for Calorie & Protein Tracker. The app stores food logs on your device and collects nothing.",
    },
  },
};

const contentDir = join(process.cwd(), "src/content/apps");

export function getAppMarkdown(appSlug: string, pageSlug: string): string | null {
  const app = appSlug.toLowerCase();
  const page = pageSlug.toLowerCase();

  try {
    return readFileSync(join(contentDir, app, `${page}.md`), "utf-8");
  } catch {
    return null;
  }
}

export function getAppPageMeta(
  appSlug: string,
  pageSlug: string,
): AppPageMeta | undefined {
  const app = appSlug.toLowerCase();
  const page = pageSlug.toLowerCase();
  return appPageMeta[app]?.[page];
}

/** Scan markdown files under `src/content/apps` for static export params. */
export function listAppMarkdownPages(): AppMarkdownPage[] {
  try {
    const apps = readdirSync(contentDir, { withFileTypes: true }).filter((d) =>
      d.isDirectory(),
    );

    return apps.flatMap((appDir) => {
      const files = readdirSync(join(contentDir, appDir.name));
      return files
        .filter((name) => name.endsWith(".md"))
        .map((name) => ({
          appSlug: appDir.name.toLowerCase(),
          pageSlug: name.replace(/\.md$/i, "").toLowerCase(),
        }));
    });
  } catch {
    return [];
  }
}

export function titleCaseSegment(slug: string) {
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
