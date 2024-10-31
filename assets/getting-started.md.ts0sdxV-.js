import{_ as a,c as i,a2 as t,o as e}from"./chunks/framework.B2aOKxcB.js";const c=JSON.parse('{"title":"Getting Started","description":"","frontmatter":{},"headers":[],"relativePath":"getting-started.md","filePath":"getting-started.md","lastUpdated":1720530119000}'),n={name:"getting-started.md"};function l(p,s,h,r,o,d){return e(),i("div",null,s[0]||(s[0]=[t(`<h1 id="getting-started" tabindex="-1">Getting Started <a class="header-anchor" href="#getting-started" aria-label="Permalink to &quot;Getting Started&quot;">​</a></h1><p>Fleet SDK is an easy-to-use, modular, and extensible off-chain SDK (Software Development Kit) for the <a href="https://ergoplatform.org/en/" target="_blank" rel="noreferrer">Ergo Platform</a>, written entirely in TypeScript.</p><h2 id="step-1-install" tabindex="-1">Step. 1: Install <a class="header-anchor" href="#step-1-install" aria-label="Permalink to &quot;Step. 1: Install&quot;">​</a></h2><p>Add Fleet SDK as a dependency for the project.</p><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group-MxMO2" id="tab-XnMa8yJ" checked><label data-title="NPM" for="tab-XnMa8yJ">NPM</label><input type="radio" name="group-MxMO2" id="tab-nbkVbJo"><label data-title="Yarn" for="tab-nbkVbJo">Yarn</label><input type="radio" name="group-MxMO2" id="tab-vIniN0V"><label data-title="pnpm" for="tab-vIniN0V">pnpm</label></div><div class="blocks"><div class="language-bash vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> i</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @fleet-sdk/core</span></span></code></pre></div><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @fleet-sdk/core</span></span></code></pre></div><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pnpm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @fleet-sdk/core</span></span></code></pre></div></div></div><h2 id="step-2-import-modules" tabindex="-1">Step. 2: Import modules <a class="header-anchor" href="#step-2-import-modules" aria-label="Permalink to &quot;Step. 2: Import modules&quot;">​</a></h2><p>Next, you need to import the necessary components for your use case.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { TransactionBuilder, OutputBuilder } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;@fleet-sdk/core&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span></code></pre></div><h2 id="step-3-use-it" tabindex="-1">Step. 3: Use it! <a class="header-anchor" href="#step-3-use-it" aria-label="Permalink to &quot;Step. 3: Use it!&quot;">​</a></h2><p>You are ready to write awesome off-chain code!</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> unsignedTransaction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> TransactionBuilder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(creationHeight)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">from</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(inputs) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// add inputs</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">to</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // add outputs</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OutputBuilder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      1000000</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">n</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  )</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sendChangeTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(changeAddress) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// set change address</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">payMinFee</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// set fee</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">build</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// build!</span></span></code></pre></div><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>If you do not know where <code>inputs</code> and <code>creationHeight</code> variables come from, please take a look at the <a href="/docs/wallet-interaction">Wallet Interaction</a> page.</p></div><h2 id="next-steps" tabindex="-1">Next steps <a class="header-anchor" href="#next-steps" aria-label="Permalink to &quot;Next steps&quot;">​</a></h2><p>Follow along with the rest of this guide for an in-depth exploration of all Fleet packages. Or, if you prefer to get just what you need to start coding, pick the topic of your preference on the side panel.</p><p>If you are not yet familiar with Ergo transactions, you may want to look at the excellent &quot;<a href="https://docs.ergoplatform.com/dev/data-model/box/" target="_blank" rel="noreferrer">Anatomy of Ergo</a>&quot; section on Ergo Docs.</p>`,15)]))}const g=a(n,[["render",l]]);export{c as __pageData,g as default};
