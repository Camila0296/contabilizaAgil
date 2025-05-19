import React from 'react';
import './styles/App.css';
import ExampleComponent from './components/ExampleComponent';

const App: React.FC = () => {
    return (
        <div className="App">
            <h1>My React Frontend</h1>
            <ExampleComponent title="Título de ejemplo" description="Descripción de ejemplo" />

        </div>
    );
};

export default App;