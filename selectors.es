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

export {
  extSelector,
  recordMetaSelector,
  mapIdListSelector,
}
