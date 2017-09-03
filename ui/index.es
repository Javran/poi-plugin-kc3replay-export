import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { store } from 'views/create-store'
import { ExportMain } from './export-main'

import { loadIndex, groupRecords } from '../load-index'
import { loadBattleRecord } from '../load-battle-record'

const {$} = window

$('#fontawesome-css')
  .setAttribute('href', require.resolve('font-awesome/css/font-awesome.css'))

ReactDOM.render(
  <Provider store={store}>
    <div className="kc3replay-export">
      <ExportMain />
    </div>
  </Provider>,
  $("#content-root"))

const records = loadIndex()

const recordInfo = groupRecords(records, _.get(store.getState(),'fcd.map'))['39-7'][0]

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

/* const {ipc} = window
 * const pluginBattleDetail = ipc.access('BattleDetail')
 * recordInfo.map(r => {
 *   pluginBattleDetail.showBattleWithTimestamp(
 *     Number(r.id),
 *     xs => console.log(xs)
 *   )
 * })
 *
 */

const battles = recordInfo.map(r =>
  loadBattleRecord(r.id)
)

const transformFleet = fleetPoi => {
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

// TODO: this might have offsets
const supportFleetsPoi = _.uniqWith(
  battles.map(b => b.fleet.support).filter(xs =>
    Array.isArray(xs) && xs.length > 0),
  _.isEqual)

replayData.fleet3 = transformFleet(supportFleetsPoi[0])
replayData.fleet4 = transformFleet(supportFleetsPoi[1])

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

console.log(JSON.stringify(replayData))
