/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameContainer } from './game/GameContainer';

export default function App() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 select-none">
      <GameContainer />
    </main>
  );
}

