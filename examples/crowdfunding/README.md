# Crowdfunding example (Fleet SDK)

Multi-transaction example for the [tutorial chapter](../../docs/tutorial/examples/crowdfunding.md): a crowdfunding campaign box with raise-more, collect, and refund paths, executed against `@fleet-sdk/mock-chain`.

```bash
npm install
node crowdfunding.mjs       # happy path: create -> pledge -> collect
node crowdfunding.test.mjs  # six path checks (positive and negative)
```
