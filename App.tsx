import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';  // Ensure you are importing the store from redux/store
import AppContent from './AppContent';
   // The component where you're using Redux state

const App = () => (
  <Provider store={store}>  {/* Wrap your components with the Provider */}
    <AppContent />
  </Provider>
);

export default App;
