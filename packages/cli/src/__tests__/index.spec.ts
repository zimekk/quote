import { parseQuote } from "../utils";

describe("cli", () => {
  it("parseQuote", () =>
    [
      {
        item: {
          id: "BTC",
          currency: "BTC",
          symbol: "BTC",
          name: "Bitcoin",
          logo_url:
            "https://s3.us-east-2.amazonaws.com/nomics-api/static/images/currencies/btc.svg",
          status: "active",
          price: "164546.53915453",
          price_date: "2022-01-10T00:00:00Z",
          price_timestamp: "2022-01-10T16:08:00Z",
          circulating_supply: "18925150",
          max_supply: "21000000",
          market_cap: "3114067935480",
          market_cap_dominance: "0.3902",
          num_exchanges: "408",
          num_pairs: "83763",
          num_pairs_unmapped: "6360",
          first_candle: "2011-08-18T00:00:00Z",
          first_trade: "2011-08-18T00:00:00Z",
          first_order_book: "2017-01-06T00:00:00Z",
          rank: "1",
          rank_delta: "0",
          high: "268794.52060465",
          high_timestamp: "2021-11-08T00:00:00Z",
          "1d": {
            volume: "133583404855.16",
            price_change: "-4460.69737297",
            price_change_pct: "-0.0264",
            volume_change: "12427573672.64",
            volume_change_pct: "0.1026",
            market_cap_change: "-84268274418.55",
            market_cap_change_pct: "-0.0263",
          },
        },
        result: "BTC@2022-01-10T16:08:00Z",
      },
    ].forEach(({ item, result }) =>
      expect(parseQuote(item).id).toEqual(result)
    ));
});
