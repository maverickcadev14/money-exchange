# Money Exchange

A TWD exchange calculator comparing direct TWD-to-THB exchange, a SuperRich USD cash route, and a Dime! USD transfer route.

## Run locally

```bash
npm start
```

Open <http://localhost:4173>. The server retrieves the Mega Bank USD spot selling rate and the SuperRich USD 100-denomination and TWD buying rates. The two-step route rounds the purchased USD down to the nearest 100 USD before calculating the withdrawal fee and final THB result.

The Dime! route also rounds USD down to the nearest 100. Its USD-to-THB rate is calculated automatically as the SuperRich USD 100-denomination buying rate × 1.00061. It deducts a 9.46 USD Mega Bank transfer fee, a Dime! fee of 9 USD below 4,000 USD or 16 USD from 4,000 USD plus an additional 15 USD, and a 500 THB FCD receiving fee.
Its THB and percentage difference are compared with the option 2 SuperRich USD route.
