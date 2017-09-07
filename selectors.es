import _ from 'lodash'
import { generalComparator } from 'subtender'
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
  rm => Object.keys(rm).sort(generalComparator)
)

export {
  extSelector,
  recordMetaSelector,
  mapIdListSelector,
}
