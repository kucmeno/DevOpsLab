import React from 'react';
import logo from './logo.svg';
import './App.css';
import './App.css';
import axios from 'axios';

function App() {
  const handleClick = async () => {
    const helloResp = await axios.get('/api/');
    document.getElementById("mes").textContent = helloResp.data;
    console.log(helloResp);
  }
  const checkPesel = async () =>{
    const pesel = document.getElementById("PESEL").value;
    const response = await axios.get('/api/pesel/' + pesel);
    console.log(response + " :: " + pesel);
    document.getElementById("mes").textContent = response.data;
  }
  const flushRedisKeys = async () => {
    const response = await axios.get('/api/flushRedisKeys');
    document.getElementById("mes").textContent = response.data;
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p id ="mes"></p>        
        <div class="form-inline">
          <div class="form-group mx-sm-3 mb-2">
            <input type="text" class="form-control" id="PESEL" placeholder="PESEL"/>
          </div>
          <button on onClick={checkPesel} type="button" class="btn btn-primary mb-2">Sprawdź PESEL</button>
        </div>

        <button on onClick={flushRedisKeys} type="button" class="btn btn-warning btn-block">Czyszczenie kluczy w redis</button>
        <button on onClick={handleClick} type="button" class="btn btn-success btn-block">Say Hello</button>
      </header>
    </div>
  );
}

export default App;
