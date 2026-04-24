import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus } from 'lucide-react';
import gsap from 'gsap';

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editWhyDesc, setEditWhyDesc] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('Body');
  const [deadline, setDeadline] = useState('');
  const [whyDesc, setWhyDesc] = useState('');

  const areas = ['Body', 'Mind', 'Money', 'Create', 'Connect', 'Future'];
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.gsap-fade-up', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [goals.length]);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const { data } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
    if (data) setGoals(data);
  };

  const addGoal = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const { data } = await supabase.from('goals').insert([{ 
      user_id: user.id,
      title, 
      area, 
      deadline: deadline || null,
      why_desc: whyDesc
    }]).select();
    
    if (data) {
      setGoals([data[0], ...goals]);
      setTitle('');
      setDeadline('');
      setWhyDesc('');
    }
  };

  const toggleGoal = async (id, is_completed) => {
    await supabase.from('goals').update({ is_completed: !is_completed }).eq('id', id);
    setGoals(goals.map(g => g.id === id ? { ...g, is_completed: !is_completed } : g));
  };

  const deleteGoal = async (id) => {
    await supabase.from('goals').delete().eq('id', id);
    setGoals(goals.filter(g => g.id !== id));
  };

  const startEdit = (goal) => {
    setEditingGoalId(goal.id);
    setEditTitle(goal.title);
    setEditArea(goal.area);
    setEditDeadline(goal.deadline ? goal.deadline.split('T')[0] : '');
    setEditWhyDesc(goal.why_desc || '');
  };

  const cancelEdit = () => {
    setEditingGoalId(null);
  };

  const saveEdit = async (e, id) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    const { data } = await supabase.from('goals').update({
      title: editTitle,
      area: editArea,
      deadline: editDeadline || null,
      why_desc: editWhyDesc
    }).eq('id', id).select();

    if (data) {
      setGoals(goals.map(g => g.id === id ? data[0] : g));
      setEditingGoalId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12 transition-colors duration-300" ref={containerRef}>
      <header className="gsap-fade-up">
        <h1 className="font-heading font-bold text-3xl mb-2 dark:text-white">Objectives</h1>
        <p className="font-sans text-dark/60 dark:text-white/60">Define the vector. Know the 'why'.</p>
      </header>

      <div className="gsap-fade-up bg-white dark:bg-[#1A1A1A] p-6 radius-sys border border-dark/10 dark:border-white/10 shadow-sm transition-colors hover:shadow-md">
        <h2 className="font-heading font-bold text-xl mb-4 dark:text-white">Initialize Goal</h2>
        <form onSubmit={addGoal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Objective title"
            className="bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent dark:text-white"
          />
          <select 
            value={area} 
            onChange={(e) => setArea(e.target.value)}
            className="bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent dark:text-white"
          >
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent dark:text-white text-dark/60 dark:text-white/60"
          />
          <input
            type="text"
            value={whyDesc}
            onChange={(e) => setWhyDesc(e.target.value)}
            placeholder="Why does this matter?"
            className="bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent dark:text-white"
          />
          <div className="md:col-span-2 flex justify-end mt-2">
            <button type="submit" className="bg-dark dark:bg-white text-white dark:text-dark px-6 py-2 radius-sys hover:bg-accent dark:hover:bg-accent hover:text-white transition-colors transform hover:scale-105 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span className="font-sans font-medium text-sm">Lock Target</span>
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {goals.map(goal => (
          <div key={goal.id} className={`gsap-fade-up bg-white dark:bg-[#1A1A1A] p-5 radius-sys border shadow-sm transition-all duration-300 hover:shadow-md ${goal.is_completed ? 'opacity-50 border-dark/5 dark:border-white/5' : 'border-dark/10 dark:border-white/10'}`}>
            {editingGoalId === goal.id ? (
              <form onSubmit={(e) => saveEdit(e, goal.id)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                    className="bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent dark:text-white"
                  />
                  <select 
                    value={editArea} onChange={(e) => setEditArea(e.target.value)}
                    className="bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent dark:text-white"
                  >
                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <input
                    type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)}
                    className="bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent dark:text-white text-dark/60 dark:text-white/60"
                  />
                  <input
                    type="text" value={editWhyDesc} onChange={(e) => setEditWhyDesc(e.target.value)}
                    className="bg-background dark:bg-[#111111] border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent dark:text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={cancelEdit} className="bg-dark/10 dark:bg-white/10 text-dark dark:text-white px-4 py-2 radius-sys hover:bg-dark/20 dark:hover:bg-white/20 transition-colors font-sans text-sm">Cancel</button>
                  <button type="submit" className="bg-dark dark:bg-white text-white dark:text-dark px-4 py-2 radius-sys hover:bg-accent dark:hover:bg-accent hover:text-white transition-colors font-sans text-sm">Save</button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div 
                    onClick={() => toggleGoal(goal.id, goal.is_completed)}
                    className={`w-6 h-6 mt-0.5 radius-sys border-2 cursor-pointer transition-colors flex-shrink-0 flex items-center justify-center hover:border-accent ${goal.is_completed ? 'bg-accent border-accent text-white' : 'border-dark/30 dark:border-white/30'}`}
                  >
                    {goal.is_completed && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </div>
                  <div>
                    <h3 className={`font-sans font-bold text-lg transition-colors ${goal.is_completed ? 'line-through text-dark/60 dark:text-white/60' : 'text-dark dark:text-white'}`}>{goal.title}</h3>
                    {goal.why_desc && <p className="font-sans text-sm text-dark/60 dark:text-white/60 mt-1">Why: {goal.why_desc}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-left md:text-right">
                    <span className="bg-dark/5 dark:bg-white/5 text-dark dark:text-white font-data text-xs px-2 py-1 rounded uppercase tracking-wider">{goal.area}</span>
                    {goal.deadline && (
                      <div className="font-data text-xs text-dark/40 dark:text-white/40 mt-2">
                        DUE: {new Date(goal.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <button onClick={() => startEdit(goal)} className="text-dark/40 hover:text-accent font-sans text-xs underline">Edit</button>
                    <button onClick={() => deleteGoal(goal.id)} className="text-red-500/60 hover:text-red-500 font-sans text-xs underline">Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
