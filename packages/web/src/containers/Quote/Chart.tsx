import React, { useCallback, useState } from "react";
import {
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import palettes from "nice-color-palettes";
import styles from "./Chart.module.scss";

const colors = palettes[16];

export default function Chart({ data }) {
  const { labels, values } = data;

  const [{ left, right, refAreaLeft, refAreaRight, top, bottom }, setState] =
    useState(() => ({
      left: "dataMin",
      right: "dataMax",
      refAreaLeft: "",
      refAreaRight: "",
      top: "dataMax+1",
      bottom: "dataMin-1",
      animation: true,
    }));

  const zoom = useCallback(() => {
    if (refAreaLeft === refAreaRight || refAreaRight === "") {
      setState((state) => ({
        ...state,
        refAreaLeft: "",
        refAreaRight: "",
      }));
      return;
    }

    // xAxis domain
    const [left, right] =
      refAreaLeft > refAreaRight
        ? [refAreaRight, refAreaLeft]
        : [refAreaLeft, refAreaRight];

    setState((state) => ({
      ...state,
      refAreaLeft: "",
      refAreaRight: "",
      left,
      right,
    }));
  }, [refAreaLeft, refAreaRight]);

  const zoomOut = useCallback(() => {
    setState((state) => ({
      ...state,
      refAreaLeft: "",
      refAreaRight: "",
      left: "dataMin",
      right: "dataMax",
      top: "dataMax+1",
      bottom: "dataMin",
    }));
  }, []);

  return (
    <div className={styles.Chart} style={{ userSelect: "none", width: "100%" }}>
      <button className={styles.Button} type="button" onClick={zoomOut}>
        Zoom Out
      </button>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          width={800}
          height={400}
          data={values}
          onMouseDown={(e) =>
            setState((state) => ({ ...state, refAreaLeft: e.activeLabel }))
          }
          onMouseMove={(e) =>
            refAreaLeft &&
            setState((state) => ({ ...state, refAreaRight: e.activeLabel }))
          }
          onMouseUp={zoom}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            allowDataOverflow
            dataKey="x"
            domain={[left, right]}
            type="number"
            tickFormatter={(date) => format(date, "yyyy-MM-dd")}
          />
          {labels.length === 1 &&
            labels.map((symbol) => (
              <YAxis
                key={symbol}
                allowDataOverflow
                domain={[bottom, top]}
                type="number"
                yAxisId={symbol}
              />
            ))}
          <Tooltip
            labelFormatter={(date) => format(date, "yyyy-MM-dd")}
            formatter={(price, label) => [`${label}: ${price}`]}
          />
          <Legend />
          {labels.map((symbol, i) => (
            <Line
              key={symbol}
              yAxisId={symbol}
              type="natural"
              dataKey={symbol}
              stroke={colors[i]}
              animationDuration={300}
            />
          ))}
          {refAreaLeft && refAreaRight ? (
            <ReferenceArea
              yAxisId="1"
              x1={refAreaLeft}
              x2={refAreaRight}
              strokeOpacity={0.3}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
