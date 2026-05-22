/**
 * Map generation: **data** (definitions), **graph** (pure room graph), **geometry** (spatial),
 * **rendering** (R3F), **collision** (gameplay rects). Import from `features/map-generation`.
 */

// --- data ---
export * from './data/mapTypes'
export * from './data/mapConfig'
export * from './data/roomTemplates'
export * from './data/mapBounds'
export * from './data/mapSceneUtils'
export * from './data/generateFixedMap'
export * from './data/generateLinearMap'
export * from './data/generateBranchingMap'
export * from './data/validateMapDefinition'
export * from './data/mapConnections'
export * from './data/seededRandom'

// --- graph (pure TS; no React / Three / stores) ---
export * from './graph/roomGraphTypes'
export * from './graph/roomGraph'
export * from './graph/roomAdjacency'
export * from './graph/validateRoomGraph'
export * from './graph/graphTraversal'
export * from './graph/graphAlgorithms'

// --- geometry ---
export * from './geometry/mapWallGeometry'
export * from './geometry/mapDoorwayUtils'
export * from './geometry/mapDoorwayPlacement'
export * from './geometry/mapObjectPlacement'
export * from './geometry/mapRoomWallSlabs'
export * from './geometry/mapRoomConnectors'

// --- rendering ---
export * from './rendering/GeneratedMap'
export * from './rendering/GeneratedRoom'
export * from './rendering/GeneratedDoorway'
export * from './rendering/GeneratedConnectionBridge'

// --- collision ---
export * from './collision/mapCollision'
