import { lazy } from "react";

// Lazy load UI components to reduce initial bundle size
export const Button = lazy(() =>
  import("./button").then((m) => ({ default: m.Button }))
);
export const Card = lazy(() =>
  import("./card").then((m) => ({ default: m.Card }))
);
export const CardContent = lazy(() =>
  import("./card").then((m) => ({ default: m.CardContent }))
);
export const Dialog = lazy(() =>
  import("./dialog").then((m) => ({ default: m.Dialog }))
);
export const DialogContent = lazy(() =>
  import("./dialog").then((m) => ({ default: m.DialogContent }))
);
export const DialogDescription = lazy(() =>
  import("./dialog").then((m) => ({ default: m.DialogDescription }))
);
export const DialogHeader = lazy(() =>
  import("./dialog").then((m) => ({ default: m.DialogHeader }))
);
export const DialogTitle = lazy(() =>
  import("./dialog").then((m) => ({ default: m.DialogTitle }))
);
export const Input = lazy(() =>
  import("./input").then((m) => ({ default: m.Input }))
);
export const Label = lazy(() =>
  import("./label").then((m) => ({ default: m.Label }))
);
export const Slider = lazy(() =>
  import("./slider").then((m) => ({ default: m.Slider }))
);
export const Checkbox = lazy(() =>
  import("./checkbox").then((m) => ({ default: m.Checkbox }))
);
export const Select = lazy(() =>
  import("./select").then((m) => ({ default: m.Select }))
);
export const SelectContent = lazy(() =>
  import("./select").then((m) => ({ default: m.SelectContent }))
);
export const SelectItem = lazy(() =>
  import("./select").then((m) => ({ default: m.SelectItem }))
);
export const SelectTrigger = lazy(() =>
  import("./select").then((m) => ({ default: m.SelectTrigger }))
);
export const SelectValue = lazy(() =>
  import("./select").then((m) => ({ default: m.SelectValue }))
);
