import { DefaultTheme, defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "Fleet SDK",
  description: "Fluent Ergo Toolset",
  base: "/docs/",

  lastUpdated: true,
  cleanUrls: "without-subfolders",

  head: [["meta", { name: "theme-color", content: "#3c8772" }]],

  themeConfig: {
    outline: [2, 3],
    editLink: {
      pattern: "https://github.com/fleet-sdk/docs/edit/master/docs/:path",
      text: "Edit this page on GitHub",
    },
    socialLinks: [{ icon: "github", link: "https://github.com/fleet-sdk" }],
    nav: nav(),
    sidebar: {
      "/guide/": sidebarGuide(),
    },
    footer: {
      message: "Released under the MIT License.",
    },
  },
});

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: "v0.1.0-alpha",
      items: [
        {
          text: "Changelog",
          link: "https://github.com/fleet-sdk/fleet/blob/master/CHANGELOG.md",
        },
      ],
    },
  ];
}

function sidebarGuide(): DefaultTheme.SidebarGroup[] {
  return [
    {
      text: "Introduction",
      collapsible: true,
      items: [{ text: "Getting Started", link: "/guide/getting-started" }],
    },
    {
      text: "Basic Usage",
      collapsible: true,
      items: [
        {
          text: "Wallet interaction",
          link: "/guide/wallet-interaction",
        },
        { text: "Transaction building", link: "" },
        { text: "Token minting", link: "" },
        { text: "Token burning", link: "" },
      ],
    },
    {
      text: "Built-in Plugins",
      collapsible: true,
      items: [
        { text: "Babel Fees", link: "" },
        { text: "Sigma USD", link: "" },
      ],
    },
    {
      text: "Plugin Development",
      collapsible: true,
      items: [
        { text: "Getting Started", link: "" },
        { text: "API specifications", link: "" },
        { text: "Lifecycle Hooks", link: "" },
        { text: "Examples", link: "" },
      ],
    },
  ];
}
