import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { store } from 'views/create-store'
import { ExportMain } from './export-main'

import { loadIndex, groupRecords } from '../load-index'
import { convertReplay } from '../convert-replay'

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
const grouppedRecords = groupRecords(records, _.get(store.getState(),'fcd.map'))

const recordInfo = grouppedRecords['6-4'][0]
// const recordInfo = grouppedRecords['39-7'][0]

console.log(JSON.stringify(convertReplay(recordInfo)))
