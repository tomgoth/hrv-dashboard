import React, { useState, useEffect } from 'react'
import './App.css'
import axios from "axios"
import { quantile, ln } from './utils/math'
import moment from 'moment'
import {VictoryLine, VictoryChart, VictoryBrushContainer, VictoryTooltip, createContainer, VictoryLegend} from 'victory'

const VictoryZoomVoronoiContainer = createContainer("zoom", "voronoi");

function App() {
  const [data, setData] = useState({rMSSD: [{x: 1, y:2}], HFPWR: [{x: 1, y:2}], LFPWR: [{x: 1, y:2}]});
  const [selectedDomain, setSelectedDomain] = useState();



  useEffect(() => {
    axios.get('http://localhost:3001/recent')
      .then((response) => {
        let r = response.data.data
        let rMSSDArr = r.map(datum => datum.rMSSD)
        let rMSSDData = r.map(datum => { return {label: `${datum.rMSSD.toFixed(0)}ms @ ${moment(datum.createdAt).format("MM/DD hh:mma")}` , y: datum.rMSSD, x: moment(datum.createdAt).toDate()} })
        let HFPWRData = r.map(datum => { return {label: `${ln(datum.HFPWR).toFixed(2)} @ ${moment(datum.createdAt).format("MM/DD hh:mma")}` , y: ln(datum.HFPWR), x: moment(datum.createdAt).toDate()} })
        let LFPWRData = r.map(datum => { return {label: `${ln(datum.LFPWR).toFixed(2)} @ ${moment(datum.createdAt).format("MM/DD hh:mma")}` , y: ln(datum.LFPWR), x: moment(datum.createdAt).toDate()} })
        let q66Data = [{x: rMSSDData[0].x, y: quantile(rMSSDArr, .66)}, {x: rMSSDData[rMSSDData.length - 1].x, y: quantile(rMSSDArr, .66)}]
        let q33Data = [{x: rMSSDData[0].x, y: quantile(rMSSDArr, .33)}, {x: rMSSDData[rMSSDData.length - 1].x, y: quantile(rMSSDArr, .33)}]

        setData({rMSSD: rMSSDData, HFPWR: HFPWRData, LFPWR: LFPWRData, Q66: q66Data, Q33: q33Data});
        setSelectedDomain(setDomainDuration("week"))
    
    })
  },[])

  const setDomainDuration = (duration) => { //day, week, month, year
    let now = moment().toDate();
    let prev = moment().subtract(1, duration).toDate();
    return {x: [prev, now]}
  }

  const handleZoom = (domain) => {
    setSelectedDomain({x: domain.x}) //set only the x domain
  }

return (
      
        <div>
            <VictoryChart width={1000} height={700} scale={{x: "time"}}
              containerComponent={
                <VictoryZoomVoronoiContainer responsive={false}
                  zoomDimension="x"
                  zoomDomain={selectedDomain}
                  onZoomDomainChange={handleZoom}
                />
              }
            >
              <VictoryLegend x={400} y={50}
                title="HRV Time Domain"
                centerTitle
                orientation="horizontal"
                gutter={20}
                style={{ border: { stroke: "black" }, title: {fontSize: 20 } }}
                data={[
                  { name: "rMSSD", symbol: { fill: "#20b2aa"} },
                  { name: "67th / 33rd Percentile", symbol: { fill: "ff665e" } }
                ]}
              />
              <VictoryLine
                style={{
                  data: {stroke: "#20b2aa"}
                }}
                interpolation="monotoneX"
                data={data.rMSSD}
                labelComponent={<VictoryTooltip activateData={true}/>}
              />
              
              <VictoryLine
                style={{
                  data: {stroke: "#ff665e",
                        strokeWidth: .5}
                }}
                data={data.Q66}
              />
              <VictoryLine
                style={{
                  data: {stroke: "#ff665e",
                        strokeWidth: .5}
                }}
                data={data.Q33}
              />
  
            </VictoryChart>
  
            <VictoryChart
              padding={{top: 0, left: 50, right: 50, bottom: 30}}
              width={1000} height={100} scale={{x: "time"}}
              containerComponent={
                <VictoryBrushContainer responsive={false}
                  brushDimension="x"
                  brushDomain={selectedDomain}
                  onBrushDomainChange={handleZoom}
                />
              }
            >
              
              <VictoryLine
                style={{
                  data: {stroke: "#493924"}
                }}
                data={data.rMSSD}
                interpolation="monotoneX"
                labelComponent={<VictoryTooltip/>}
              />
            </VictoryChart>

            <VictoryChart width={1000} height={700} scale={{x: "time"}}
              containerComponent={
                <VictoryZoomVoronoiContainer responsive={false}
                  zoomDimension="x"
                  zoomDomain={selectedDomain}
                  onZoomDomainChange={handleZoom}
                />
              }
            >
              <VictoryLegend x={400} y={50}
                title="HRV Frequency Domain"
                centerTitle
                orientation="horizontal"
                gutter={20}
                style={{ border: { stroke: "black" }, title: {fontSize: 20 } }}
                data={[
                  { name: "LN High Frequency Power", symbol: { fill: "#20b2aa" } },
                  { name: "LN Low Frequency Power", symbol: { fill: "ff665e" } }
                ]}
              />
              <VictoryLine
                style={{
                  data: {stroke: "#20b2aa"}
                }}
                interpolation="monotoneX"
                data={data.HFPWR}
                labelComponent={<VictoryTooltip/>}
              />
               <VictoryLine
                style={{
                  data: {stroke: "#ff665e"}
                }}
                interpolation="monotoneX"
                data={data.LFPWR}
                labelComponent={<VictoryTooltip/>}
              />
            </VictoryChart >
        </div>)
  }
  


export default App;
