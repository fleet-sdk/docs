import { DefaultTheme, defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "Fleet SDK",
  description: "Fluent Ergo Toolset",
  base: "/docs/",

  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    search: {
      provider: "local"
    },
    outline: [2, 3],
    editLink: {
      pattern: "https://github.com/fleet-sdk/docs/edit/master/docs/:path",
      text: "Edit this page on GitHub"
    },
    nav: nav(),
    socialLinks: [{ icon: "github", link: "https://github.com/fleet-sdk" }],
    sidebar: {
      "/": sidebarGuide()
    },
    footer: {
      message: "Released under the MIT License."
    }
  }
});

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: "Contributing",
      items: [
        {
          text: "Fleet SDK",
          link: "https://github.com/fleet-sdk/fleet/blob/master/CONTRIBUTING.md"
        },
        {
          text: "Documentation",
          link: "https://github.com/fleet-sdk/docs/blob/master/.github/contributing.md"
        }
      ]
    }
  ];
}

function sidebarGuide() {
  return [
    {
      text: "Introduction",
      collapsible: false,
      items: [{ text: "Getting Started", link: "/getting-started" }]
    },
    {
      text: "Basic Usage",
      collapsible: false,
      items: [
        { text: "Wallet interaction", link: "/wallet-interaction" },
        { text: "Transaction building", link: "/transaction-building" },
        { text: "Token burning", link: "/token-burning" },
        { text: "Retrieve and Use Boxes", link: "/use-of-boxes" }
      ]
    }
  ];
}
