# Money Exchange

A TWD exchange calculator comparing direct TWD-to-THB exchange, a SuperRich USD cash route, and a Dime! USD transfer route.

This website includes a small Node.js server. Run `npm start`, then open `http://localhost:4173`.

Whenever the page opens—or when **Refresh rates** is pressed—the server retrieves Mega Bank's USD spot selling rate and SuperRich Thailand's USD 100-denomination and TWD buying rates from their official websites. Last-known values are used only if either source is temporarily unavailable. The two-step route rounds the purchased USD down to the nearest 100 USD before calculating the withdrawal fee and final THB result.

The Dime! route also rounds USD down to the nearest 100 and uses the manually entered Dime! FCD USD exchange rate. It deducts a 9.46 USD Mega Bank transfer fee, a Dime! fee of 9 USD below 4,000 USD or 16 USD from 4,000 USD plus an additional 15 USD, and a 500 THB FCD receiving fee.
Its THB and percentage difference are compared with the option 2 SuperRich USD route.
