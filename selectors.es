import _ from 'lodash'
import { projectorToComparator } from 'subtender'
import { createSelector } from 'reselect'
import {
  extensionSelectorFactory,
} from 'views/utils/selectors'

import { initState } from './store'

const extSelector = createSelector(
  extensionSelectorFactory('poi-plugin-kc3replay-export'),
  ext => _.isEmpty(ext) ? initState : ext)

const recordMetaSelector = createSelector(
  extSelector,
  e => e.recordMeta
)

const mapIdListSelector = createSelector(
  recordMetaSelector,
  rm => Object.keys(rm).sort(projectorToComparator(
    mapId => {
      if (mapId === 'pvp')
        // PvP: always on top
        return Infinity
      const [_ignored, areaRaw, numRaw] = /^(\d+)-(\d+)$/.exec(mapId)
      return Number(areaRaw)*10 + Number(numRaw)
    }
  )).reverse()
)

const uiSelector = createSelector(
  extSelector,
  e => e.ui
)

const mapIdSelector = createSelector(
  uiSelector,
  ui => ui.mapId
)

/*
   produces an Array of the following structure:

   - timeSpan: <number> or [<number>,<number>]
   - id: for single record it's id property, for an Array it's the id property of first one
   - desc: description string
 */
const recordDetailListSelector = createSelector(
  recordMetaSelector,
  mapIdSelector,
  (recordMeta, mapId) => {
    if (_.isEmpty(recordMeta) || !mapId)
      return []
    const recordList = recordMeta[mapId]
    if (!Array.isArray(recordList) || recordList.length === 0)
      return []

    const mkRecordDetail = rawRecord => {
      if (Array.isArray(rawRecord)) {
        const firstRecord = _.head(rawRecord)
        const lastRecord = _.last(rawRecord)
        return {
          timeSpan: [firstRecord.time, lastRecord.time],
          id: firstRecord.id,
          desc: `Sortie Record ${rawRecord.map(r => r.route).join('=>')}`,
        }
      } else {
        return {
          timeSpan: rawRecord.time,
          id: rawRecord.id,
          desc: rawRecord.desc,
        }
      }
    }

    return recordList.map(mkRecordDetail)
  }
)

export {
  extSelector,
  recordMetaSelector,
  mapIdListSelector,

  uiSelector,
  mapIdSelector,
  recordDetailListSelector,
}
