import React from "react";
import { format } from "date-fns";
import { createAsset } from "use-asset";
import styles from "./styles.module.scss";

const asset = createAsset(async () => {
  const res = await fetch(`api/quote.json`);
  return await res.json();
});

export default function Section() {
  const { results } = asset.read();

  return (
    <section className={styles.Section}>
      <h2>Quote</h2>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </section>
  );
}
