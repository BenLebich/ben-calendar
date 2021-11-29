import React, { Component } from "react";
import "../App.css";
import "../assets/css/Calendar.css";
import firebase from "../firebase.js";
import moment from "moment";
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';


class Todo extends Component {
  constructor() {
    super();
    this.state = {
      currentItem: "",
      username: "",
      items: [],
      month: moment().format("MMMM, YYYY"),
      monthMoment: moment(),
      thisMonth: true,
      thisMonthDate: parseInt(moment().format("D")),
      modal:{
        show: false,
        edit: false,
        value: "",
        toMany: false,
      },
      events: {},
    };

    if (localStorage.hasOwnProperty('calendar-month')) {
      this.state.month = localStorage.getItem('calendar-month')
      this.state.monthMoment = moment(localStorage.getItem('calendar-month'), "MMMM, YYYY");
      if (this.state.monthMoment.isSame(moment(), "month")) this.state.thisMonth = true;
      else this.state.thisMonth = false;
    }

    this.goNext = this.goNext.bind(this);
    this.goPrev = this.goPrev.bind(this);
    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.eventEdit = this.eventEdit.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
    this.handleEventChange = this.handleEventChange.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
  }

  deleteEvent(event) {
    console.log(event)
    this.removeEvent(event.id)
  }

  handleEventChange(e) {
    this.setState({modal: {...this.state.modal, value: e.target.value}})
  }

  handleEnter(e) {
    if (e.key === 'Enter') {
      if (e.target.value.length === 0) return;
      let date = moment(`${this.state.month} ${this.state.modal.date}`, "MMMM, YYYY D");
      
      let y = date.format("YYYY")
      let m = date.format("MMMM")
      let d = date.format("D")
      let events = this.state.events;
      if (events[y] === undefined) events[y] = {};
      if (events[y][m] === undefined) events[y][m] = {};
      if (events[y][m][d] === undefined) events[y][m][d] = [];
      if (events[y][m][d].length >= 3) {
        return this.setState({modal: {...this.state.modal, toMany: true}})
      }
      
      const event = {name: e.target.value, tree: `${y},${m},${d}`}

      const eventsRef = firebase.database().ref("events");
      eventsRef.push(event);

      
      //events[y][m][d].push(event);
      this.setState({modal: {...this.state.modal, value: ""}})
      //this.setState({events})
      
    }
  }

  eventEdit() {
    this.setState({modal: {...this.state.modal, edit: true}})
  }

  showModal(e) {
    this.setState({modal: {...this.state.modal, edit: false, toMany: false, show: true, date: e.target.getAttribute("date")}})
  }

  closeModal() {
    this.setState({modal: {...this.state.modal, show: false}})
  }

  goNext() {
    let m = this.state.monthMoment;
    m.add(1, "month")
    let thisMonth = false;
    if (m.isSame(moment(), "month")) thisMonth = true;
    this.setState({
      month: m.format("MMMM, YYYY"),
      monthMoment: m,
      thisMonth
    })
    localStorage.setItem("calendar-month", m.format("MMMM, YYYY"))

  }

  goPrev() {
    let m = this.state.monthMoment;
    m.subtract(1, "month")
    let thisMonth = false;
    if (m.isSame(moment(), "month")) thisMonth = true;
    this.setState({
      month: m.format("MMMM, YYYY"),
      monthMoment: m,
      thisMonth
    })
    localStorage.setItem("calendar-month", m.format("MMMM, YYYY"))
  }


  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const itemsRef = firebase.database().ref("items");
    const item = {
      title: this.state.currentItem,
      user: this.state.username,
    };
    itemsRef.push(item);
    this.setState({
      currentItem: "",
      username: "",
    });
  }

  componentDidMount() {
    const eventsRef = firebase.database().ref("events");
    eventsRef.on("value", (snapshot) => {
      let events = snapshot.val();
      let newEvents = [];
      for (let event in events) {
        let ymd = events[event].tree.split(",");
        let y = ymd[0]
        let m = ymd[1]
        let d = ymd[2]
        if (newEvents[y] === undefined) newEvents[y] = {};
        if (newEvents[y][m] === undefined) newEvents[y][m] = {};
        if (newEvents[y][m][d] === undefined) newEvents[y][m][d] = [];
        events[event].id = event;
        newEvents[y][m][d].push(events[event]);
      }
      this.setState({
        events: newEvents,
      });
    });
  }

  removeEvent(id) {
    const eventRef = firebase.database().ref(`/events/${id}`);
    eventRef.remove();
  }

  render() {
    console.log(this.state.events)
    let dim = this.state.monthMoment.daysInMonth();
    let modalDate = moment(`${this.state.month} ${this.state.modal.date}`, "MMMM, YYYY D").format("LL")
    
    let month = moment(`${this.state.month} ${this.state.modal.date}`, "MMMM, YYYY D").format("MMMM")
    let year = moment(`${this.state.month} ${this.state.modal.date}`, "MMMM, YYYY D").format("YYYY")

    let modalEvents;
    try {
      modalEvents = this.state.events[year][month][this.state.modal.date]
      if (modalEvents === undefined) modalEvents = []
    } catch (err) {
      modalEvents = [];
    }

    let dimEvents = [];
    for (let i = 1; i <= dim; i++) {
      try {
        let events = this.state.events[year][month][i];
        if (events !== undefined) dimEvents.push(events);
        else dimEvents.push([])
      } catch (err) {
        dimEvents.push([])
      }
    }
    console.log(dimEvents)

    console.log(month, year)
    return (
      <div className="app">
        <header>
          <div className="wrapper">
            <h1>Ben's Calendar</h1>
          </div>
        </header>
        <div className="wrapper">
          <div className="calendar-head">
            <h1 className="calendar-title">{this.state.month}</h1>
            <div className="calendar-nav">
              <button className="button" onClick={this.goPrev}>Prev</button>
              <button className="button" onClick={this.goNext}>Next</button>
            </div>
          </div>
          <div className="calendar-body">
            {
              dimEvents.map((events, i) => (
                <div 
                className={`calendar-day ${(this.state.thisMonth && (i+1) === this.state.thisMonthDate) ? "current-day" : ""}`} 
                >
                  <div className="calendar-day-header">
                    <button className="day" onClick={this.showModal} date={i+1}>{i+1}</button>
                  </div>
                  <div className="day-elements">
                    {
                      events.map((event, k) => (<div className="day-event">{event.name}</div>))
                    }
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <Modal show={this.state.modal.show} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>{modalDate}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="day-elements">
              {
                modalEvents.map((event, k) => (
                  <div className="day-event">
                    <span>{event.name}</span>
                    <span style={{position: "absolute", padding: "0px 20px 0px 20px", right: 15}} onClick={(e) => this.deleteEvent(event)} index={k}>
                      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                        width="15" height="15"
                        viewBox="0 0 24 24"
                        style={{fill: "#103D5D"}}>
                        <path d="M 4.7070312 3.2929688 L 3.2929688 4.7070312 L 10.585938 12 L 3.2929688 19.292969 L 4.7070312 20.707031 L 12 13.414062 L 19.292969 20.707031 L 20.707031 19.292969 L 13.414062 12 L 20.707031 4.7070312 L 19.292969 3.2929688 L 12 10.585938 L 4.7070312 3.2929688 z"></path>
                      </svg>
                    </span>
                </div>))
              }

              {
                (modalEvents.length < 3) ?
                (this.state.modal.edit) ? <input autoFocus placeHolder="Add Event" className="day-add-event" value={this.state.modal.value} onChange={this.handleEventChange} onKeyDown={this.handleEnter}/>:
                <div className="day-add-event" onClick={this.eventEdit}>Add Event</div>
                : ""
              }
              
            </div>
          </Modal.Body>
          {(this.state.modal.toMany) ? 
              <Alert variant="danger" style={{margin: "17px"}}>
                Only 3 events are allowed per day!
              </Alert>
            : ""
          }
          
        </Modal>
      </div>
    );
  }
}

export default Todo;
