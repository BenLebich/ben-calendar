import React, { Component } from "react";
import {
  Routes,
  Route,
} from "react-router-dom";
import Todo from "./views/Todo";
import Calendar from "./views/Calendar";
import Login from "./views/Login";

class App extends Component {
  render() {
    return (
      <Routes>
        <Route path="/" element={<Calendar />} />
        <Route path="/todo" element={<Todo />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }
}
export default App;
