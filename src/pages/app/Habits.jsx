import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus } from 'lucide-react';
import gsap from 'gsap';

export default function Habits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('Body');
  const [fullDesc, setFullDesc] = useState('');
  const [minDesc, setMinDesc] = useState('');

  const areas = ['Body', 'Mind', 'Money', 'Create', 'Connect', 'Future'];

  // Generate last 7 days
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
  }, [habits.length]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: habitsData } = await supabase.from('habits').select('*');
    if (habitsData) setHabits(habitsData);

    const { data: logsData } = await supabase
      .from('habit_logs')
      .select('*')
      .gte('completed_date', last7Days[0]);
    if (logsData) setLogs(logsData);
  };

  const addHabit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !fullDesc.trim() || !minDesc.trim()) return;
    
    const { data } = await supabase.from('habits').insert([{ 
      user_id: user.id,
      title, area, full_desc: fullDesc, min_desc: minDesc
    }]).select();
    
    if (data) {
      setHabits([...habits, data[0]]);
      setTitle(''); setFullDesc(''); setMinDesc('');
    }
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
      <header className="gsap-fade-up">
        <h1 className="font-heading font-bold text-3xl mb-2 dark:text-white">Protocol Architecture</h1>
        <p className="font-sans text-dark/60 dark:text-white/60">Define the behaviors. Execute the protocol. Track the chain.</p>
      </header>

      <div className="gsap-fade-up bg-white dark:bg-[#1A1A1A] p-6 radius-sys border border-dark/10 dark:border-white/10 shadow-sm transition-colors hover:shadow-md">
        <h2 className="font-heading font-bold text-xl mb-4 dark:text-white">Define New Protocol</h2>
        <form onSubmit={addHabit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Habit name (e.g., Physical Training)"
            className="bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent dark:text-white"
          />
          <select 
            value={area} onChange={(e) => setArea(e.target.value)}
            className="bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent dark:text-white"
          >
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input
            type="text" required value={fullDesc} onChange={(e) => setFullDesc(e.target.value)}
            placeholder="Full Standard (e.g., 45 min lifting)"
            className="bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent dark:text-white"
          />
          <input
            type="text" required value={minDesc} onChange={(e) => setMinDesc(e.target.value)}
            placeholder="Lite Minimum (e.g., 10 pushups)"
            className="bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent dark:text-white"
          />
          <div className="md:col-span-2 flex justify-end mt-2">
            <button type="submit" className="bg-dark dark:bg-white text-white dark:text-dark px-6 py-2 radius-sys hover:bg-accent dark:hover:bg-accent hover:text-white transition-colors transform hover:scale-105 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span className="font-sans font-medium text-sm">Lock Protocol</span>
            </button>
          </div>
        </form>
      </div>

      <div className="gsap-fade-up bg-white dark:bg-[#1A1A1A] p-6 radius-sys border border-dark/10 dark:border-white/10 shadow-sm overflow-x-auto transition-colors">
        <h2 className="font-heading font-bold text-xl mb-6 dark:text-white">7-Day Telemetry</h2>
        <div className="min-w-[600px]">
          <div className="grid grid-cols-8 gap-4 mb-4 font-data text-xs text-dark/40 dark:text-white/40 uppercase tracking-wider text-center">
            <div className="col-span-1 text-left">Protocol</div>
            {last7Days.map(dateStr => (
              <div key={dateStr}>{dateStr.split('-').slice(1).join('/')}</div>
            ))}
          </div>

          <div className="space-y-4">
            {habits.map(habit => (
              <div key={habit.id} className="gsap-fade-up grid grid-cols-8 gap-4 items-center">
                <div className="col-span-1 font-sans text-sm font-medium truncate pr-4 dark:text-white" title={habit.title}>
                  {habit.title}
                </div>
                {last7Days.map(dateStr => {
                  const isDone = logs.some(l => l.habit_id === habit.id && l.completed_date === dateStr);
                  return (
                    <div key={dateStr} className="flex justify-center">
                      <div 
                        onClick={() => toggleLog(habit.id, dateStr)}
                        className={`w-8 h-8 radius-sys cursor-pointer transition-colors border-2 flex items-center justify-center ${
                          isDone ? 'bg-accent border-accent text-white' : 'bg-background dark:bg-[#111111] border-dark/10 dark:border-white/10 hover:border-accent/50'
                        }`}
                      >
                        {isDone && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
