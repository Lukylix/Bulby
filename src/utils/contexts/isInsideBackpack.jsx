import { createContext, useMemo, useState } from "react";

// Create a new context
const IsInsideBackpackContext = createContext();

export default IsInsideBackpackContext;

export function IsInsideBackpackProvider({ children, value }) {
  const [isInsideBackpack] = useState(value);

  const valueIsBackpackInside = useMemo(() => ({ isInsideBackpack }), [isInsideBackpack]);

  return <IsInsideBackpackContext.Provider value={valueIsBackpackInside}>{children}</IsInsideBackpackContext.Provider>;
}
