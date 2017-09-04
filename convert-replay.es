import { loadBattleRecord } from './load-battle-record'

/*
   input structure (poiReplayGroup) is either a battle record,
   or an Array of battle records sorted in the order they happened.
 */
const convertReplay = poiReplayGroup => {
  if (Array.isArray(poiReplayGroup)) {
    const replayData = {
      world: 39,
      mapnum: 7,
      fleetnum: 1,
      combined: 1,
      fleet1: null,
      fleet2: null,
      fleet3: null,
      fleet4: null,
      support1: 3,
      support2: 4,
      lbas: null,
      battles: [],
    }

    const battles = poiReplayGroup.map(r =>
      loadBattleRecord(r.id)
    )

    console.log(battles, poiReplayGroup)

    return replayData
  } else {
    // TODO: cases where there is only one battle record
    return 'TODO'
  }
}

export { convertReplay }
