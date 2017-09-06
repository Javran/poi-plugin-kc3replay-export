import _ from 'lodash'
import { loadBattleRecord } from './load-battle-record'

/*
   input structure (poiReplayGroup) is either a battle record,
   or an Array of battle records sorted in the order they happened.

 */
const convertReplay = poiReplayGroup => {
  const poiRecords =
    Array.isArray(poiReplayGroup) ? poiReplayGroup : [poiReplayGroup]

  if (poiRecords.length === 0)
    throw new Error('cannot convert an empty record')

  // starting for this line poiRecords cannot be empty.
  const poiBattles = poiRecords.map(r =>
    loadBattleRecord(r.id)
  )

  // there's a typo in battle-details that 'Pratice' is used instead of 'Practice'
  const isPvP =
    poiBattles[0].type === 'Practice' || poiBattles[0].type === 'Pratice'

  if (poiRecords.length > 1) {
    if (isPvP)
      console.warn('PvP record should contain exactly one battle')
    // mapStr should be exactly the same
    const mapStrs = _.uniq(poiRecords.map(r => r.mapStr))
    if (mapStrs.length !== 1)
      console.warn('mapStr is not unique')
    if (mapStrs[0] === '')
      console.warn('expecting mapStr to be non-empty')
  }

  const whichMap = (() => {
    if (isPvP) {
      return {world: 0, mapnum: 0}
    } else {
      const mapStr = _.head(poiRecords).mapStr
      const [_ignored, worldRaw, mapnumRaw] = /^(\d+)-(\d+)$/.exec(mapStr)
      const world = Number(worldRaw)
      const mapnum = Number(mapnumRaw)
      return {world,mapnum}
    }
  })()

  const combined = poiBattles[0].fleet.type

  /*
     because battle records in poi does not record
     info of all fleets, let's fix fleet3 to always be normal support
     and fleet4 boss support
   */
  const support1 = 3
  const support2 = 4
  const transformFleet = fleetPoi => {
    if (!fleetPoi)
      return []

    const transformShip = ship => {
      const slots = [..._.take(ship.poi_slot,4), ship.poi_slot_ex]
      return {
        mst_id: ship.api_ship_id,
        level: ship.api_lv,
        kyouka: ship.api_kyouka,
        morale: ship.api_cond,
        equip: slots.map(eqp => _.get(eqp, 'api_slotitem_id',0)),
        stars: slots.map(eqp => _.get(eqp, 'api_level',0)),
        ace: slots.map(eqp => _.get(eqp, 'api_alv', -1)),
      }
    }
    return fleetPoi.map(transformShip)
  }

  const fleet1 = transformFleet(poiBattles[0].fleet.main)
  const fleet2 = transformFleet(poiBattles[0].fleet.escort)
  const fleet3Poi = _.uniqWith(
    poiBattles.filter(
      b => b.type === 'Normal'
    ).map(
      b => b.fleet.support
    ).filter(xs =>
      Array.isArray(xs) && xs.length > 0),
    _.isEqual)[0]
  const fleet4Poi = _.uniqWith(
    poiBattles.filter(
      b => b.type === 'Boss'
    ).map(
      b => b.fleet.support
    ).filter(xs =>
      Array.isArray(xs) && xs.length > 0),
    _.isEqual)[0]

  const fleet3 = transformFleet(fleet3Poi)
  const fleet4 = transformFleet(fleet4Poi)

  const transformLbas = lbasPoi => {
    if (!lbasPoi)
      return {}
    const transformSquadron = sq => {
      const planes = sq.api_plane_info.map(p => {
        const slot = p.poi_slot
        return {
          mst_id: slot.api_slotitem_id,
          count: p.api_count,
          stars: _.get(p,'api_level',0),
          ace: slot.api_alv,
          state: p.api_state,
          morale: p.api_cond,
        }
      })
      return {
        rid: sq.api_rid,
        range: sq.api_distance,
        action: sq.api_action_kind,
        planes,
      }
    }
    return lbasPoi.map(transformSquadron)
  }

  const transformBattle = battlePoi => {
    const node = battlePoi.map[2]
    const data = battlePoi.packet[0]
    const yasen = battlePoi.packet.length > 2 ? battlePoi.packet[1] : {}
    return {node, data, yasen}
  }

  const lbas = transformLbas(poiBattles[0].fleet.LBAC)
  const battles = poiBattles.map(transformBattle)

  return {
    ...whichMap,
    fleetnum: 1,
    combined,
    support1, support2,
    fleet1, fleet2, fleet3, fleet4,
    lbas,
    battles,
  }
}

export { convertReplay }
