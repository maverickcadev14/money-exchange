# Money Exchange

A TWD exchange calculator comparing direct TWD-to-THB exchange, a SuperRich USD cash route, and a Dime! USD transfer route.

This is a fully static website. Open `index.html` directly or publish the repository root with any static host.

The calculator uses a fixed rate snapshot from 2026-09-22: Mega Bank USD spot selling at 31.7400 TWD, SuperRich USD 100-denomination buying at 33.21 THB, and SuperRich TWD buying at 1.020 THB. The two-step route rounds the purchased USD down to the nearest 100 USD before calculating the withdrawal fee and final THB result.

The Dime! route also rounds USD down to the nearest 100 and uses the manually entered Dime! FCD USD exchange rate. It deducts a 9.46 USD Mega Bank transfer fee, a Dime! fee of 9 USD below 4,000 USD or 16 USD from 4,000 USD plus an additional 15 USD, and a 500 THB FCD receiving fee.
Its THB and percentage difference are compared with the option 2 SuperRich USD route.
