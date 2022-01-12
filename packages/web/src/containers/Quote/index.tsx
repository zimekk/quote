import React, { useMemo } from "react";
import { createAsset } from "use-asset";
import Chart from "./Chart";
import styles from "./styles.module.scss";

const asset = createAsset(async () => {
  const res = await fetch(`api/quote.json`);
  return await res.json();
});

function Rates({ symbol, rates }) {
  const [{ logo_url }] = rates;

  return (
    <div>
      <h3>
        <img alt={symbol} src={logo_url} />
        <span>{symbol}</span>
      </h3>
      <Chart list={rates} />
    </div>
  );
}

export default function Section() {
  const { results } = asset.read();

  const list = useMemo(
    () =>
      results.reduce(
        (result, item) =>
          Object.assign(result, {
            [item.symbol]: (result[item.symbol] || []).concat(item),
          }),
        {}
      ),
    [results]
  );

  console.log({ list });

  return (
    <section className={styles.Section}>
      <h2>Quote</h2>
      {Object.entries(list).map(([symbol, rates]) => (
        <Rates key={symbol} symbol={symbol} rates={rates} />
      ))}
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </section>
  );
}
