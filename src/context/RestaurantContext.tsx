import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

export type RestaurantKey = "san-marcos" | "la-ronda"

interface RestaurantContextType {
  selectedRestaurant: RestaurantKey | null
  selectRestaurant: (key: RestaurantKey) => void
  clearRestaurant: () => void
}

const RestaurantContext = createContext<RestaurantContextType | null>(null)

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantKey | null>(null)

  const selectRestaurant = (key: RestaurantKey) => setSelectedRestaurant(key)
  const clearRestaurant  = () => setSelectedRestaurant(null)

  return (
    <RestaurantContext.Provider value={{ selectedRestaurant, selectRestaurant, clearRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  )
}

export const useRestaurant = () => {
  const ctx = useContext(RestaurantContext)
  if (!ctx) throw new Error("useRestaurant must be used inside RestaurantProvider")
  return ctx
}
