"use client";

import { GeocodingService } from "@/libs/services/geocoding.service";
import type { GeocodingResultDto } from "@/libs/dtos/geocoding.dto";
import { useEffect, useMemo, useState } from "react";
import {
  MdAddCircleOutline,
  MdDeleteOutline,
  MdExpandLess,
  MdExpandMore,
  MdOutlinePlace,
  MdOutlineRoute,
  MdOutlineTravelExplore,
} from "react-icons/md";

export type SearchTarget =
  | { type: "start" }
  | { type: "end" }
  | { type: "waypoint"; index: number };

type SearchBoxProps = {
  waypointCount: number;
  onSelect: (target: SearchTarget, location: GeocodingResultDto) => void;
  onAddWaypoint: () => void;
  onRemoveWaypoint: (index: number) => void;
  onBuildRoute: () => void;
  onClearRoute: () => void;
  onToggleMarkerMode: () => void;
  markerModeEnabled: boolean;
  isRouting: boolean;
};

function useDebouncedValue(value: string, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function SearchBox({
  waypointCount,
  onSelect,
  onAddWaypoint,
  onRemoveWaypoint,
  onBuildRoute,
  onClearRoute,
  onToggleMarkerMode,
  markerModeEnabled,
  isRouting,
}: SearchBoxProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [waypointQueries, setWaypointQueries] = useState<Record<number, string>>({});
  const [activeField, setActiveField] = useState<SearchTarget>({ type: "start" });
  const [results, setResults] = useState<GeocodingResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const waypointInputIndexes = useMemo(
    () => Array.from({ length: waypointCount }, (_, index) => index),
    [waypointCount],
  );

  function setQueryByTarget(target: SearchTarget, value: string) {
    if (target.type === "start") {
      setStartQuery(value);
      return;
    }

    if (target.type === "end") {
      setEndQuery(value);
      return;
    }

    setWaypointQueries((current) => {
      const next = { ...current };
      next[target.index] = value;
      return next;
    });
  }

  const currentQuery =
    activeField.type === "start"
      ? startQuery
      : activeField.type === "end"
        ? endQuery
        : waypointQueries[activeField.index] ?? "";

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
    setQueryByTarget(activeField, item.displayName);
  }

  return (
    <div className={`search-panel ${isCollapsed ? "is-collapsed" : ""}`}>
      <div className="search-panel-head">
        <div>
          <h1 className="search-title">RouteWise</h1>
          <p className="search-subtitle">Busque origem e destino para tracar a rota.</p>
        </div>
        <button
          type="button"
          className="search-collapse-btn"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expandir painel de busca" : "Minimizar painel de busca"}
          onClick={() => setIsCollapsed((current) => !current)}
        >
          {isCollapsed ? (
            <MdExpandMore className="btn-icon" aria-hidden="true" />
          ) : (
            <MdExpandLess className="btn-icon" aria-hidden="true" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="search-panel-body">

          <label className="search-label" htmlFor="start-input">
            Origem
          </label>
          <input
            id="start-input"
            className="search-input"
            placeholder="Ex: Rua XV de Novembro"
            value={startQuery}
            onFocus={() => setActiveField({ type: "start" })}
            onChange={(event) => setStartQuery(event.target.value)}
          />

          {waypointInputIndexes.map((index) => (
            <div key={`waypoint-${index}`} className="waypoint-row">
              <div className="waypoint-head">
                <label className="search-label" htmlFor={`waypoint-input-${index}`}>
                  Parada {index + 1}
                </label>
                <button
                  type="button"
                  className="search-chip chip-danger"
                  onClick={() => onRemoveWaypoint(index)}
                >
                  <MdDeleteOutline className="btn-icon" aria-hidden="true" />
                  Remover
                </button>
              </div>

              <input
                id={`waypoint-input-${index}`}
                className="search-input"
                placeholder="Ex: Posto de parada"
                value={waypointQueries[index] ?? ""}
                onFocus={() => setActiveField({ type: "waypoint", index })}
                onChange={(event) =>
                  setQueryByTarget({ type: "waypoint", index }, event.target.value)
                }
              />
            </div>
          ))}

          <button type="button" className="search-chip search-chip-add" onClick={onAddWaypoint}>
            <MdAddCircleOutline className="btn-icon" aria-hidden="true" />
            + Adicionar parada
          </button>

          <label className="search-label" htmlFor="end-input">
            Destino
          </label>
          <input
            id="end-input"
            className="search-input"
            placeholder="Ex: Aeroporto de Joinville"
            value={endQuery}
            onFocus={() => setActiveField({ type: "end" })}
            onChange={(event) => setEndQuery(event.target.value)}
          />

          <button type="button" className="route-btn route-btn-search" onClick={onBuildRoute} disabled={isRouting}>
            <MdOutlineTravelExplore className="btn-icon" aria-hidden="true" />
            {isRouting ? "Calculando..." : "Tracar rota"}
          </button>

          <div className="search-actions-row">
            <button type="button" className="route-btn route-btn-secondary route-btn-danger" onClick={onClearRoute}>
              <MdDeleteOutline className="btn-icon" aria-hidden="true" />
              Limpar rota
            </button>
            <button
              type="button"
              className={`route-btn route-btn-secondary route-btn-marker ${markerModeEnabled ? "is-active" : ""}`}
              onClick={onToggleMarkerMode}
            >
              {markerModeEnabled ? (
                <MdOutlinePlace className="btn-icon" aria-hidden="true" />
              ) : (
                <MdOutlineRoute className="btn-icon" aria-hidden="true" />
              )}
              {markerModeEnabled ? "Desativar marcacao" : "Ativar marcacao"}
            </button>
          </div>

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
      )}
    </div>
  );
}
