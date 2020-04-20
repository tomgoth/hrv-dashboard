import React, { useState, useEffect } from 'react'
import './App.css'
import axios from "axios"
import { quantile } from './utils/math'
import moment from 'moment'
import {VictoryLine, VictoryChart, VictoryBrushContainer, VictoryTooltip, createContainer, VictoryLegend} from 'victory'
import MultiToggle from 'react-multi-toggle'
import Spinner from './Spinner.js'

const domainOptions = [{displayName: "Day", value: "day"}, {displayName: "Week", value: "week"}, {displayName: "Month", value: "month"}, {displayName: "Year", value: "year"}]

const VictoryZoomVoronoiContainer = createContainer("zoom", "voronoi");

function App() {
  const [data, setData] = useState();
  const [selectedDomain, setSelectedDomain] = useState();
  const [selectedDomainOption, setSelectedDomainOption] = useState("week");
  const [isLoading, setIsLoading] = useState(true)
  const [average, setAverage] = useState(0);



  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URI}/recent`)
      .then((response) => {
        let r = response.data.data
        let rMSSDArr = r.map(datum => datum.rMSSD)
        let rMSSDData = r.map(datum => { return {label: `${datum.rMSSD.toFixed(0)}ms @ ${moment(datum.createdAt).format("MM/DD hh:mma")}` , y: datum.rMSSD, x: moment(datum.createdAt).toDate()} })
        //let HFPWRData = r.map(datum => { return {label: `${ln(datum.HFPWR).toFixed(2)} @ ${moment(datum.createdAt).format("MM/DD hh:mma")}` , y: ln(datum.HFPWR), x: moment(datum.createdAt).toDate()} })
        //let LFPWRData = r.map(datum => { return {label: `${ln(datum.LFPWR).toFixed(2)} @ ${moment(datum.createdAt).format("MM/DD hh:mma")}` , y: ln(datum.LFPWR), x: moment(datum.createdAt).toDate()} })
        let q66Data = [{x: rMSSDData[0].x, y: quantile(rMSSDArr, .66)}, {x: rMSSDData[rMSSDData.length - 1].x, y: quantile(rMSSDArr, .66)}]
        let q33Data = [{x: rMSSDData[0].x, y: quantile(rMSSDArr, .33)}, {x: rMSSDData[rMSSDData.length - 1].x, y: quantile(rMSSDArr, .33)}]

        setData({rMSSD: rMSSDData, Q66: q66Data, Q33: q33Data});
        let domain = setDomainDuration("week", rMSSDData)
        setSelectedDomain(domain)
        setAverageFromDomain(domain, rMSSDData)  

        setIsLoading(false)
    
    })
    
  },[])

  const setDomainDuration = (duration, dataArr) => { //day, week, month, year
    let now = moment().toDate();
    let prev = moment().subtract(1, duration).toDate();
    let domain = {x: [prev, now]}
    let maxY = dataArr.filter(datum => datum.x > domain.x[0] && datum.x < domain.x[1]).reduce((maxY, datum) => (datum.y > maxY) ? datum.y : maxY, 0)
    if (maxY > 0) { domain.y = [0, maxY + 30] }
    
    return domain
  }

  const setAverageFromDomain = (domain, dataArr) => {
    let filtered = dataArr.filter(datum => datum.x > domain.x[0] && datum.x < domain.x[1])
    if (filtered.length > 0) {
      let avg = filtered.reduce((sum, datum) => sum + datum.y, 0)/filtered.length
      
      setAverage(avg.toFixed(1))
    }
  }

  const handleZoom = (domain) => {
    setSelectedDomain({x: domain.x}) //set only the x domain
    setAverageFromDomain(domain, data.rMSSD)
  }

  const handleDomainOption = (option) => {
    setSelectedDomainOption(option)
    let domain = setDomainDuration(option, data.rMSSD)
    setAverageFromDomain(domain, data.rMSSD)
    setSelectedDomain(domain)
  }

if(isLoading) {
    return <Spinner />
}

return (
      
        <div>            
            <MultiToggle
              options={domainOptions}
              selectedOption={selectedDomainOption}
              onSelectOption={handleDomainOption}
            />
            <h5>AVERAGE</h5>
            <h2>{average} </h2>
            <VictoryChart width={1000} height={700} scale={{x: "time"}}
              animate={{
                duration: 1000,
                onLoad: { duration: 250 }
              }}
              containerComponent={
                <VictoryZoomVoronoiContainer responsive={true}
                  allowZoom={false}
                  zoomDomain={selectedDomain}              
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
                <VictoryBrushContainer responsive={true}
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

            {/* <VictoryChart width={1000} height={700} scale={{x: "time"}}
              animate={{
                duration: 1000,
                onLoad: { duration: 1000 }
              }}
              containerComponent={
                <VictoryZoomVoronoiContainer responsive={true}
                  allowZoom={false}
                  zoomDomain={selectedDomain}  
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
            </VictoryChart > */}
        </div>)
  }
  


export default App;
