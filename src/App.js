import React, { Component } from 'react';
import Jsjoda from 'js-joda';
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
    this.drawCalendar=this.drawCalendar.bind(this);
    this.addWorker=this.addWorker.bind(this);
    this.removeWorker=this.removeWorker.bind(this);
  }

  addWorker(w){
    console.log(w);
    let allWorkers=[...this.state.workers];
    if(w.length>0&&allWorkers.indexOf(w)===-1){
      allWorkers.push(w);
      console.log(allWorkers);
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

  drawCalendar(){ //passCalendar? così che se il comp calendar ha lunghezza > 0 draw
    console.log("It works!!", this.state.calendar.length);
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
    }, () => {
      this.drawCalendar(); //callback needed because setState is not immediate!
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
            <Calendar myCalendar={this.state.calendar}/>
          </div>
          <div className="workers-calendar-container">
            <WorkersCalendar myCalendar={this.state.calendar} workers = {this.state.workers}/>
          </div>     
        </div>
      );
    }
  }

  class WritableCalendar extends Component{
    render(){
      let allWriteableCells=this.props.myCalendar.map((e, i)=>{
        return(
          <WriteableCell updateTotal={this.props.updateTotal} className="singleCell" myData={e} myNumber={i}/>
        )
      });
      return(
        <div class="allWriteableCells">
          {allWriteableCells}
        </div>
      )
    }

  }

  class WriteableCell extends Component{
    constructor(props){
      super(props);
      this.state = {
        hours:0
      }
      this.getState=this.getState.bind(this);
      this.handleHours=this.handleHours.bind(this);
    }

    getState(){
      return this.state.hours;
    }

    handleHours(e){
      this.setState({
        hours:e.target.value
      }, () => {
        this.props.updateTotal(this.state.hours); //propaga questo cambiamento al component padre 
      });
    }

    render(){
      return(
        <span className="dayCell">
        <input id="hours" value={this.state.hours} onChange={this.handleHours}/> 
      </span>   
      )
    }
  }

  class WorkersCalendar extends Component{
    constructor(props){
      super(props);
      this.state = {
        total:0
      }
      this.updateTotal=this.updateTotal.bind(this);
    }

    updateTotal(n){
      this.setState({ //NO: sottrai il precedente e somma il nuovo
        total:this.state.total+=n
      })
    }

    render(){
      //se è disegnato il calendario e ci sono lavoratori
      if(this.props.myCalendar.length>0&&this.props.workers.length>0){
        let WorkersAndCalendars=this.props.workers.map((e, i)=>{
          return(
            <div className="singleWorker" key={e}>
            <p>{e}, totale = {this.state.total}</p>
            <WritableCalendar updateTotal={this.updateTotal} worker ={e} myCalendar={this.props.myCalendar}/>
            </div>
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
            {e}<Button value={e} onClick={this.props.removeWorker}>Rimuovi</Button>
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
            <Cell className="singleCell" myData={e} myNumber={i}/>
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
  constructor(props){
    super(props);
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
  
  render(){
    let day=this.props.myData.dayOfWeek();
    let number = this.props.myNumber+1;
    let nameEng=(day.name()); 
    let name=this.translatename(nameEng);
    return(
      <span className="dayCell">
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
      console.log("prevent default");
      event.preventDefault();
    }

    getFormData(){
      if(this.verifyData(this.state.month,this.state.year)){
        this.props.setData(this.state.month, this.state.year);
      }
    }

    /*
    componentDidMount() {
      // Direct reference to autocomplete DOM node
      // (e.g. <input ref="autocomplete" ... />
      const node = React.findDOMNode(this.refs.autocomplete);

      // Evergreen event listener || IE8 event listener
      const addEvent = node.addEventListener || node.attachEvent;
    }
    */

    render() {
      return (
        <div className="year-month-form">
          <p>Inserisci mese e anno per cui generare il calendario: </p>
          <form id="date-form" onSubmit={this.preventDefault}>
            <input id="month" placeholder="mese" type="number" value={this.state.month} onChange={this.handleMonthChange} name="mese" min="1" max="12" />
            <input id="year" placeholder="anno" type="number" value={this.state.year} onChange={this.handleYearChange} name="anno" min="2018" max="2025" />
            <input id="submit" onClick={this.getFormData} type="submit" />
            {//<button id="submit" onClick={this.props.setData}/> 
            }
          </form>        
        </div>
      );
    }
  }


  



export default App;
