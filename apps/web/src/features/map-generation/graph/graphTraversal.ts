import type { RoomGraph } from './roomGraphTypes'
import { getConnectedRoomIds } from './roomGraph'

export function breadthFirstRoomTraversal(
  graph: RoomGraph,
  startRoomId: string,
): string[] {
  const visited = new Set<string>()
  const queue: string[] = [startRoomId]

  while (queue.length > 0) {
    const roomId = queue.shift()!

    if (visited.has(roomId)) continue

    visited.add(roomId)

    for (const neighborId of getConnectedRoomIds(graph, roomId)) {
      if (!visited.has(neighborId)) {
        queue.push(neighborId)
      }
    }
  }

  return [...visited]
}

export function findShortestRoomPath(
  graph: RoomGraph,
  startRoomId: string,
  targetRoomId: string,
): string[] | null {
  const visited = new Set<string>()
  const queue: Array<{ roomId: string; path: string[] }> = [
    { roomId: startRoomId, path: [startRoomId] },
  ]

  while (queue.length > 0) {
    const current = queue.shift()!

    if (current.roomId === targetRoomId) {
      return current.path
    }

    if (visited.has(current.roomId)) continue
    visited.add(current.roomId)

    for (const neighborId of getConnectedRoomIds(graph, current.roomId)) {
      if (!visited.has(neighborId)) {
        queue.push({
          roomId: neighborId,
          path: [...current.path, neighborId],
        })
      }
    }
  }

  return null
}
