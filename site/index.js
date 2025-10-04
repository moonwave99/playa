import { load, render } from "goffre";
import marked from "marked";
import pkg from "../package.json" with { type: "json" };
import * as cheerio from "cheerio";

const dateFormats = {
  long: {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  short: {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
};

function getDomain(context) {
  if (!context) {
    return process.env.NODE_ENV === "development"
      ? "http://localhost:900"
      : pkg.homepage;
  }
  return context.data.root.options.domain;
}

const helpers = {
  getUrl: (url, context) => {
    if (url.startsWith("http")) {
      return url;
    }
    return [getDomain(context), url].join("/").replace(/index$/, "");
  },
  isCurrent: (page, section) => page.slug.startsWith(section),
  formatDate: (date) => date.toLocaleDateString(undefined, dateFormats.short),
  getTimestamp: (date) => new Date(date).toISOString(),
  thisYear: () => new Date().getFullYear(),
  formatExcerpt: (content) =>
    marked(content).replaceAll("<p>", "").replaceAll("</p>", ""),
};

const markdown = {
  renderer: {
    paragraph: (text) => `<p class="lh-copy">${text}</p>`,
    codespan: (code) => `<code class="dark-pink">${code}</code>`,
    image: (href, _, text) => `
            <figure>
                <img class="lazy loadable" loading="lazy" src="${helpers.getUrl(href)}" alt="${text}"/>
                <figcaption>${text}</figcaption>
            </figure>`,
    link: (href, _, text) => {
      const target = href.indexOf("http") > -1 ? " target='_blank'" : null;
      return `<a class="link blue underline-hover" href="${href}"${target}>${text}</a>`;
    },
    heading: (text, level) => {
      const escapedText = text.toLowerCase().replace(/[^\w]+/g, "-");
      return `
    <h${level} class="mt5">
      <a name="${escapedText}" class="anchor" href="#${escapedText}">
        <span class="link blue">#</span>
      </a>
      ${text}
    </h${level}>`;
    },
  },
};

const { json, pages } = await load();

const appInfo = {
  version: pkg.version,
  downloadURL: `${json.config.links.github}/releases/download/v${pkg.version}/Playa-${pkg.version}-mac.zip`,
};

const posts = pages
  .filter((x) => x.slug.startsWith("blog") && x.published)
  .sort((a, b) => (a.date > b.date ? -1 : 1))
  .map((x) => ({
    ...x,
    excerpt: cheerio.load(marked(x.content))("p").eq(0).text(),
  }));

try {
  await render({
    domain:
      process.env.NODE_ENV === "development"
        ? "http://localhost:9000"
        : pkg.homepage,
    logLevel: "verbose",
    pages: [
      {
        title: "Home",
        slug: "index",
        template: "pages/index",
        description: json.labels.home.description,
        sitemap: {
          priority: 1,
        },
      },
      {
        title: "Blog",
        slug: "blog",
        template: "pages/blog/index",
        description: json.labels.blog.description,
        sitemap: {
          changefreq: "weekly",
          priority: 0.8,
        },
      },
      ...pages.filter((x) => x.published && !x.slug.startsWith("blog")),
      ...posts,
    ],
    locals: {
      ...json,
      appInfo,
      pages,
      posts,
      latestPosts: posts.slice(0, 5),
    },
    handlebars: {
      helpers,
    },
    markdown,
    sitemap: {
      generate: true,
    },
  });
} catch (error) {
  console.log("Error generating site", error);
}
