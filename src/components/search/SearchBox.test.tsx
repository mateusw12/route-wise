import { render, screen } from "@testing-library/react";
import { SearchBox } from "./SearchBox";

describe("SearchBox", () => {
  it("renders RouteWise title", () => {
    render(
      <SearchBox
        waypointCount={0}
        onSelect={() => {}}
        onAddWaypoint={() => {}}
        onRemoveWaypoint={() => {}}
        onBuildRoute={() => {}}
        onClearRoute={() => {}}
        onToggleMarkerMode={() => {}}
        markerModeEnabled={false}
        isRouting={false}
      />,
    );

    expect(screen.getByText("RouteWise")).toBeInTheDocument();
  });
});
