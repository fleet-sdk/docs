import{_ as a,c as i,a2 as e,o as t}from"./chunks/framework.B2aOKxcB.js";const k=JSON.parse('{"title":"Wallet Interaction","description":"","frontmatter":{},"headers":[],"relativePath":"wallet-interaction.md","filePath":"wallet-interaction.md","lastUpdated":1676921645000}'),n={name:"wallet-interaction.md"};function l(h,s,p,o,r,d){return t(),i("div",null,s[0]||(s[0]=[e(`<h1 id="wallet-interaction" tabindex="-1">Wallet Interaction <a class="header-anchor" href="#wallet-interaction" aria-label="Permalink to &quot;Wallet Interaction&quot;">​</a></h1><p>On the <a href="https://ergoplatform.org/" target="_blank" rel="noreferrer">Ergo Platform</a>, one of the most common ways to interact with wallets and the Ergo blockchain is through the dApp Connector protocol, also known as <a href="https://github.com/ergoplatform/eips/pull/23" target="_blank" rel="noreferrer">EIP-12</a>. It is the main wallet interaction protocol for browser extension wallets like <a href="https://github.com/capt-nemo429/nautilus-wallet" target="_blank" rel="noreferrer">Nautilus</a> or <a href="https://github.com/ThierryM1212/SAFEW" target="_blank" rel="noreferrer">SAFEW</a>.</p><h2 id="api-overview" tabindex="-1">API overview <a class="header-anchor" href="#api-overview" aria-label="Permalink to &quot;API overview&quot;">​</a></h2><p>The EIP-12 API is divided into two parts, the Connection and Context APIs. All methods defined in EIP-12 are promise-based asynchronous methods. This means that they return a <code>Promise</code>. As a result, calling any EIP-12 method requires either an <code>await</code> keyword or <code>Promise.then()</code> method to wait for them to finish.</p><h3 id="connection-api" tabindex="-1">Connection API <a class="header-anchor" href="#connection-api" aria-label="Permalink to &quot;Connection API&quot;">​</a></h3><p>The Connection API is responsible for all connection and wallet information related methods, such as access requesting and connection state checking.</p><p>EIP-12 compatible browser wallets on Ergo will automatically inject the <strong>Connection API</strong> into every active page so that any JavaScript context can interact with it directly through the <code>ergoConnector</code> object.</p><h4 id="multi-wallet-support" tabindex="-1">Multi-wallet support <a class="header-anchor" href="#multi-wallet-support" aria-label="Permalink to &quot;Multi-wallet support&quot;">​</a></h4><p>The Connection API is structured to allow support for multiple wallets. To connect to a wallet, you can use <code>ergoConnector.{walletName}.connect()</code> method, where <code>{walletName}</code> is the wallet of your choice.</p><h4 id="examples" tabindex="-1">Examples <a class="header-anchor" href="#examples" aria-label="Permalink to &quot;Examples&quot;">​</a></h4><p>Asking for Nautilus Wallet connection</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergoConnector.nautilus.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">connect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><p>Asking for SAFEW Wallet connection</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergoConnector.safew.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">connect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><p>Note that the API remains the same. Only the wallet name changes.</p><h3 id="context-api" tabindex="-1">Context API <a class="header-anchor" href="#context-api" aria-label="Permalink to &quot;Context API&quot;">​</a></h3><p>The Context API is responsible for wallet interactions, such as balance fetching, transaction signing, <em>et cetera</em>.</p><p>Once the connection request is accepted by the user, this API will be injected in the same way as the <a href="#connection-api">Connection API</a>, and you can interact with it through the <code>ergo</code> object.</p><h4 id="example" tabindex="-1">Example <a class="header-anchor" href="#example" aria-label="Permalink to &quot;Example&quot;">​</a></h4><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get_balance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><h2 id="interacting-with-a-wallet" tabindex="-1">Interacting with a wallet <a class="header-anchor" href="#interacting-with-a-wallet" aria-label="Permalink to &quot;Interacting with a wallet&quot;">​</a></h2><h3 id="step-1-check-for-a-wallet" tabindex="-1">Step. 1: Check for a wallet <a class="header-anchor" href="#step-1-check-for-a-wallet" aria-label="Permalink to &quot;Step. 1: Check for a wallet&quot;">​</a></h3><p>To check if the user has an EIP-12 wallet installed and running, check for the presence of the <code>ergoConnector</code> object and then for the desired wallet.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark has-focused-lines vp-code" tabindex="0"><code><span class="line has-focus"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (ergoConnector) { </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// check if Connection API is injected</span></span>
<span class="line"></span>
<span class="line has-focus"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (ergoConnector.nautilus) { </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// check if Nautilus Wallet is available</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Nautilus Wallet is ready to use&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Nautilus Wallet is not active&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;No wallet available&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="info custom-block"><p class="custom-block-title">INFO</p><p>For the sake of simplicity, the Nautilus Wallet will be used for all examples. But this guide is suitable for any other EIP-12 compatible wallet. Please, refer to the <a href="#connection-api">Connection API topic</a> for more information.</p></div><h3 id="step-2-request-access" tabindex="-1">Step. 2: Request access <a class="header-anchor" href="#step-2-request-access" aria-label="Permalink to &quot;Step. 2: Request access&quot;">​</a></h3><p>To interact with the user&#39;s wallet, you need to request wallet access.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark has-focused-lines vp-code" tabindex="0"><code><span class="line has-focus"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> connected</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergoConnector.nautilus.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">connect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(); </span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (connected) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Connected!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Not connected!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>When you call <code>ergoConnector.nautilus.connect()</code> for the first time a wallet window will pop-up asking the user to allow access to the selected wallet. If the user rejects the prompt, it will return <code>false</code> otherwise, it will return <code>true</code> and inject the <a href="#context-api">Context API</a>, which will make the <code>ergo</code> object available for direct use.</p><h3 id="step-3-get-balance" tabindex="-1">Step. 3: Get balance <a class="header-anchor" href="#step-3-get-balance" aria-label="Permalink to &quot;Step. 3: Get balance&quot;">​</a></h3><p>Now that you have access to the <a href="#context-api">Context API</a> you can interact with the connected wallet.</p><p>Let&#39;s start by getting the wallet&#39;s balance. For that, use the <code>ergo.get_balance()</code> method.</p><h4 id="get-erg-balance" tabindex="-1">Get ERG balance <a class="header-anchor" href="#get-erg-balance" aria-label="Permalink to &quot;Get ERG balance&quot;">​</a></h4><p>The following code will return a <code>string</code> with the total of <code>NanoErgs</code> owned by the connected wallet.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get_balance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ERG&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><h4 id="get-balance-by-token-id" tabindex="-1">Get balance by Token ID <a class="header-anchor" href="#get-balance-by-token-id" aria-label="Permalink to &quot;Get balance by Token ID&quot;">​</a></h4><p>Given a <code>Token ID</code>, the following code will return a <code>string</code> with the total of token units owned by the connected wallet.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get_balance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><h4 id="get-balance-for-all-assets" tabindex="-1">Get balance for all assets <a class="header-anchor" href="#get-balance-for-all-assets" aria-label="Permalink to &quot;Get balance for all assets&quot;">​</a></h4><p>The following code will return an <code>array</code> with the balance of all assets owned by the connected wallet.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get_balance</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;all&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p>The returned array is structured as follows:</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[{ tokenId: string, balance: string }];</span></span></code></pre></div><h3 id="step-4-get-addresses" tabindex="-1">Step. 4: Get addresses <a class="header-anchor" href="#step-4-get-addresses" aria-label="Permalink to &quot;Step. 4: Get addresses&quot;">​</a></h3><p>There are three methods to get user addresses:</p><h4 id="get-the-change-default-address" tabindex="-1">Get the change/default address <a class="header-anchor" href="#get-the-change-default-address" aria-label="Permalink to &quot;Get the change/default address&quot;">​</a></h4><p>The following code will return a <code>string</code> containing the wallet&#39;s default change address.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get_change_address</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><h4 id="get-unused-addresses" tabindex="-1">Get unused addresses <a class="header-anchor" href="#get-unused-addresses" aria-label="Permalink to &quot;Get unused addresses&quot;">​</a></h4><p>The following code will return an <code>array</code> of strings containing all wallet&#39;s unused addresses. By unused, read addresses that never sent or received any transaction.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get_unused_addresses</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><h4 id="get-used-addresses" tabindex="-1">Get used addresses <a class="header-anchor" href="#get-used-addresses" aria-label="Permalink to &quot;Get used addresses&quot;">​</a></h4><p>The following code will return an <code>array</code> of strings containing all the wallet&#39;s used addresses.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get_used_addresses</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><h3 id="step-5-fetch-boxes" tabindex="-1">Step. 5: Fetch boxes <a class="header-anchor" href="#step-5-fetch-boxes" aria-label="Permalink to &quot;Step. 5: Fetch boxes&quot;">​</a></h3><p>Boxes are UTxOs on steroids, they play a crucial role in the Ergo blockchain by holding assets and data protected by a contract.</p><p>You can use the <code>ergo.get_utxos()</code> method to fetch unspent boxes owned by the selected wallet.</p><h4 id="get-all-unspent-boxes" tabindex="-1">Get all unspent boxes <a class="header-anchor" href="#get-all-unspent-boxes" aria-label="Permalink to &quot;Get all unspent boxes&quot;">​</a></h4><p>The following code will return an array of all unspent boxes owned by the selected wallet.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get_utxos</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><h4 id="filter-unspent-boxes" tabindex="-1">Filter unspent boxes <a class="header-anchor" href="#filter-unspent-boxes" aria-label="Permalink to &quot;Filter unspent boxes&quot;">​</a></h4><p>Unspent boxes can be also filtered by specific assets.</p><h5 id="example-fetching-all-unspent-boxes-containing-sigusd-tokens" tabindex="-1">Example: Fetching all unspent boxes containing SigUSD tokens <a class="header-anchor" href="#example-fetching-all-unspent-boxes-containing-sigusd-tokens" aria-label="Permalink to &quot;Example: Fetching all unspent boxes containing SigUSD tokens&quot;">​</a></h5><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get_utxos</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  tokens: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      tokenId:</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div><p>If needed, a target amount can be specified, so that the wallet will only return unspent boxes until the target is met.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark has-focused-lines vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get_utxos</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  tokens: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      tokenId:</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line has-focus"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      amount: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;100&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>Note that the <code>tokens</code> field is an <code>array</code>, which means you can filter by various tokens in the same call.</p></div><h3 id="step-6-get-the-current-height" tabindex="-1">Step. 6: Get the current height <a class="header-anchor" href="#step-6-get-the-current-height" aria-label="Permalink to &quot;Step. 6: Get the current height&quot;">​</a></h3><p>The current height stands for the latest block number included in the blockchain. This is necessary for transaction building.</p><p>You can make use of <code>ergo.get_current_height()</code> to get it.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get_current_height</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><h3 id="step-7-sign-a-transaction" tabindex="-1">Step. 7: Sign a transaction <a class="header-anchor" href="#step-7-sign-a-transaction" aria-label="Permalink to &quot;Step. 7: Sign a transaction&quot;">​</a></h3><p>The next step after building a transaction is signing it, for that you can call <code>ergo.sign_tx()</code> to ask the user to sign a previously built transaction.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark has-focused-lines vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> unsignedTransaction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> TransactionBuilder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(creationHeight)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">from</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(inputs)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">to</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OutputBuilder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000000</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">n</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, recipientAddress))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sendChangeTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(changeAddress)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">payMinFee</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">build</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toPlainObject</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line has-focus"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> signedTransaction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sign_tx</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(unsignedTransaction); </span></span></code></pre></div><p>When <code>ergo.sign_tx()</code> is called a pop-up window will be displayed to the user asking to review and sign the transaction. If the user signs it successfully, then it will return a signed transaction <code>object</code> that can be submitted to the blockchain otherwise, it will throw an exception.</p><h3 id="step-8-submit-a-transaction" tabindex="-1">Step. 8: Submit a transaction <a class="header-anchor" href="#step-8-submit-a-transaction" aria-label="Permalink to &quot;Step. 8: Submit a transaction&quot;">​</a></h3><p>Now you have a signed transaction you can submit it to the blockchain using the <code>ergo.submit_tx()</code> method.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> transactionId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ergo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">submit_tx</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(signedTransaction);</span></span></code></pre></div><p>If the transaction is successfully accepted by the mempool, a <code>string</code> containing the <code>Transaction ID</code> will be returned otherwise, it will throw an exception.</p>`,79)]))}const g=a(n,[["render",l]]);export{k as __pageData,g as default};
