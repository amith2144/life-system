import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { ChevronLeft, ChevronRight, Plus, X, Info, Calendar as CalendarIcon, Filter, Search, Maximize2, Settings, ChevronDown, AlignLeft, ArrowRight, XCircle } from 'lucide-react';
import gsap from 'gsap';

export default function Planner() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const containerRef = useRef(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('Mind');
  const [priority, setPriority] = useState('Medium');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  const areas = ['Body', 'Mind', 'Money', 'Create', 'Connect', 'Future'];
  const priorities = ['Low', 'Medium', 'High'];

  useEffect(() => {
    fetchTasks();
  }, [currentDate]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.gsap-fade-up', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*, goals(title)')
      .order('created_at', { ascending: false });
      
    if (data) {
      setTasks(data);
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const toggleTaskStatus = async (e, id, currentStatus) => {
    e.stopPropagation();
    await supabase.from('tasks').update({ is_completed: !currentStatus }).eq('id', id);
    setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
  };

  const openModal = (task = null, initialDateStr = null) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setArea(task.area);
      setPriority(task.priority || 'Medium');
      setStartDate(task.start_date || '');
      setEndDate(task.end_date || '');
      setDescription(task.description || '');
    } else {
      setEditingTask(null);
      setTitle('');
      setArea('Mind');
      setPriority('Medium');
      setStartDate(initialDateStr || '');
      setEndDate(initialDateStr || '');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const saveTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title,
      area,
      priority,
      start_date: startDate || null,
      end_date: endDate || null,
      description,
      user_id: user.id
    };

    if (editingTask) {
      const { data } = await supabase.from('tasks').update(payload).eq('id', editingTask.id).select('*, goals(title)');
      if (data) {
        setTasks(tasks.map(t => t.id === editingTask.id ? data[0] : t));
        closeModal();
      }
    } else {
      const { data } = await supabase.from('tasks').insert([payload]).select('*, goals(title)');
      if (data) {
        setTasks([data[0], ...tasks]);
        closeModal();
      }
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[160px] bg-dark/5 dark:bg-[#1A1A1A] border-b border-r border-dark/10 dark:border-white/5 p-2 opacity-50"></div>);
    }

    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      
      const dayTasks = tasks.filter(t => {
        if (!t.start_date) return false;
        const start = new Date(t.start_date).getTime();
        const end = t.end_date ? new Date(t.end_date).getTime() : start;
        const current = new Date(dateStr).getTime();
        return current >= start && current <= end;
      });

      days.push(
        <div key={d} className="min-h-[160px] bg-background dark:bg-[#111111] border-b border-r border-dark/10 dark:border-white/5 p-2 flex flex-col group relative transition-colors hover:bg-dark/5 dark:hover:bg-white/5">
          <div className="flex justify-between items-start mb-2">
            <button 
              onClick={() => openModal(null, dateStr)}
              className="opacity-0 group-hover:opacity-100 p-1 text-dark/40 dark:text-white/40 hover:text-dark dark:hover:text-white transition-opacity"
            >
              <Plus className="w-4 h-4" />
            </button>
            <span className={`font-sans text-sm ${isToday ? 'bg-accent text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-dark/60 dark:text-white/60'}`}>
              {d}
            </span>
          </div>
          
          <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
            {dayTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => openModal(task)}
                className={`flex flex-col p-2 rounded-lg cursor-pointer border transition-colors ${
                  task.is_completed 
                    ? 'bg-dark/5 dark:bg-white/5 border-transparent opacity-50' 
                    : 'bg-white dark:bg-[#252525] border-dark/5 dark:border-white/10 hover:border-dark/20 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-1.5 mb-1">
                  <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-dark/40 dark:text-white/40 flex-shrink-0" />
                  <span className={`font-sans text-xs font-semibold truncate leading-tight ${task.is_completed ? 'line-through text-dark/60 dark:text-white/60' : 'text-dark dark:text-white'}`}>
                    {task.title}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-[10px] text-dark/50 dark:text-white/50 mb-1.5 ml-5">
                  <XCircle className="w-3 h-3 text-red-500/70" />
                  <span className="truncate">{task.goals?.title ? task.goals.title : 'No related project'}</span>
                </div>
                
                <div className="flex items-center justify-between ml-5">
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={(e) => toggleTaskStatus(e, task.id, task.is_completed)}
                      className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${
                        task.is_completed ? 'bg-accent border-accent text-white' : 'border-dark/30 dark:border-white/30 hover:border-accent'
                      }`}
                    >
                      {task.is_completed && <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </button>
                    {task.priority === 'High' && (
                      <span className="bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] px-1 rounded font-medium">High</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Fill remaining cells to complete the grid week
    const totalCells = days.length;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remainingCells; i++) {
      days.push(<div key={`empty-end-${i}`} className="min-h-[160px] bg-dark/5 dark:bg-[#1A1A1A] border-b border-r border-dark/10 dark:border-white/5 p-2 opacity-50"></div>);
    }

    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6" ref={containerRef}>
      
      {/* Top Planner Header */}
      <div className="gsap-fade-up flex items-center mb-2">
        <div className="bg-dark text-white dark:bg-[#252525] dark:text-white px-4 py-1.5 rounded-t-lg flex items-center gap-2 text-sm font-semibold border-b-2 border-accent inline-flex">
          <CalendarIcon className="w-4 h-4" />
          Task Calendar
        </div>
      </div>

      {/* Info Alert */}
      <div className="gsap-fade-up bg-dark/5 dark:bg-[#1E1E1E] border border-dark/10 dark:border-white/10 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-dark/60 dark:text-white/60 flex-shrink-0 mt-0.5" />
        <p className="text-dark/80 dark:text-white/80 text-sm font-sans italic leading-relaxed">
          The Task Calendar provides a visual overview of your tasks, helping you easily track deadlines and plan your week effectively.
        </p>
      </div>

      {/* Toolbar */}
      <div className="gsap-fade-up flex flex-wrap items-center justify-between gap-4 py-2 border-b border-dark/10 dark:border-white/10">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-dark/60 dark:text-white/60 hover:text-dark dark:hover:text-white transition-colors">
            <CalendarIcon className="w-4 h-4" />
            This Week
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-background dark:bg-[#111111] border border-accent rounded-full text-accent shadow-sm">
            <CalendarIcon className="w-4 h-4" />
            This Month
          </button>
          <div className="w-px h-4 bg-dark/20 dark:bg-white/20 mx-1"></div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-dark/60 dark:text-white/60 hover:text-dark dark:hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
            Pending
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-dark/50 dark:text-white/50 hidden md:block">No date ({tasks.filter(t => !t.start_date).length})</span>
          <button className="p-1.5 text-dark/50 dark:text-white/50 hover:text-dark dark:hover:text-white"><AlignLeft className="w-4 h-4" /></button>
          <button className="p-1.5 text-dark/50 dark:text-white/50 hover:text-dark dark:hover:text-white"><Filter className="w-4 h-4" /></button>
          <button className="p-1.5 text-dark/50 dark:text-white/50 hover:text-dark dark:hover:text-white"><Search className="w-4 h-4" /></button>
          <button className="p-1.5 text-dark/50 dark:text-white/50 hover:text-dark dark:hover:text-white"><Maximize2 className="w-4 h-4" /></button>
          <button className="p-1.5 text-dark/50 dark:text-white/50 hover:text-dark dark:hover:text-white"><Settings className="w-4 h-4" /></button>
          
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium ml-2 transition-colors"
          >
            New <ChevronDown className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="gsap-fade-up flex items-center gap-3 mt-4">
        <div className="flex items-center gap-2 bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 px-3 py-1 rounded-md text-xs font-medium cursor-pointer">
          <div className="w-3 h-3 bg-blue-500 rounded-sm flex items-center justify-center text-white"><svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
          : Unchecked <ChevronDown className="w-3 h-3" />
        </div>
        <button className="text-xs text-dark/50 dark:text-white/50 flex items-center gap-1 hover:text-dark dark:hover:text-white">
          <Plus className="w-3 h-3" /> Filter
        </button>
      </div>

      {/* Calendar Header Row */}
      <div className="gsap-fade-up flex items-center justify-between mt-8 mb-4">
        <h2 className="font-sans font-bold text-lg text-dark dark:text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-dark/20 dark:border-white/20 rounded-md hover:bg-dark/5 dark:hover:bg-white/5 transition-colors">
            <CalendarIcon className="w-3.5 h-3.5" /> Manage in Calendar
          </button>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1 text-dark/60 dark:text-white/60 hover:text-dark dark:hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={goToday} className="px-2 text-sm font-medium text-dark/80 dark:text-white/80 hover:text-dark dark:hover:text-white">Today</button>
            <button onClick={nextMonth} className="p-1 text-dark/60 dark:text-white/60 hover:text-dark dark:hover:text-white"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="gsap-fade-up bg-white dark:bg-[#1A1A1A] border-t border-l border-dark/10 dark:border-white/5 rounded-tl-xl rounded-tr-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-dark/10 dark:border-white/5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-sans text-xs text-dark/40 dark:text-white/40 py-2 border-r border-dark/10 dark:border-white/5 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-dark/10 dark:bg-white/10">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1A1A] radius-sys max-w-lg w-full p-6 border border-dark/10 dark:border-white/10 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1 text-dark/40 dark:text-white/40 hover:text-dark dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-heading font-bold text-2xl mb-6">{editingTask ? 'Edit Task' : 'New Task'}</h2>
            
            <form onSubmit={saveTask} className="space-y-4">
              <div>
                <label className="block font-sans text-sm font-medium mb-1 opacity-80">Title</label>
                <input
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background dark:bg-dark border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-sm font-medium mb-1 opacity-80">Area</label>
                  <select 
                    value={area} onChange={(e) => setArea(e.target.value)}
                    className="w-full bg-background dark:bg-dark border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent"
                  >
                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium mb-1 opacity-80">Priority</label>
                  <select 
                    value={priority} onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-background dark:bg-dark border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent"
                  >
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-sm font-medium mb-1 opacity-80">Start Date</label>
                  <input
                    type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-background dark:bg-dark border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium mb-1 opacity-80">End Date</label>
                  <input
                    type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-background dark:bg-dark border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-sm font-medium mb-1 opacity-80">Execution Notes</label>
                <textarea
                  rows="4"
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="How to proceed..."
                  className="w-full bg-background dark:bg-dark border border-dark/20 dark:border-white/20 radius-sys px-4 py-2 font-sans text-sm outline-none focus:border-accent resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-6 py-2 radius-sys font-sans text-sm border border-dark/20 dark:border-white/20 hover:bg-dark/5 dark:hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-dark dark:bg-white text-white dark:text-dark px-6 py-2 radius-sys font-sans font-bold text-sm hover:bg-accent dark:hover:bg-accent hover:text-white transition-colors">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
