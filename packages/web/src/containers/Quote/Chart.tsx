import React, { useEffect, useMemo, useRef, useState } from "react";
import { axisBottom, axisLeft, select, scaleLinear, timeFormat } from "d3";
import { Subject, of } from "rxjs";
import { delay, switchMap } from "rxjs/operators";
import cx from "classnames";
import styles from "./Chart.module.scss";

const { width, height, left, right, top, bottom } = {
  width: 320,
  height: 200,
  left: 10,
  right: 10,
  top: 20,
  bottom: 20,
};

export default function Chart({ list }: { list: any[] }) {
  const [selected, setSelected] = useState<{
    top: number;
    left: number;
    label: string;
  } | null>(null);
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);
  const containerRef = useRef(null);

  const selected$ = useMemo(
    () => new Subject<{ left: number; top: number; label: string }>(),
    []
  );
  useEffect(() => {
    const subscription = selected$
      .pipe(
        switchMap((selected) => of(selected).pipe(delay(selected ? 0 : 800)))
      )
      .subscribe((selected) => setSelected(selected));

    return () => subscription.unsubscribe();
  }, [selected$]);

  useEffect(() => {
    const dataset = list.map((item) => [
      new Date(item.price_timestamp),
      item.price,
      item.id,
    ]);

    const xx = dataset.map(([x = 0]) => x);
    const yy = dataset.map(([, y = 0]) => y);

    const xDomain = [Math.min(...xx), Math.max(...xx)];
    const yDomain = [Math.min(...yy), Math.max(...yy)];

    const xScale = scaleLinear()
      .domain(xDomain)
      .range([left, width - right]);

    const yScale = scaleLinear()
      .domain(yDomain)
      .range([height - bottom, top]);

    const color = scaleLinear().domain(yDomain).range(["red", "blue"]);

    select(containerRef.current).selectAll("circle").remove();
    select(containerRef.current)
      .selectAll("circle")
      .data(dataset)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("cx", ([x = 0]) => xScale(x))
            .attr("cy", ([, y = 0]) => yScale(y))
            .attr("r", 0)
            .attr("fill", ([x = 0]) => color(x))
            .on("mouseover", (e, [, , label]) =>
              selected$.next({ left: e.layerX, top: e.layerY, label })
            )
            .on("mouseout", () => selected$.next(null))
            .call((enter) =>
              enter.transition().duration(200).attr("r", 2).style("opacity", 1)
            ),
        (update) => update.attr("fill", "lightgrey"),
        (exit) =>
          exit
            .attr("fill", "tomato")
            .call((exit) =>
              exit
                .transition()
                .duration(200)
                .attr("r", 0)
                .style("opacity", 0)
                .remove()
            )
      );

    const xAxis = axisBottom(xScale)
      .ticks(5)
      .tickSizeOuter(0)
      .tickFormat(timeFormat("%Y-%m-%d, %H:%M:%S"));
    select(xAxisRef.current).call(xAxis).style("font-size", "8px");

    const yAxis = axisLeft(yScale).ticks(5).tickSizeOuter(0);
    select(yAxisRef.current).call(yAxis).style("font-size", "8px");
  }, [list]);

  return (
    <div className={cx(styles.Chart)}>
      <svg
        ref={containerRef}
        width={width}
        height={height}
        viewBox={`0, 0, ${width}, ${height}`}
      >
        <g transform={`translate(0, ${height - bottom})`} ref={xAxisRef} />
        <g transform={`translate(${left}, 0)`} ref={yAxisRef} />
      </svg>
      {selected && (
        <div
          className={styles.Tooltip}
          style={{ top: selected.top, left: selected.left }}
        >
          {selected.label}
        </div>
      )}
    </div>
  );
}
