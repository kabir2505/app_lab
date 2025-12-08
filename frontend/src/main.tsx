import {StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css' //tailwind
import AppRouter from "./router";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <StrictMode>
    <BrowserRouter>
      <AppRouter/>
    </BrowserRouter>
  </StrictMode>
)

//BrowserRouter - wrapps app and enables routing
//