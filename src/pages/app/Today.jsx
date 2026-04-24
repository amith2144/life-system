import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import gsap from 'gsap';

export default function Today() {
  const { user, liteMode } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [taskArea, setTaskArea] = useState('Mind');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskGoalId, setTaskGoalId] = useState('');
  
  const areas = ['Body', 'Mind', 'Money', 'Create', 'Connect', 'Future'];
  const priorities = ['Low', 'Medium', 'High'];

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.gsap-fade-up', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [tasks.length, habits.length]);

  useEffect(() => {
    fetchTasks();
    fetchHabitsAndLogs();
    fetchGoals();
  }, []);

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*, goals(title)').order('created_at', { ascending: false });
    if (data) setTasks(data);
  };

  const fetchHabitsAndLogs = async () => {
    const { data: hData } = await supabase.from('habits').select('*');
    if (hData) setHabits(hData);
    
    const { data: lData } = await supabase
      .from('habit_logs')
      .select('*')
      .gte('completed_date', last7Days[0]);
    if (lData) setLogs(lData);
  };

  const fetchGoals = async () => {
    const { data } = await supabase.from('goals').select('*').eq('is_completed', false);
    if (data) setGoals(data);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const { data } = await supabase.from('tasks').insert([{ 
      title: newTask, 
      area: taskArea, 
      priority: taskPriority,
      goal_id: taskGoalId || null,
      user_id: user.id 
    }]).select('*, goals(title)');
    
    if (data) {
      setTasks([data[0], ...tasks]);
      setNewTask('');
    }
  };

  const toggleTask = async (id, is_completed) => {
    await supabase.from('tasks').update({ is_completed: !is_completed }).eq('id', id);
    setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !is_completed } : t));
  };

  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleLog = async (habitId, dateStr) => {
    const existingLog = logs.find(l => l.habit_id === habitId && l.completed_date === dateStr);
    if (existingLog) {
      await supabase.from('habit_logs').delete().eq('id', existingLog.id);
      setLogs(logs.filter(l => l.id !== existingLog.id));
    } else {
      const { data } = await supabase.from('habit_logs').insert([{ 
        user_id: user.id, habit_id: habitId, completed_date: dateStr 
      }]).select();
      if (data) setLogs([...logs, data[0]]);
    }
  };

  return (
    <div className="space-y-8 pb-12 transition-colors duration-300" ref={containerRef}>
      <header className="gsap-fade-up flex justify-between items-end">
        <div>
          <h1 className="font-heading font-bold text-3xl mb-2 dark:text-white">Today</h1>
          <p className="font-sans text-dark/60 dark:text-white/60">
            {liteMode ? 'Lite Mode Active. Focus on the bare minimum.' : 'Full system active. Execute the protocol.'}
          </p>
        </div>
        <div className="font-data text-sm text-dark/40 dark:text-white/40 hidden md:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks */}
        <div className="space-y-8">
          <div className="gsap-fade-up bg-white dark:bg-[#1A1A1A] p-6 radius-sys border border-dark/10 dark:border-white/10 shadow-sm transition-colors hover:shadow-md">
            <h2 className="font-heading font-bold text-xl mb-4 dark:text-white">Active Tasks</h2>
            
            <form onSubmit={addTask} className="space-y-4 mb-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="New task..."
                  className="flex-1 bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm focus:outline-none focus:border-accent dark:text-white"
                />
                <button type="submit" className="bg-dark dark:bg-white text-white dark:text-dark px-4 py-2 radius-sys hover:bg-accent dark:hover:bg-accent hover:text-white transition-colors transform hover:scale-105">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <select 
                  value={taskArea} 
                  onChange={(e) => setTaskArea(e.target.value)}
                  className="bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-3 py-2 font-sans text-sm outline-none dark:text-white"
                >
                  {areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <select 
                  value={taskPriority} 
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-3 py-2 font-sans text-sm outline-none dark:text-white"
                >
                  {priorities.map(p => <option key={p} value={p}>{p} Priority</option>)}
                </select>
                <select 
                  value={taskGoalId} 
                  onChange={(e) => setTaskGoalId(e.target.value)}
                  className="bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-3 py-2 font-sans text-sm outline-none max-w-[200px] truncate dark:text-white"
                >
                  <option value="">No Goal Attached</option>
                  {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
              </div>
            </form>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-sm text-dark/50 dark:text-white/50 italic py-4 text-center">No tasks for today.</div>
              ) : tasks.filter(t => !t.is_completed).map(task => (
                <div key={task.id} className="gsap-fade-up flex items-start space-x-3 p-4 bg-background dark:bg-[#111111] radius-sys border border-dark/5 dark:border-white/5 transition-transform hover:-translate-y-1 hover:shadow-sm">
                  <div 
                    onClick={() => toggleTask(task.id, task.is_completed)}
                    className={`w-5 h-5 mt-0.5 radius-sys border-2 cursor-pointer flex-shrink-0 transition-colors ${task.is_completed ? 'bg-accent border-accent' : 'border-dark/30 dark:border-white/30 hover:border-accent'}`}
                  ></div>
                  <div className="flex-1">
                    <div className={`font-sans text-sm font-medium ${task.is_completed ? 'line-through text-dark/40 dark:text-white/40' : 'text-dark dark:text-white'}`}>
                      {task.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="font-data text-xs text-dark/40 dark:text-white/40 uppercase">{task.area}</span>
                      {task.priority && (
                        <span className={`font-data text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          task.priority === 'High' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                          task.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                          'bg-green-500/10 text-green-600 dark:text-green-400'
                        }`}>
                          {task.priority}
                        </span>
                      )}
                      {task.goals?.title && (
                        <span className="font-data text-xs bg-dark/5 dark:bg-white/5 text-dark/60 dark:text-white/60 px-1.5 py-0.5 rounded truncate max-w-[150px]">
                          Goal: {task.goals.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Task"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="gsap-fade-up bg-dark dark:bg-[#1A1A1A] text-white p-6 radius-sys border border-dark/10 dark:border-white/10 shadow-sm relative overflow-hidden transition-colors hover:shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-20 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
            <h2 className="font-heading font-bold text-xl mb-6 relative z-10">System Velocity</h2>
            <div className="h-48 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7Days.map(dateStr => {
                  const dateObj = new Date(dateStr);
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const completedOnDay = logs.filter(l => l.completed_date === dateStr).length;
                  const totalHabits = habits.length;
                  const completion = totalHabits === 0 ? 0 : Math.round((completedOnDay / totalHabits) * 100);
                  return { name: dayName, completion };
                })}>
                  <defs>
                    <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E63B2E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E63B2E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111111', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#E63B2E' }}
                  />
                  <Area type="monotone" dataKey="completion" stroke="#E63B2E" strokeWidth={2} fillOpacity={1} fill="url(#colorVelocity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Habits */}
        <div className="space-y-8">
          <div className="gsap-fade-up bg-white dark:bg-[#1A1A1A] p-6 radius-sys border border-dark/10 dark:border-white/10 shadow-sm transition-colors hover:shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-heading font-bold text-xl dark:text-white">Daily Habits</h2>
                <p className="font-sans text-xs text-dark/50 dark:text-white/50 mt-1">Consistency is the vector.</p>
              </div>
              {liteMode && <span className="bg-accent/10 text-accent font-data text-xs px-2 py-1 rounded border border-accent/20">LITE</span>}
            </div>
            
            <div className="space-y-3">
              {habits.length === 0 ? (
                <div className="text-sm text-dark/50 dark:text-white/50 italic text-center py-4">No habits defined. Go to the Goals tab.</div>
              ) : habits.map(habit => {
                const todayStr = last7Days[6]; // last7Days is ordered oldest to newest, so index 6 is today
                const isDone = logs.some(l => l.habit_id === habit.id && l.completed_date === todayStr);
                
                return (
                  <div key={habit.id} className="gsap-fade-up flex items-center space-x-4 p-4 bg-background dark:bg-[#111111] radius-sys border border-dark/5 dark:border-white/5 transition-transform hover:-translate-y-1 hover:shadow-sm cursor-pointer" onClick={() => toggleLog(habit.id, todayStr)}>
                    <div 
                      className={`w-6 h-6 radius-sys border-2 flex items-center justify-center transition-colors ${
                        isDone ? 'bg-accent border-accent text-white' : 'border-dark/20 dark:border-white/20 hover:border-accent/50'
                      }`}
                    >
                      {isDone && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <div>
                      <div className={`font-sans font-medium text-sm transition-colors ${isDone ? 'text-dark/40 dark:text-white/40 line-through' : 'text-dark dark:text-white'}`}>
                        {habit.title}
                      </div>
                      <div className="font-sans text-xs text-dark/50 dark:text-white/50 mt-0.5 line-clamp-1">
                        {liteMode ? habit.min_desc : habit.full_desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
