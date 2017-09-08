import { modifyObject } from 'subtender'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ListGroup, ListGroupItem } from 'react-bootstrap'
import { mapIdListSelector, mapIdSelector } from '../selectors'
import { PTyp } from '../ptyp'
import { mapDispatchToProps } from '../store'

const pprMapId = x =>
  x === 'pvp' ? 'Practice' : x

class ExportMainImpl extends Component {
  static propTypes = {
    mapIdList: PTyp.array.isRequired,
    mapId: PTyp.string,
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
    const {mapIdList, mapId} = this.props
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
    }
  },
  mapDispatchToProps,
)(ExportMainImpl)

export { ExportMain }
