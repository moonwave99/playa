import { useEffect } from "react";
import { useLocation, type Location } from "react-router";

export default function useOnLocationChange(
  onChange: (location: Location) => void
) {
  const location = useLocation();
  useEffect(() => {
    onChange(location);
  }, [location]);
}
