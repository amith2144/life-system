import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, Plus } from 'lucide-react';
import gsap from 'gsap';
import { useRef } from 'react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [taskArea, setTaskArea] = useState('Mind');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskGoalId, setTaskGoalId] = useState('');
  const [dbError, setDbError] = useState(false);

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
  }, [tasks.length]);

  useEffect(() => {
    fetchTasks();
    fetchHabitsAndLogs();
    fetchGoals();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, goals(title)')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist
          setDbError(true);
        } else {
          console.error(error);
        }
      } else {
        setTasks(data || []);
      }
    } catch (err) {
      console.error(err);
    }
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

    try {
      // Security 4.1: Server validates the input types. RLS ensures user_id matches auth.uid()
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ 
          title: newTask, 
          area: taskArea, 
          priority: taskPriority,
          goal_id: taskGoalId || null,
          user_id: user.id 
        }])
        .select('*, goals(title)');

      if (!error && data) {
        setTasks([data[0], ...tasks]);
        setNewTask('');
      } else if (error?.code === '42P01') {
        setDbError(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTask = async (id, is_completed) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !is_completed })
      .eq('id', id);

    if (!error) {
      setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !is_completed } : t));
    }
  };

  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="bg-background dark:bg-dark min-h-screen text-dark dark:text-background selection:bg-accent selection:text-white pb-24 transition-colors duration-300" ref={containerRef}>
      <div className="noise-overlay"></div>
      
      {/* Topbar */}
      <nav className="gsap-fade-up w-full bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-md border-b border-dark/10 dark:border-white/10 px-6 py-4 flex justify-between items-center relative z-10 sticky top-0 transition-colors">
        <div className="font-heading font-bold text-xl dark:text-white">Life OS</div>
        <div className="flex items-center space-x-4">
          <span className="font-data text-xs text-dark/50 dark:text-white/50 hidden md:block">{user?.email}</span>
          <button onClick={signOut} className="text-dark/60 dark:text-white/60 hover:text-accent transition-colors flex items-center space-x-1 font-sans text-sm font-medium">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 mt-12 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {dbError && (
          <div className="gsap-fade-up lg:col-span-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 radius-sys mb-4">
            <strong className="font-bold">Database not initialized!</strong>
            <span className="block sm:inline"> Please run the SQL schema located in <code className="bg-white/50 px-1 rounded">supabase/schema.sql</code> in your Supabase SQL editor.</span>
          </div>
        )}

        {/* Left Column: Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="gsap-fade-up bg-white dark:bg-[#1A1A1A] radius-sys border border-dark/10 dark:border-white/10 p-6 shadow-sm transition-colors hover:shadow-md">
            <h2 className="font-heading font-bold text-2xl mb-6 dark:text-white">Today's Focus</h2>
            
            <form onSubmit={addTask} className="space-y-4 mb-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="What needs to be done?"
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
              {tasks.length === 0 && !dbError ? (
                <div className="text-center py-8 text-dark/40 dark:text-white/40 font-sans text-sm">No tasks pending. System idle.</div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="gsap-fade-up flex items-start space-x-3 p-4 bg-background dark:bg-[#111111] radius-sys border border-dark/5 dark:border-white/5 transition-transform hover:-translate-y-1 hover:shadow-sm">
                    <div 
                      onClick={() => toggleTask(task.id, task.is_completed)}
                      className={`w-5 h-5 mt-0.5 radius-sys border-2 cursor-pointer flex-shrink-0 transition-colors ${task.is_completed ? 'bg-accent border-accent' : 'border-dark/30 hover:border-accent'}`}
                    ></div>
                    <div className="flex-1">
                      <div className={`font-sans text-sm ${task.is_completed ? 'line-through text-dark/40 dark:text-white/40' : 'text-dark dark:text-white'}`}>
                        {task.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="font-data text-xs text-dark/40 dark:text-white/40 uppercase">{task.area}</span>
                        {task.priority && (
                          <span className={`font-data text-xs px-1.5 py-0.5 rounded ${
                            task.priority === 'High' ? 'bg-red-500/10 text-red-600' :
                            task.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-600' :
                            'bg-green-500/10 text-green-600'
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
                      className="text-red-500/50 hover:text-red-500 transition-colors ml-2"
                      title="Delete Task"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Analytics */}
        <div className="space-y-6">
          <div className="gsap-fade-up bg-dark dark:bg-[#1A1A1A] text-white p-6 radius-sys border border-dark/10 dark:border-white/10 shadow-sm relative overflow-hidden transition-colors hover:shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-20 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
            <h2 className="font-heading font-bold text-xl mb-6 relative z-10">System Velocity</h2>
            <div className="h-48 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last7Days.map(dateStr => {
                  const dateObj = new Date(dateStr);
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const completedOnDay = logs.filter(l => l.completed_date === dateStr).length;
                  const totalHabits = habits.length;
                  const completion = totalHabits === 0 ? 0 : Math.round((completedOnDay / totalHabits) * 100);
                  return { name: dayName, completion };
                })}>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111111', borderColor: '#333', borderRadius: '1rem', color: '#E8E4DD' }}
                    itemStyle={{ color: '#E63B2E' }}
                  />
                  <Line type="monotone" dataKey="completion" stroke="#E63B2E" strokeWidth={3} dot={{ r: 4, fill: '#E63B2E' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 font-sans text-sm text-white/60 text-center relative z-10">
              7-Day Completion Velocity
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
