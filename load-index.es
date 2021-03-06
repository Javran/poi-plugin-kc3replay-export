import { join } from 'path-extra'
import zlib from 'zlib'
import fs from 'fs'
import _ from 'lodash'

const {APPDATA_PATH} = window

const indexFilePath =
  join(APPDATA_PATH, 'battle-detail', 'index11.csv.gz')

/*
const toMapId = _.memoize(
  raw => {
    const result = /^(\d+)-(\d+)$/.exec(raw)
    if (!result)
      return null
    const [_ignored, areaStr, numStr] = result
    const area = Number(areaStr)
    const num = Number(numStr)
    return area*10 + num
  }
)
*/

/*
   load index records from battle details
   returns null or <Records> structure.

   Records[<mapStr> or 'pvp'] = <Array of records>

   the order in index file is preserved, hopefully that means
   records are sorted in descending order of their timestamps.

 */
const loadIndex = () => {
  try {
    const content = zlib.unzipSync(fs.readFileSync(indexFilePath)).toString()
    const rawLines = content.split(/\r\n|\r|\n/)

    const records = {}
    rawLines.map((raw,lineInd) => {
      // skipping empty lines
      if (raw.length === 0)
        return

      const cols = raw.split(',').map(x => x.trim())
      try {
        if (cols.length !== 6)
          throw new Error('length mismatched')
        const [id, timeStr, mapStrRaw, routeStr, desc, rank] = cols
        const time = timeStr && Number(timeStr)
        const route = routeStr === '' ? null : Number(routeStr)
        const mapStr = mapStrRaw === '' ? null : mapStrRaw
        if (!id || !time) {
          throw new Error('some fields are invalid')
        }
        const recIndex = mapStr || 'pvp'
        const recordArr = records[recIndex] || []
        recordArr.push({id,time,mapStr,route,desc,rank,lineInd})
        records[recIndex] = recordArr
      } catch (e) {
        console.error(`failed to parse: ${raw}, ${e}`)
      }
    })
    return records
  } catch (e) {
    return null
  }
}

const groupByLineIndex = xs => {
  const groups = []
  let ind = 0
  let curGroup = []
  while (ind < xs.length) {
    const curRecord = xs[ind]
    if (curGroup.length === 0) {
      curGroup.push(curRecord)
      ++ind
    } else {
      if (_.last(curGroup).lineInd+1 === curRecord.lineInd) {
        curGroup.push(curRecord)
        ++ind
      } else {
        groups.push(curGroup)
        curGroup = [curRecord]
        ++ind
      }
    }
  }
  if (curGroup.length > 0) {
    groups.push(curGroup)
    curGroup = []
  }
  return groups
}

const prepareNextEdges = mapInfo => {
  // nextEdges[<node>] = Array of edge ids
  const nextEdges = {}
  Object.entries(mapInfo.route).map(([edgeIdStr, [nFrom,_nTo]]) => {
    const edgeArr = nextEdges[nFrom] || []
    if (!nFrom)
      return
    edgeArr.push(Number(edgeIdStr))
    nextEdges[nFrom] = edgeArr
  })
  return nextEdges
}

const groupByConnectivity = canGoFromTo => recordArr => {
  const groups = []
  let ind = 0
  let curGroup = []
  while (ind < recordArr.length) {
    const curRecord = recordArr[ind]
    if (curGroup.length === 0) {
      curGroup.push(curRecord)
      ++ind
    } else {
      const endEdgeId = _.last(curGroup).route
      const beginEdgeId = curRecord.route
      if (canGoFromTo(beginEdgeId,endEdgeId)) {
        curGroup.push(curRecord)
        ++ind
      } else {
        groups.push(curGroup)
        curGroup = [curRecord]
        ++ind
      }
    }
  }
  if (curGroup.length > 0) {
    groups.push(curGroup)
    curGroup = []
  }
  return groups.map(xs => xs.reverse())
}

/*
   converts a <Records> structure into <SortieRecords> using fcd.map.

   SortieRecords[<mapStr> or 'pvp'] = <Array of SortieRecord>

   a SortieRecord is meant to be treated as a single sortie history,
   and is either a index record, or an Array of records:

   - for 'pvp' or `mapStr` whose fcd data cannot be found, a SortieRecord is
     simply a index record

   - for whose that we can find fcd data, we will attempt to group
     records by sorties and every SortieRecord will end up being an Array of index records

 */
const groupRecords = (records, fcdMap) => {
  if (!fcdMap)
    return records
  const sortieRecords = {}
  Object.keys(records).map(recInd => {
    if (recInd === 'pvp') {
      sortieRecords[recInd] = records[recInd]
      return
    }
    const mapStr = recInd
    const mapInfo = _.get(fcdMap,mapStr)
    if (!mapInfo) {
      sortieRecords[recInd] = records[recInd]
      return
    }
    const recordArr = records[recInd]
    /*
       In "Stage1" we group records by detecting consecutive line indices.
       This way we won't accidentally group together two sortie records
       which are obviously not coming from the same sortie.
     */
    const recordArrStage1 = groupByLineIndex(recordArr)
    const nextEdges = prepareNextEdges(mapInfo)

    // if it's possible to go from one edge to another
    const canGoFromToImpl = (beginEdgeId, endEdgeId) => {
      /*
         to go from one edge to another means to go from end node of 'beginEdgeId'
         to begin node of `endEdgeId`.
       */
      const [_node1, beginNode] = mapInfo.route[beginEdgeId]
      const [endNode, _node2] = mapInfo.route[endEdgeId]
      if (!beginNode || !endNode)
        return false

      /*
         let's assume that it's only possible to go from one edge to another
         if it can be done within 5 steps. The definition of a step
         is to go from one node to another one through an edge.
       */
      const search = (curNode, remainedSteps = 5) => {
        if (curNode === endNode)
          return true
        if (remainedSteps <= 0)
          return false
        const nextEdgeIds = nextEdges[curNode]
        if (!nextEdgeIds)
          return false
        for (let i=0; i<nextEdgeIds.length; ++i) {
          const nextEdgeId = nextEdgeIds[i]
          const [_node, nextNode] = mapInfo.route[nextEdgeId]
          if (search(nextNode,remainedSteps-1))
            return true
        }
        return false
      }
      return search(beginNode)
    }

    const canGoFromTo = _.memoize(
      canGoFromToImpl,
      (eFrom, eTo) => `${eFrom}=>${eTo}`
    )

    sortieRecords[mapStr] = _.flatMap(
      recordArrStage1,
      groupByConnectivity(canGoFromTo)
    )
  })
  return sortieRecords
}

export {
  loadIndex,
  groupRecords,
}
