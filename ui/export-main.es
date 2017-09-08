import { modifyObject } from 'subtender'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ListGroup, ListGroupItem } from 'react-bootstrap'
import { mapIdListSelector, mapIdSelector, recordDetailListSelector } from '../selectors'
import { PTyp } from '../ptyp'
import { mapDispatchToProps } from '../store'

const pprMapId = x =>
  x === 'pvp' ? 'Practice' : x

class ExportMainImpl extends Component {
  static propTypes = {
    mapIdList: PTyp.array.isRequired,
    mapId: PTyp.string,
    recordDetailList: PTyp.array.isRequired,
    uiModify: PTyp.func.isRequired,
  }

  static defaultProps = {
    mapId: null,
  }

  handleMapIdChange = mapId => () =>
    this.props.uiModify(
      modifyObject('mapId', () => mapId)
    )

  render() {
    const {mapIdList, mapId, recordDetailList} = this.props
    return (
      <div style={{display: 'flex'}}>
        <div style={{flex: 1}}>
          <ListGroup>
            {
              mapIdList.map(curMapId => (
                <ListGroupItem
                  onClick={this.handleMapIdChange(curMapId)}
                  key={curMapId} style={{padding: '5px 10px'}}>
                  <div className={curMapId === mapId ? 'text-primary' : ''}>
                    {pprMapId(curMapId)}
                  </div>
                </ListGroupItem>
              ))
            }
          </ListGroup>
        </div>
        <div style={{flex: 1}}>
          <ListGroup>
            {
              recordDetailList.map(rd => (
                <ListGroupItem
                  key={rd.id} style={{padding: '5px 10px'}}>
                  <div>
                    {
                      (() => {
                        const tsToStr = x => String(new Date(x))
                        if (Array.isArray(rd.timeSpan)) {
                          return `${tsToStr(rd.timeSpan[0])} ~ ${tsToStr(rd.timeSpan[1])}`
                        } else {
                          return tsToStr(rd.timeSpan)
                        }
                      })()
                    }
                  </div>
                  {JSON.stringify(rd)}
                </ListGroupItem>
              ))
            }
          </ListGroup>
        </div>
        <div style={{flex: 4}}>
          TODO
        </div>
      </div>
    )
  }
}

const ExportMain = connect(
  state => {
    return {
      mapIdList: mapIdListSelector(state),
      mapId: mapIdSelector(state),
      recordDetailList: recordDetailListSelector(state),
    }
  },
  mapDispatchToProps,
)(ExportMainImpl)

export { ExportMain }
