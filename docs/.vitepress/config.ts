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
      text: "v0.1.0-alpha",
      items: [
        {
          text: "Changelog",
          link: "https://github.com/fleet-sdk/fleet/blob/master/CHANGELOG.md"
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
        { text: "Token burning", link: "/token-burning" }
      ]
    }
    // {
    //   text: "Advanced Usage",
    //   collapsible: false,
    //   items: [
    //     { text: "Tweaking the Input Selector", link: "" },
    //     { text: "Working with Constants", link: "" }
    //   ]
    // },
    // {
    //   text: "Built-in Plugins",
    //   collapsible: false,
    //   items: [
    //     { text: "Babel Fees", link: "" },
    //     { text: "Sigma USD", link: "" },
    //     { text: "SigmaFi", link: "" }
    //   ]
    // },
    // {
    //   text: "Plugin Authoring",
    //   collapsible: false,
    //   items: [
    //     { text: "Getting Started", link: "" },
    //     { text: "API specifications", link: "" },
    //     { text: "Examples", link: "" }
    //   ]
    // }
  ];
}
