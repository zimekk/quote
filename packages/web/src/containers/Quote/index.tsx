import React, { useEffect, useMemo, useState } from "react";
import { Subject, from } from "rxjs";
import { debounceTime, mergeMap, tap } from "rxjs/operators";
import { createAsset } from "use-asset";
import Chart from "./Chart";
import Chart2 from "./Chart2";
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
        {logo_url && <img alt={symbol} src={logo_url} />}
        <span>{symbol}</span>
      </h3>
      <Chart list={rates} />
      <Chart2 list={rates} />
    </div>
  );
}

export default function Section() {
  const { results } = asset.read();
  const [rates, setRates] = useState(() => results);

  const search$ = useMemo(() => new Subject<any>(), []);

  useEffect(() => {
    const subscription = search$
      .pipe(
        mergeMap(() => {
          return from(
            fetch(`api/rates.json`)
              .then((res) => res.json())
              .then(({ data }) => {
                const legal = "USDT";
                const result = data.reduce(
                  (result, { rates, token }) =>
                    Object.assign(result, {
                      [token]: ((price_timestamp, symbol) => ({
                        id: `${symbol}@${price_timestamp}`,
                        price: rates[legal],
                        price_timestamp,
                        symbol,
                      }))(new Date().toISOString(), `${token}${legal}`),
                    }),
                  {}
                );
                setRates((rates) => rates.concat(result["ATOM"]));
              })
          );
        }),
        debounceTime(15 * 1000)
      )
      .subscribe((filters) => search$.next({}));
    return () => subscription.unsubscribe();
  }, [search$]);

  useEffect(() => {
    search$.next({});
  }, []);

  const list = useMemo(
    () =>
      rates.reduce(
        (result, item) =>
          Object.assign(result, {
            [item.symbol]: (result[item.symbol] || []).concat(item),
          }),
        {}
      ),
    [rates]
  );

  console.log({ list });

  return (
    <section className={styles.Section}>
      <h2>Quote</h2>
      {Object.entries(list).map(([symbol, rates]) => (
        <Rates key={symbol} symbol={symbol} rates={rates} />
      ))}
      <pre>{JSON.stringify(list["ATOMUSDT"], null, 2)}</pre>
    </section>
  );
}
