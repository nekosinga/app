'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, type IChartApi } from 'lightweight-charts';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface TokenChartProps {
  data: CandleData[];
  symbol: string;
}

export default function TokenChart({ data, symbol }: TokenChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data?.length) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8888aa',
      },
      grid: {
        vertLines: { color: '#2a2a3a' },
        horzLines: { color: '#2a2a3a' },
      },
      crosshair: {
        vertLine: { color: '#7c3aed', labelBackgroundColor: '#7c3aed' },
        horzLine: { color: '#7c3aed', labelBackgroundColor: '#7c3aed' },
      },
      rightPriceScale: { borderColor: '#2a2a3a' },
      timeScale: { borderColor: '#2a2a3a', timeVisible: true },
      width: containerRef.current.clientWidth,
      height: 320,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    candleSeries.setData(data);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [data]);

  if (!data?.length) {
    return (
      <div
        className="flex items-center justify-center h-80 rounded-xl text-sm"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
      >
        No chart data for {symbol}
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="px-4 pt-4 pb-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
        {symbol.toUpperCase()} / USD
      </div>
      <div ref={containerRef} />
    </div>
  );
}
