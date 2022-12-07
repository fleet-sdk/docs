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
    editLink: {
      pattern: "https://github.com/fleet-sdk/docs/edit/master/docs/:path",
      text: "Edit this page on GitHub",
    },
    socialLinks: [{ icon: "github", link: "https://github.com/fleet-sdk" }],
    sidebar: {
      "/guide/": sidebarGuide(),
    },
  },
});

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
