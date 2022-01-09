import fetch from "isomorphic-fetch";
import { Subject, from } from "rxjs";
import { mergeMap, tap } from "rxjs/operators";
import { quote, requests } from "@dev/api";
import { parseQuote } from "./utils";

require("dotenv").config();

const { QUOTES_URL } = process.env as {
  QUOTES_URL: string;
};

const timeout =
  (timeout = Math.random() * 3000) =>
  (data: any) =>
    new Promise((resolve) => setTimeout(() => resolve(data), timeout));

const timestamp = (mktime: number, period = 1000 * 60) =>
  mktime - (mktime % period);

export default function () {
  const summary = <Record<string, string[]>>{
    created: [],
    skipped: [],
  };

  const request = ({ interval }) => {
    const time = Date.now();
    const id = timestamp(time);
    const request = () =>
      fetch(
        `${QUOTES_URL}currencies-ticker?interval=${interval}&quote-currency=PLN&symbols=BTC,SOL`
      );

    return requests
      .findOne({ id })
      .then((data: any) =>
        data
          ? Promise.resolve(data)
          : request()
              .then((response: any) => {
                console.log(["request"], id);
                if (response.status >= 400) {
                  throw new Error("Bad response from server");
                }
                return response.json();
              })
              .then((json: any) =>
                requests.insert({ id, json: JSON.stringify(json) })
              )
              .then(timeout())
      )
      .then(({ json }: any) => JSON.parse(json));
  };

  const quote$ = new Subject<{
    interval: string;
  }>();

  quote$
    .pipe(
      mergeMap((data) => from(request(data)).pipe(tap(console.log)), 1),
      mergeMap(({ items }) => items.map(parseQuote)),
      mergeMap((item: { id: string }) =>
        from(
          quote
            .findOne({ id: item.id })
            .then(
              (exists: any) =>
                summary[exists ? "skipped" : "created"].push(item.id) &&
                (exists ? exists : quote.insert(item))
            )
        )
      )
    )
    .subscribe({
      next: (item: any) => {
        console.log(item);
      },
      complete: () => {
        console.log(summary);
      },
    });

  from([
    {
      interval: "1d",
    },
  ]).subscribe((data) => {
    console.log({ data });
    quote$.next(data);
    quote$.complete();
  });
}
