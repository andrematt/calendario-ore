import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import './App.css';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      month:"",
      year:"",
      workers:[],
      calendar:[]
    }
    this.setData=this.setData.bind(this);
    this.dateToString=this.dateToString.bind(this);
    this.createCalendar=this.createCalendar.bind(this);
    this.addWorker=this.addWorker.bind(this);
    this.removeWorker=this.removeWorker.bind(this);
    this.translatename=this.translatename.bind(this);
  }

  translatename(n){
    switch(n){
      case'MONDAY':
        return('lun');
      
      case'TUESDAY':
        return('mar');
      

      case'WEDNESDAY':
        return('mer');
      
        
      case'THURSDAY':
        return('gio');
      
        
      case'FRIDAY':
        return('ven');
      

      case'SATURDAY':
        return('sab');
      
    
      case'SUNDAY':
        return('dom');
      
      
        default:
        return("");
    }
  }

  addWorker(w){
    let allWorkers=[...this.state.workers];
    if(w.length>0&&allWorkers.indexOf(w)===-1){
      allWorkers.push(w);
      this.setState({
        workers:allWorkers
      });
   }
  }

  removeWorker(w){
    let myValue=w.currentTarget.value;
    let allWorkers=[...this.state.workers];
    if(myValue.length>0&&allWorkers.indexOf(myValue)!==-1){
      let index=allWorkers.indexOf(myValue);
      allWorkers.splice(index, 1);  
      this.setState({
        workers:allWorkers
      });
    }
  }

  dateToString(n){
    let stringed;
    if(n<10){
        stringed="0"+n;
    }
    else {
        stringed=""+n;
    }
    return stringed;
}

  createCalendar(){
    var LocalDate = require("js-joda").LocalDate;
    let stringedYear=this.dateToString(this.state.year);
    let stringedMonth=this.dateToString(this.state.month);
    let myDate=(stringedYear+"-"+stringedMonth+"-01");
    let myMonth = [];
    var monthLength = LocalDate.parse(myDate).lengthOfMonth();
    
    for(let i=1; i<=monthLength; i++){
        let stringedDay=this.dateToString(i);
        let newDate = (stringedYear+"-"+stringedMonth+"-"+stringedDay);
        myMonth.push(LocalDate.parse(newDate))
    }

    this.setState({
      calendar:myMonth
    });
  
  }

  setData(month, year){
    this.setState({
        month: month,
        year:year
      }, () => {
      this.createCalendar(); //callback needed because setState is not immediate!
      });
  }

  render() {
      return (
        <div className="App">
          <div className="head-grid">
            <YearMonthForm setData={this.setData}/>
            <Addworker workers = {this.state.workers} addWorker={this.addWorker} removeWorker={this.removeWorker}/>
          </div>
          <div className="calendar-container">     
            <Calendar translatename={this.translatename} myCalendar={this.state.calendar}/>
          </div>
          <div className="workers-calendar-container">
            <WorkersCalendar translatename={this.translatename} myCalendar={this.state.calendar} workers = {this.state.workers}/>
          </div>     
        </div>
      );
    }
  }

  class WriteableCell extends Component{
    constructor(props){
      super(props);
      this.state = {
        previousHours:0,
        hours:0
      }
      this.getState=this.getState.bind(this);
      this.handleHours=this.handleHours.bind(this);
    }
    
    getState(){
      return this.state.hours;
    }
    
    handleHours(e){
      let actualValue = e.target.value; 
      if (actualValue==="" || actualValue===null || actualValue===undefined){
        actualValue=0;
      }
      this.setState({
        previousHours:this.state.hours,
        hours:actualValue
      }, () => {
        this.props.updateTotal(this.state.hours, this.state.previousHours, this.props.myData); //propaga questo cambiamento al component padre 
      });
    }
    
    render(){
      let day=this.props.myData.dayOfWeek();
      let nameEng=(day.name()); 
      let name=this.props.translatename(nameEng);
      return(
        <span className="dayCell" id={name}>
          <input id="hours" value={this.state.hours} onChange={this.handleHours}/> 
        </span>   
      )
    }
  }
  
  class WritableCalendar extends Component{
    constructor(props){
      super(props);
      this.state = {
        total:0,
        allWeeks:this.props.myWeeks
      }
      this.updateWeekTotal=this.updateWeekTotal.bind(this);
      this.updateTotal=this.updateTotal.bind(this);
      this.drawWeeksTotal=this.drawWeeksTotal.bind(this);
    }

    drawWeeksTotal(){
      let result = "";
      this.state.allWeeks.forEach((e, i)=>{
        result+=" settimana " + (i+1) + " = " + e.total +";";
      });
      return(result);
    };
    
    updateWeekTotal(actual, previous, cellData){
      let n = (cellData.dayOfMonth());
      for(let i=0; i<this.state.allWeeks.length;i++){
        if(this.state.allWeeks[i].days.indexOf(n)!==-1){
          let newWeekTotal=parseFloat(this.state.allWeeks[i].total)-parseFloat(previous)+parseFloat(actual); 
          let newAllWeeks=this.state.allWeeks.slice(0, this.state.allWeeks.length);
          newAllWeeks[i].total=newWeekTotal;
          this.setState({ 
            total:newAllWeeks
           });
        }
      }
    }

    updateTotal(actual, previous, cellData){
      if (!isNaN(parseFloat(actual)) && isFinite(actual)){
        let newTotal=parseFloat(this.state.total)-parseFloat(previous)+parseFloat(actual);
        this.setState({ 
        total:newTotal
      }, this.updateWeekTotal(actual, previous, cellData))
      }
    }
    
    render(){
      let allWriteableCells=this.props.myCalendar.map((e, i)=>{
        return(
          <WriteableCell key={i} translatename={this.props.translatename} updateTotal={this.updateTotal} className="singleCell" myData={e} myNumber={i}/>
        )
      });
      return(
        <div className="singleWorker" key={this.props.worker}>
        <div className="worker-data">
        <h2>{this.props.worker}</h2>
        <p>totale = {this.state.total};</p>
        <p> {this.drawWeeksTotal()}</p>
        </div>
        <div className="allWriteableCells">
          {allWriteableCells}
        </div>
        </div>
      )
    }
  }

  class WorkersCalendar extends Component{ 
    constructor(props){
      super(props);
      this.createWeeks=this.createWeeks.bind(this);
      this.findSundays=this.findSundays.bind(this);
    }

    findSundays(c){
      let sundays=[...c].filter((e)=>{
        return e.dayOfWeek().name()==="SUNDAY";
      });
      let sundaysIndexes=sundays.map((e)=>{
        return e.dayOfMonth();
      })
      return sundaysIndexes;
    }

    createWeeks(c){
      function week() {
        this.days = [];
        this.total = 0;
      }

      let weeks=[]; 
      let lastIndex=0;
      for(let i=1; i<c.length;i++){ //Il primo giorno è da saltare, altrimenti se è lunedì lo considera come fine della settimana precedente e prende come settimana un array vuoto (da 0 a 0)
        if(c[i].dayOfWeek().name()==="MONDAY"){
        let tempWeekDays = c.slice(lastIndex, i);
        let thisWeek = new week();
        tempWeekDays.forEach((e)=>{
          thisWeek.days.push(e.dayOfMonth());
        });
        weeks.push(thisWeek); 
        lastIndex=i;
        }
      }
      
      let lastDays = c.slice(lastIndex);
      let thisWeek = new week();
      lastDays.forEach((e)=>{
        thisWeek.days.push(e.dayOfMonth());
      });
      weeks.push(thisWeek); 
      return(weeks);
    }

    render(){
      let allWeeks=this.createWeeks(this.props.myCalendar);      
      if(this.props.myCalendar.length>0&&this.props.workers.length>0){
        let WorkersAndCalendars=this.props.workers.map((e, i)=>{
          return(
              <WritableCalendar myWeeks={allWeeks} translatename={this.props.translatename} worker ={e} key={i} myCalendar={this.props.myCalendar}/>
            )
        });

        return(
          <div>
            {WorkersAndCalendars}
          </div>
      )
      }
      else {
      return null;
      }
      }
    }
  

  class Addworker extends Component{
    constructor(props){
      super(props);
      this.state={
        actualWorker:""
      }
      this.preventDefault=this.preventDefault.bind(this);
      this.handleNewWorker=this.handleNewWorker.bind(this);
      this.sendWorker=this.sendWorker.bind(this);
    }

    sendWorker(){
      this.props.addWorker(this.state.actualWorker);
      this.setState({
        actualWorker:""
      })
    }

    handleNewWorker(e){
      this.setState({
        actualWorker:e.target.value
      })
    }

    preventDefault(event){
      event.preventDefault();
    }

    render(){
      return(
        <div className="worker-form">
          <p>Aggiungi un lavoratore:</p>
          <form id="date-form" onSubmit={this.preventDefault}>
            <input id="month" placeholder="nome" value={this.state.actualWorker} onChange={this.handleNewWorker}/>
            <Button value="" variant="contained" color="primary" id="submit" onClick={this.sendWorker}>Aggiungi</Button>
          </form>
          <Drawworkers removeWorker={this.props.removeWorker} workers = {this.props.workers}/>
        </div>
      )
    }
  }

  class Drawworkers extends Component{
    render(){
      if(this.props.workers.length>0){
        let allWorkers=this.props.workers.map((e, i)=>{
          return(
            <div className="singleWorker" key={e}>
            <h2>{e}<Button variant="contained" color="secondary" id="submit" value={e} onClick={this.props.removeWorker}>Rimuovi</Button></h2>
            </div>
            )
        });

        return (
            <div className="allWorkers">
            {allWorkers}
            </div>
        )
      }
      else {
        return null;
      }
    }
  }

  class Calendar extends Component{
    constructor(props){
      super(props);
      this.state = {
        test:true
      }
    }
    render() {
      if(this.props.myCalendar.length>0){
        let allCells=this.props.myCalendar.map((e, i)=>{
          return(
            <Cell translatename={this.props.translatename} className="singleCell" key={i} myData={e} myNumber={i}/>
          )
        });

        return (
            <div className="allCells">
            {allCells}
            </div>
        )
      }
      else {
        return null;
      }
  }
}

class Cell extends Component{

  render(){
    let day=this.props.myData.dayOfWeek();
    let number = this.props.myNumber+1;
    let nameEng=(day.name()); 
    let name=this.props.translatename(nameEng);
    return(
      <span className="dayCell" id={name}>
        <p className="number">{number}</p>
        <p className="name">{name}</p>
      </span>
    )
  }
}

  class YearMonthForm extends Component{
    constructor(props){
      super(props);
      this.state = {
        month:1,
        year:2019
      }
      this.verifyData=this.verifyData.bind(this);
      this.preventDefault=this.preventDefault.bind(this);
      this.getFormData=this.getFormData.bind(this);
      this.handleMonthChange=this.handleMonthChange.bind(this);
      this.handleYearChange=this.handleYearChange.bind(this);
    }

    verifyData(m, y){
      if(m>0&&m<=12&&y>2017&&y<=2025){
        return true;
      }
      return false;
    }
    
    handleMonthChange(e){
      //if(e.target.value>0&&e.target.value<=12){
        this.setState({
          month:e.target.value
        })
      //}
    }

    handleYearChange(e){
      //if(e.target.value>2017&&e.target.value<=2025){
        this.setState({
          year:e.target.value
        })
      //}
    }

    preventDefault(event){
      event.preventDefault();
    }

    getFormData(){
      if(this.verifyData(this.state.month,this.state.year)){
        this.props.setData(this.state.month, this.state.year);
      }
    }

    render() {
      return (
        <div className="year-month-form">
          <p>Inserisci mese e anno per cui generare il calendario: </p>
          <form id="date-form" onSubmit={this.preventDefault}>
            <input id="month" placeholder="mese" type="number" value={this.state.month} onChange={this.handleMonthChange} name="mese" min="1" max="12" />
            <input id="year" placeholder="anno" type="number" value={this.state.year} onChange={this.handleYearChange} name="anno" min="2018" max="2025" />
            <Button variant="contained" color="primary" id="submit" onClick={this.getFormData} type="submit">Invia</Button> 
          </form>        
        </div>
      );
    }
  }


  



export default App;
