export type CircleCollider = {
  id: string
  kind: 'circle'
  position: [number, number, number]
  radius: number
}

/** Axis-aligned footprint on XZ; `position` is center, `size` is full width (X) and depth (Z). */
export type RectCollider = {
  id: string
  kind: 'rect'
  position: [number, number, number]
  size: [number, number]
}

export type StaticCollider = CircleCollider | RectCollider
