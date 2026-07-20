import { useState } from "react";
import { useTasks } from "./hooks/useTasks";
import { RouletteScreen } from "./components/RouletteScreen";
import { TaskListScreen } from "./components/TaskListScreen";
import { TabBar, type Tab } from "./components/TabBar";

function App() {
  const [tab, setTab] = useState<Tab>("roulette");
  const {
    tasks,
    remaining,
    weeklyRemaining,
    monthlyRemaining,
    addTask,
    deleteTask,
    markDone,
    markUndone,
    setTaskEnabled,
    setTaskCategory,
  } = useTasks();

  return (
    <div className="app">
      <header className="app-header">
        <h1>家事ルーレット</h1>
      </header>

      <main className="app-main">
        {tab === "roulette" ? (
          <RouletteScreen
            remaining={remaining}
            weeklyRemaining={weeklyRemaining}
            monthlyRemaining={monthlyRemaining}
            markDone={markDone}
          />
        ) : (
          <TaskListScreen
            tasks={tasks}
            addTask={addTask}
            deleteTask={deleteTask}
            markDone={markDone}
            markUndone={markUndone}
            setTaskEnabled={setTaskEnabled}
            setTaskCategory={setTaskCategory}
          />
        )}
      </main>

      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}

export default App;
