import _ from 'lodash'
import { enumFromTo, projectorToComparator } from 'subtender'
import { createSelector } from 'reselect'
import {
  fcdSelector,
  extensionSelectorFactory,
} from 'views/utils/selectors'

import { initState } from './store'

// TODO: reduxify
const itemsPerPage = 20

const extSelector = createSelector(
  extensionSelectorFactory('poi-plugin-kc3replay-export'),
  ext => _.isEmpty(ext) ? initState : ext)

const recordMetaSelector = createSelector(
  extSelector,
  e => e.recordMeta
)

const battleRecordsSelector = createSelector(
  extSelector,
  e => e.battleRecords
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

const activePageSelector = createSelector(
  uiSelector,
  ui => ui.activePage
)

const routeToNodeEndFuncSelector = createSelector(
  fcdSelector,
  mapIdSelector,
  (fcd, mapId) => {
    if (!mapId || mapId === 'pvp')
      return _.identity
    const routeInfo = _.get(fcd,['map',mapId,'route'])
    if (!routeInfo)
      return _.identity
    return edgeId => {
      const eInfo = _.get(routeInfo,edgeId)
      if (!eInfo)
        return edgeId
      return eInfo[1]
    }
  }
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
  routeToNodeEndFuncSelector,
  (recordMeta, mapId, routeToNodeEndFunc) => {
    if (_.isEmpty(recordMeta) || !mapId)
      return []
    const recordList = recordMeta[mapId]
    if (!Array.isArray(recordList) || recordList.length === 0)
      return []

    const mkRecordDetail = rawRecord => {
      if (Array.isArray(rawRecord)) {
        const firstRecord = _.head(rawRecord)
        const lastRecord = _.last(rawRecord)
        const timeSpan =
          rawRecord.length === 1 ?
            firstRecord.time :
            [firstRecord.time, lastRecord.time]
        return {
          timeSpan,
          id: firstRecord.id,
          desc: `Sortie Record ${rawRecord.map(r => routeToNodeEndFunc(r.route)).join('=>')}`,
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

const pageRangeSelector = createSelector(
  recordDetailListSelector,
  recordDetailList =>
    Math.ceil(recordDetailList.length / itemsPerPage)
)

const activeRecordDetailListSelector = createSelector(
  recordDetailListSelector,
  activePageSelector,
  (recordDetailList, activePage) => {
    const beginInd = (activePage-1)*itemsPerPage
    const endInd = Math.min(beginInd+itemsPerPage-1, recordDetailList.length-1)
    return enumFromTo(beginInd, endInd).map(ind => recordDetailList[ind])
  }
)

export {
  extSelector,
  recordMetaSelector,
  mapIdListSelector,

  uiSelector,
  mapIdSelector,
  activePageSelector,
  recordDetailListSelector,
  pageRangeSelector,
  activeRecordDetailListSelector,
  battleRecordsSelector,
}
