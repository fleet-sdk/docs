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
    socialLinks: [
      { icon: "github", link: "https://github.com/fleet-sdk/fleet" },
    ],

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
      items: [
        { text: "What is Fleet?", link: "/guide/what-is-fleet" },
        { text: "Getting Started", link: "/guide/getting-started" },
      ],
    },
    {
      text: "Basic Usage",
      collapsible: true,
      items: [
        {
          text: "Wallet interaction",
          link: "",
          items: [{ text: "dApp Connector", link: "" }],
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
