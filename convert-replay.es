import _ from 'lodash'
import { loadBattleRecord } from './load-battle-record'

/*
   input structure (poiReplayGroup) is either a battle record,
   or an Array of battle records sorted in the order they happened.

   TODO:

   - normal fleet

   - combined fleet: CTF / STF / TECF

   - PvP

 */
const convertReplay = poiReplayGroup => {
  const poiRecords =
    Array.isArray(poiReplayGroup) ? poiReplayGroup : [poiReplayGroup]

  if (poiRecords.length === 0)
    throw new Error('cannot convert an empty record')

  // starting for this line poiRecords cannot be empty.
  const battles = poiRecords.map(r =>
    loadBattleRecord(r.id)
  )

  if (poiRecords.length > 1) {
    // mapStr should be exactly the same
    const mapStrs = _.uniq(poiRecords.map(r => r.mapStr))
    if (mapStrs.length !== 1)
      console.warn('mapStr is not unique')
  }

  const mapStr = _.head(poiRecords).mapStr
  // TODO: deal with PvP
  const [_ignored, worldRaw, mapnumRaw] = /^(\d+)-(\d+)$/.exec(mapStr)
  const world = Number(worldRaw)
  const mapnum = Number(mapnumRaw)

  const combined = battles[0].fleet.type

  /*
     because battle records in poi does not record
     info of all fleets, let's fix fleet3 to always be normal support
     and fleet4 boss support
   */
  const replayData = {
    world,
    mapnum,
    // TODO
    fleetnum: 1,
    combined,
    fleet1: null,
    fleet2: null,
    fleet3: null,
    fleet4: null,
    support1: 3,
    support2: 4,
    lbas: null,
    battles: [],
  }

  const transformFleet = fleetPoi => {
    if (!fleetPoi)
      return {}

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

  const fleet1Poi = battles[0].fleet.main
  replayData.fleet1 = transformFleet(fleet1Poi)
  const fleet2Poi = battles[0].fleet.escort
  replayData.fleet2 = transformFleet(fleet2Poi)
  const fleet3Poi = _.uniqWith(
    battles.filter(
      b => b.type === 'Normal'
    ).map(
      b => b.fleet.support
    ).filter(xs =>
      Array.isArray(xs) && xs.length > 0),
    _.isEqual)[0]
  const fleet4Poi = _.uniqWith(
    battles.filter(
      b => b.type === 'Boss'
    ).map(
      b => b.fleet.support
    ).filter(xs =>
      Array.isArray(xs) && xs.length > 0),
    _.isEqual)[0]

  replayData.fleet3 = transformFleet(fleet3Poi)
  replayData.fleet4 = transformFleet(fleet4Poi)

  const transformLbas = lbasPoi => {
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

  replayData.lbas = transformLbas(battles[0].fleet.LBAC)
  replayData.battles = battles.map(transformBattle)

  return replayData
}

export { convertReplay }
