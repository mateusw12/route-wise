"use client";

import { GeocodingService } from "@/libs/services/geocoding.service";
import type { GeocodingResultDto } from "@/libs/dtos/geocoding.dto";
import { useEffect, useMemo, useState } from "react";

type SearchBoxProps = {
  onSelect: (field: "start" | "end", location: GeocodingResultDto) => void;
};

function useDebouncedValue(value: string, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function SearchBox({ onSelect }: SearchBoxProps) {
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [activeField, setActiveField] = useState<"start" | "end">("start");
  const [results, setResults] = useState<GeocodingResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentQuery = useMemo(
    () => (activeField === "start" ? startQuery : endQuery),
    [activeField, startQuery, endQuery],
  );

  const debouncedQuery = useDebouncedValue(currentQuery, 450);

  useEffect(() => {
    let active = true;

    async function run() {
      if (debouncedQuery.trim().length < 3) {
        setResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const data = await GeocodingService.search({
          query: debouncedQuery,
          limit: 5,
        });

        if (active) {
          setResults(data);
        }
      } catch {
        if (active) {
          setResults([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  function selectResult(item: GeocodingResultDto) {
    onSelect(activeField, item);
    setResults([]);

    if (activeField === "start") {
      setStartQuery(item.displayName);
    } else {
      setEndQuery(item.displayName);
    }
  }

  return (
    <div className="search-panel">
      <h1 className="search-title">RouteWise</h1>
      <p className="search-subtitle">Busque origem e destino para tracar a rota.</p>

      <label className="search-label" htmlFor="start-input">
        Origem
      </label>
      <input
        id="start-input"
        className="search-input"
        placeholder="Ex: Rua XV de Novembro"
        value={startQuery}
        onFocus={() => setActiveField("start")}
        onChange={(event) => setStartQuery(event.target.value)}
      />

      <label className="search-label" htmlFor="end-input">
        Destino
      </label>
      <input
        id="end-input"
        className="search-input"
        placeholder="Ex: Aeroporto de Joinville"
        value={endQuery}
        onFocus={() => setActiveField("end")}
        onChange={(event) => setEndQuery(event.target.value)}
      />

      {isLoading && <p className="search-hint">Buscando...</p>}

      {!isLoading && results.length > 0 && (
        <ul className="search-results">
          {results.map((item) => (
            <li key={item.placeId}>
              <button
                type="button"
                className="search-result-item"
                onClick={() => selectResult(item)}
              >
                {item.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && currentQuery.trim().length >= 3 && results.length === 0 && (
        <p className="search-hint">Nenhum resultado encontrado.</p>
      )}
    </div>
  );
}
